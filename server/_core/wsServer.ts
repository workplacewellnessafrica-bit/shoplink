import { Server as HTTPServer } from "http";
import { initializeInventoryBroadcaster } from "./inventoryBroadcaster";

/**
 * Initialize WebSocket server for real-time features
 * Call this after creating the HTTP server
 */
export function initializeWebSocketServer(httpServer: HTTPServer) {
  try {
    const broadcaster = initializeInventoryBroadcaster(httpServer);
    console.log("[Server] WebSocket server initialized");
    return broadcaster;
  } catch (error) {
    console.error("[Server] Failed to initialize WebSocket server:", error);
    throw error;
  }
}
