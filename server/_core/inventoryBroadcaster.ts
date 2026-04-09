import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

/**
 * Inventory update event sent to clients
 */
export interface InventoryUpdateEvent {
  type: "inventory.updated";
  businessId: number;
  productId: number;
  newStock: number;
  previousStock: number;
  timestamp: number;
}

/**
 * Manages WebSocket connections and broadcasts inventory updates
 * Ensures business isolation - clients only receive updates for their business
 */
export class InventoryBroadcaster {
  private wss: WebSocketServer;
  private clientsByBusiness: Map<number, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ noServer: true });

    // Handle upgrade requests
    server.on("upgrade", (request, socket, head) => {
      if (request.url === "/api/ws/inventory") {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.wss.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    this.wss.on("connection", (ws: WebSocket) => {
      console.log("[WebSocket] New client connected");

      // Handle incoming messages (client subscribes to business)
      ws.on("message", (data: string) => {
        try {
          const message = JSON.parse(data);
          if (message.type === "subscribe" && message.businessId) {
            this.subscribeClient(ws, message.businessId);
            ws.send(
              JSON.stringify({
                type: "subscribed",
                businessId: message.businessId,
              })
            );
          }
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
        }
      });

      // Handle client disconnect
      ws.on("close", () => {
        this.unsubscribeClient(ws);
        console.log("[WebSocket] Client disconnected");
      });

      // Handle errors
      ws.on("error", (error) => {
        console.error("[WebSocket] Client error:", error);
        this.unsubscribeClient(ws);
      });
    });

    console.log("[WebSocket] Inventory broadcaster initialized");
  }

  /**
   * Subscribe a client to inventory updates for a specific business
   */
  private subscribeClient(ws: WebSocket, businessId: number): void {
    if (!this.clientsByBusiness.has(businessId)) {
      this.clientsByBusiness.set(businessId, new Set());
    }
    this.clientsByBusiness.get(businessId)!.add(ws);
    console.log(
      `[WebSocket] Client subscribed to business ${businessId}. Total: ${this.clientsByBusiness.get(businessId)!.size}`
    );
  }

  /**
   * Unsubscribe a client from all businesses
   */
  private unsubscribeClient(ws: WebSocket): void {
    const entries = Array.from(this.clientsByBusiness.entries());
    for (const [businessId, clients] of entries) {
      if (clients.has(ws)) {
        clients.delete(ws);
        console.log(
          `[WebSocket] Client unsubscribed from business ${businessId}. Total: ${clients.size}`
        );
        if (clients.size === 0) {
          this.clientsByBusiness.delete(businessId);
        }
      }
    }
  }

  /**
   * Broadcast inventory update to all clients subscribed to a business
   */
  public broadcastInventoryUpdate(event: InventoryUpdateEvent): void {
    const clients = this.clientsByBusiness.get(event.businessId);
    if (!clients || clients.size === 0) {
      return; // No subscribers for this business
    }

    const message = JSON.stringify(event);
    let successCount = 0;
    let failureCount = 0;

    const clientsArray = Array.from(clients);
    for (const client of clientsArray) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message, (error?: Error) => {
          if (error) {
            failureCount++;
            console.error("[WebSocket] Failed to send update:", error);
            this.unsubscribeClient(client);
          } else {
            successCount++;
          }
        });
      }
    }

    console.log(
      `[WebSocket] Broadcast to business ${event.businessId}: ${successCount} sent, ${failureCount} failed`
    );
  }

  /**
   * Get number of connected clients for a business
   */
  public getClientCount(businessId: number): number {
    return this.clientsByBusiness.get(businessId)?.size ?? 0;
  }

  /**
   * Get total connected clients across all businesses
   */
  public getTotalClientCount(): number {
    let total = 0;
    const values = Array.from(this.clientsByBusiness.values());
    for (const clients of values) {
      total += clients.size;
    }
    return total;
  }

  /**
   * Shutdown the broadcaster
   */
  public shutdown(): void {
    this.wss.close(() => {
      console.log("[WebSocket] Broadcaster shut down");
    });
  }
}

// Global broadcaster instance
let broadcaster: InventoryBroadcaster | null = null;

export function initializeInventoryBroadcaster(server: Server): InventoryBroadcaster {
  if (!broadcaster) {
    broadcaster = new InventoryBroadcaster(server);
  }
  return broadcaster;
}

export function getInventoryBroadcaster(): InventoryBroadcaster | null {
  return broadcaster;
}
