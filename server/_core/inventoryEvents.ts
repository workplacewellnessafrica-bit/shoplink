import { getInventoryBroadcaster, InventoryUpdateEvent } from "./inventoryBroadcaster";

/**
 * Broadcast an inventory update to all connected clients for a business
 */
export function broadcastInventoryUpdate(
  businessId: number,
  productId: number,
  newStock: number,
  previousStock: number
): void {
  const broadcaster = getInventoryBroadcaster();
  if (!broadcaster) {
    console.warn("[Inventory] Broadcaster not initialized");
    return;
  }

  const event: InventoryUpdateEvent = {
    type: "inventory.updated",
    businessId,
    productId,
    newStock,
    previousStock,
    timestamp: Date.now(),
  };

  broadcaster.broadcastInventoryUpdate(event);
}

/**
 * Get connected client count for a business (for debugging)
 */
export function getBusinessClientCount(businessId: number): number {
  const broadcaster = getInventoryBroadcaster();
  return broadcaster?.getClientCount(businessId) ?? 0;
}
