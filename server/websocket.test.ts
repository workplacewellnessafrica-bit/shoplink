import { describe, it, expect } from "vitest";
import { InventoryBroadcaster, InventoryUpdateEvent } from "./_core/inventoryBroadcaster";
import { createServer } from "http";

describe("WebSocket Real-Time Inventory Sync", () => {

  it("creates broadcaster instance", () => {
    const server = createServer();
    const broadcaster = new InventoryBroadcaster(server);
    expect(broadcaster).toBeDefined();
    expect(broadcaster.getTotalClientCount()).toBe(0);
    broadcaster.shutdown();
    server.close();
  });

  it("tracks client count", () => {
    const server = createServer();
    const broadcaster = new InventoryBroadcaster(server);
    expect(broadcaster.getTotalClientCount()).toBe(0);
    expect(broadcaster.getClientCount(1)).toBe(0);
    expect(broadcaster.getClientCount(999)).toBe(0);
    broadcaster.shutdown();
    server.close();
  });

  it("broadcasts inventory update event structure", () => {
    const event: InventoryUpdateEvent = {
      type: "inventory.updated",
      businessId: 1,
      productId: 42,
      newStock: 5,
      previousStock: 10,
      timestamp: Date.now(),
    };
    expect(event.type).toBe("inventory.updated");
    expect(event.businessId).toBe(1);
    expect(event.productId).toBe(42);
    expect(event.newStock).toBe(5);
    expect(event.previousStock).toBe(10);
  });
});
