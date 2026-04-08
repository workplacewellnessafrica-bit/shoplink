import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Business,
  InsertBusiness,
  InsertCustomer,
  InsertOrder,
  InsertOrderItem,
  InsertProduct,
  InsertUser,
  businesses,
  customers,
  orderItems,
  orders,
  products,
  users,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
import { ENV } from "./_core/env";

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Businesses ───────────────────────────────────────────────────────────────
export async function createBusiness(data: InsertBusiness) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(businesses).values(data);
  return result[0];
}

export async function updateBusiness(id: number, data: Partial<InsertBusiness>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(businesses).set(data).where(eq(businesses.id, id));
}

export async function getBusinessBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);
  return result[0];
}

export async function getBusinessByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(businesses).where(eq(businesses.userId, userId)).limit(1);
  return result[0];
}

export async function getAllBusinesses() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(businesses)
    .where(eq(businesses.isActive, true))
    .orderBy(desc(businesses.createdAt));
}

export async function getBusinessById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
  return result[0];
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(products).values(data);
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(products).set({ isActive: false }).where(eq(products.id, id));
}

export async function getProductsByBusiness(businessId: number, includeInactive = false) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(products.businessId, businessId)];
  if (!includeInactive) conditions.push(eq(products.isActive, true));
  return db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(desc(products.createdAt));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function deductStock(productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db
    .update(products)
    .set({ stock: sql`stock - ${quantity}` })
    .where(and(eq(products.id, productId), sql`stock >= ${quantity}`));
}

// ─── Customers ────────────────────────────────────────────────────────────────
export async function createCustomer(data: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(customers).values(data);
}

export async function getCustomerByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
  return result[0];
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result[0];
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(orders).values(data);
  // MySQL insert returns insertId
  const insertId = (result[0] as any).insertId as number;
  return insertId;
}

export async function createOrderItems(items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  if (items.length === 0) return;
  await db.insert(orderItems).values(items);
}

export async function getOrdersByBusiness(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.businessId, businessId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrdersByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function updateOrderStatus(
  id: number,
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function markWhatsappSent(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(orders).set({ whatsappSent: true }).where(eq(orders.id, orderId));
}
