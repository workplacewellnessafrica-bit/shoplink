import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB module ───────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getAllBusinesses: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, name: "Test Shop", slug: "test-shop", description: "A test shop", whatsappNumber: "+1234567890", logoUrl: null, coverUrl: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getBusinessBySlug: vi.fn().mockImplementation(async (slug: string) => {
    if (slug === "test-shop") return { id: 1, userId: 1, name: "Test Shop", slug: "test-shop", description: null, whatsappNumber: "+1234567890", logoUrl: null, coverUrl: null, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    return undefined;
  }),
  getBusinessByUserId: vi.fn().mockResolvedValue(null),
  getBusinessById: vi.fn().mockResolvedValue(null),
  createBusiness: vi.fn().mockResolvedValue(undefined),
  updateBusiness: vi.fn().mockResolvedValue(undefined),
  getProductsByBusiness: vi.fn().mockResolvedValue([
    { id: 1, businessId: 1, name: "Widget", description: "A widget", price: "9.99", stock: 10, imageUrl: null, imageKey: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getProductById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return { id: 1, businessId: 1, name: "Widget", description: "A widget", price: "9.99", stock: 10, imageUrl: null, imageKey: null, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    return undefined;
  }),
  createProduct: vi.fn().mockResolvedValue(undefined),
  updateProduct: vi.fn().mockResolvedValue(undefined),
  deleteProduct: vi.fn().mockResolvedValue(undefined),
  deductStock: vi.fn().mockResolvedValue(undefined),
  createOrder: vi.fn().mockResolvedValue(42),
  createOrderItems: vi.fn().mockResolvedValue(undefined),
  getOrdersByBusiness: vi.fn().mockResolvedValue([]),
  getOrdersByCustomer: vi.fn().mockResolvedValue([]),
  getOrderById: vi.fn().mockResolvedValue(null),
  getOrderItems: vi.fn().mockResolvedValue([]),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  markWhatsappSent: vi.fn().mockResolvedValue(undefined),
  createCustomer: vi.fn().mockResolvedValue(undefined),
  getCustomerByPhone: vi.fn().mockResolvedValue(null),
  getCustomerById: vi.fn().mockResolvedValue(null),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/test.jpg", key: "test/key.jpg" }),
}));

// ─── Context Factories ────────────────────────────────────────────────────────
function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {}, cookies: {} } as any,
    res: { clearCookie: vi.fn(), cookie: vi.fn() } as any,
  };
}

function createAuthCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "owner-open-id",
      email: "owner@example.com",
      name: "Store Owner",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {}, cookies: {} } as any,
    res: { clearCookie: vi.fn(), cookie: vi.fn() } as any,
  };
}

// ─── Business Tests ───────────────────────────────────────────────────────────
describe("business.getAll", () => {
  it("returns list of active businesses", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.business.getAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe("Test Shop");
  });
});

describe("business.getBySlug", () => {
  it("returns business for valid slug", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.business.getBySlug({ slug: "test-shop" });
    expect(result.slug).toBe("test-shop");
  });

  it("throws NOT_FOUND for unknown slug", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.business.getBySlug({ slug: "nonexistent" })).rejects.toThrow();
  });
});

describe("business.getMine", () => {
  it("returns null when user has no business", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const result = await caller.business.getMine();
    expect(result).toBeNull();
  });
});

// ─── Product Tests ────────────────────────────────────────────────────────────
describe("product.listByBusiness", () => {
  it("returns products for a business", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.product.listByBusiness({ businessId: 1 });
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].name).toBe("Widget");
  });
});

describe("product.getById", () => {
  it("returns product for valid id", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.product.getById({ id: 1 });
    expect(result.id).toBe(1);
    expect(result.price).toBe("9.99");
  });

  it("throws NOT_FOUND for invalid id", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.product.getById({ id: 9999 })).rejects.toThrow();
  });
});

// ─── Order Tests ──────────────────────────────────────────────────────────────
describe("order.create", () => {
  it("creates order and returns orderId with whatsappUrl", async () => {
    const { getBusinessById, getProductById } = await import("./db");
    vi.mocked(getBusinessById).mockResolvedValueOnce({
      id: 1, userId: 1, name: "Test Shop", slug: "test-shop", description: null,
      whatsappNumber: "+1234567890", logoUrl: null, logoKey: null, coverUrl: null, coverKey: null,
      isActive: true, createdAt: new Date(), updatedAt: new Date(),
    });
    vi.mocked(getProductById).mockResolvedValueOnce({
      id: 1, businessId: 1, name: "Widget", description: null,
      price: "9.99", stock: 10, imageUrl: null, imageKey: null,
      isActive: true, createdAt: new Date(), updatedAt: new Date(),
    });

    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.order.create({
      businessId: 1,
      customerName: "Jane Doe",
      customerPhone: "+9876543210",
      deliveryAddress: "123 Main St",
      items: [{ productId: 1, quantity: 2 }],
    });

    expect(result.orderId).toBe(42);
    expect(result.totalAmount).toBe("19.98");
    expect(result.whatsappUrl).toContain("wa.me");
  });
});

// ─── Customer Auth Tests ──────────────────────────────────────────────────────
describe("customer.me", () => {
  it("returns null when no customer cookie", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.customer.me();
    expect(result).toBeNull();
  });

  it("returns customer data from cookie", async () => {
    const ctx = createPublicCtx();
    (ctx.req as any).cookies = {
      shoplink_customer: JSON.stringify({ id: 5, name: "Alice", phone: "+111" }),
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.customer.me();
    expect(result?.id).toBe(5);
    expect(result?.name).toBe("Alice");
  });
});

describe("customer.logout", () => {
  it("clears customer cookie", async () => {
    const ctx = createPublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.customer.logout();
    expect(result.success).toBe(true);
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated context", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const result = await caller.auth.me();
    expect(result?.name).toBe("Store Owner");
  });
});
