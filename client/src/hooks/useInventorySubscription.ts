import { useEffect, useRef, useCallback } from "react";

export interface InventoryUpdateEvent {
  type: "inventory.updated";
  businessId: number;
  productId: number;
  newStock: number;
  previousStock: number;
  timestamp: number;
}

interface UseInventorySubscriptionOptions {
  businessId: number;
  onUpdate?: (event: InventoryUpdateEvent) => void;
  autoReconnect?: boolean;
  reconnectDelay?: number;
}

/**
 * Hook for subscribing to real-time inventory updates via WebSocket
 * Handles connection, reconnection, and cleanup
 */
export function useInventorySubscription({
  businessId,
  onUpdate,
  autoReconnect = true,
  reconnectDelay = 3000,
}: UseInventorySubscriptionOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (isUnmountedRef.current) return;

    try {
      // Build WebSocket URL from current location
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/ws/inventory`;

      console.log("[Inventory] Connecting to WebSocket:", wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[Inventory] WebSocket connected");
        // Subscribe to business inventory updates
        ws.send(
          JSON.stringify({
            type: "subscribe",
            businessId,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "subscribed") {
            console.log(`[Inventory] Subscribed to business ${data.businessId}`);
          } else if (data.type === "inventory.updated") {
            console.log("[Inventory] Update received:", data);
            onUpdate?.(data);
          }
        } catch (error) {
          console.error("[Inventory] Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("[Inventory] WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("[Inventory] WebSocket disconnected");
        wsRef.current = null;

        // Auto-reconnect if enabled
        if (autoReconnect && !isUnmountedRef.current) {
          console.log(
            `[Inventory] Reconnecting in ${reconnectDelay}ms...`
          );
          reconnectTimeoutRef.current = setTimeout(connect, reconnectDelay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[Inventory] Failed to connect:", error);
      if (autoReconnect && !isUnmountedRef.current) {
        reconnectTimeoutRef.current = setTimeout(connect, reconnectDelay);
      }
    }
  }, [businessId, onUpdate, autoReconnect, reconnectDelay]);

  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    return () => {
      isUnmountedRef.current = true;

      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnect: connect,
  };
}
