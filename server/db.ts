import { and, desc, eq, sql, asc } from "drizzle-orm";
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
  otpVerifications,
  businessFeatures,
  attendants,
  productBarcodes,
  posTransactions,
  dayEndReconciliations,
  deviceSessions,
  productVariants,
  lowStockAlerts,
  InsertOtpVerification,
  InsertAttendant,
  InsertProductBarcode,
  InsertPosTransaction,
  InsertDayEndReconciliation,
  InsertDeviceSession,
  InsertBusinessFeature,
  InsertProductVariant,
  InsertLowStockAlert,
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

// ─── OTP Verifications ────────────────────────────────────────────────────────

export async function createOtpVerification(data: InsertOtpVerification) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(otpVerifications).values(data);
}

export async function getOtpVerification(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(otpVerifications)
    .where(eq(otpVerifications.phone, phone))
    .orderBy(desc(otpVerifications.createdAt))
    .limit(1);
  return result[0];
}

export async function updateOtpVerification(phone: string, data: Partial<InsertOtpVerification>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(otpVerifications).set(data).where(eq(otpVerifications.phone, phone));
}

export async function deleteOtpVerification(phone: string) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(otpVerifications).where(eq(otpVerifications.phone, phone));
}

// ─── Business Features ────────────────────────────────────────────────────────
export async function createBusinessFeature(data: InsertBusinessFeature) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(businessFeatures).values(data);
}

export async function isFeatureEnabled(businessId: number, featureName: string) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(businessFeatures)
    .where(
      and(
        eq(businessFeatures.businessId, businessId),
        eq(businessFeatures.featureName, featureName)
      )
    )
    .limit(1);
  return result.length > 0 && result[0].isEnabled;
}

export async function getBusinessFeatures(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(businessFeatures)
    .where(eq(businessFeatures.businessId, businessId));
}

// ─── Attendants ───────────────────────────────────────────────────────────────
export async function createAttendant(data: InsertAttendant) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(attendants).values(data);
  return (result[0] as any).insertId as number;
}

export async function getAttendantsByBusiness(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(attendants)
    .where(eq(attendants.businessId, businessId))
    .orderBy(desc(attendants.createdAt));
}

export async function getAttendantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(attendants).where(eq(attendants.id, id)).limit(1);
  return result[0];
}

export async function updateAttendant(id: number, data: Partial<InsertAttendant>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(attendants).set(data).where(eq(attendants.id, id));
}

// ─── Product Barcodes ─────────────────────────────────────────────────────────
export async function createProductBarcode(data: InsertProductBarcode) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(productBarcodes).values(data);
}

export async function getProductBarcodeByValue(barcodeValue: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(productBarcodes)
    .where(eq(productBarcodes.barcodeValue, barcodeValue))
    .limit(1);
  return result[0];
}

export async function getProductBarcodesByProduct(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productBarcodes).where(eq(productBarcodes.productId, productId));
}

// ─── POS Transactions ──────────────────────────────────────────────────────────
export async function createPosTransaction(data: InsertPosTransaction) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(posTransactions).values(data);
  return (result[0] as any).insertId as number;
}

export async function getPosTransactionsByBusiness(businessId: number, date?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(posTransactions.businessId, businessId)];
  if (date) {
    conditions.push(sql`DATE(createdAt) = ${date}`);
  }
  return db
    .select()
    .from(posTransactions)
    .where(and(...conditions))
    .orderBy(desc(posTransactions.createdAt));
}

export async function getPosTransactionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(posTransactions).where(eq(posTransactions.id, id)).limit(1);
  return result[0];
}

// ─── Day-End Reconciliation ───────────────────────────────────────────────────
export async function createDayEndReconciliation(data: InsertDayEndReconciliation) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(dayEndReconciliations).values(data);
  return (result[0] as any).insertId as number;
}

export async function getDayEndReconciliation(businessId: number, date: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(dayEndReconciliations)
    .where(
      and(
        eq(dayEndReconciliations.businessId, businessId),
        eq(dayEndReconciliations.date, date)
      )
    )
    .limit(1);
  return result[0];
}

export async function updateDayEndReconciliation(id: number, data: Partial<InsertDayEndReconciliation>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(dayEndReconciliations).set(data).where(eq(dayEndReconciliations.id, id));
}

export async function getDayEndReconciliationHistory(businessId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dayEndReconciliations)
    .where(eq(dayEndReconciliations.businessId, businessId))
    .orderBy(desc(dayEndReconciliations.date))
    .limit(limit);
}

// ─── Device Sessions (persistent login) ────────────────────────────────────────
export async function createDeviceSession(data: InsertDeviceSession) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(deviceSessions).values(data);
}

export async function getDeviceSession(customerId: number, deviceId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(deviceSessions)
    .where(
      and(
        eq(deviceSessions.customerId, customerId),
        eq(deviceSessions.deviceId, deviceId)
      )
    )
    .limit(1);
  return result[0];
}

export async function updateDeviceSession(customerId: number, deviceId: string) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db
    .update(deviceSessions)
    .set({ lastAccessedAt: new Date() })
    .where(
      and(
        eq(deviceSessions.customerId, customerId),
        eq(deviceSessions.deviceId, deviceId)
      )
    );
}

export async function getCustomerDevices(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deviceSessions).where(eq(deviceSessions.customerId, customerId));
}

// ─── Customer Updates ──────────────────────────────────────────────────────────
export async function updateCustomer(id: number, data: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(customers).set(data).where(eq(customers.id, id));
}

// ─── Product Helpers ──────────────────────────────────────────────────────────
export async function getProductByCode(businessId: number, productCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.businessId, businessId),
        eq(products.productCode, productCode)
      )
    )
    .limit(1);
  return result[0];
}

export async function getPopularProductsByBusiness(businessId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  // Get products with most recent sales from POS
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.businessId, businessId),
        eq(products.isActive, true)
      )
    )
    .orderBy(desc(products.updatedAt))
    .limit(limit);
}


// ─── Product Variants ─────────────────────────────────────────────────────────
export async function getProductVariants(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId))
    .orderBy(asc(productVariants.order));
}

export async function createProductVariant(data: InsertProductVariant) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(productVariants).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateProductVariant(id: number, data: Partial<InsertProductVariant>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(productVariants).set(data).where(eq(productVariants.id, id));
}

export async function deleteProductVariant(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(productVariants).where(eq(productVariants.id, id));
}

// ─── Low Stock Alerts ──────────────────────────────────────────────────────────
export async function getLowStockAlerts(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(lowStockAlerts)
    .where(eq(lowStockAlerts.businessId, businessId));
}

export async function getLowStockAlertForProduct(businessId: number, productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(lowStockAlerts)
    .where(
      and(
        eq(lowStockAlerts.businessId, businessId),
        eq(lowStockAlerts.productId, productId)
      )
    )
    .limit(1);
  return result[0];
}

export async function createLowStockAlert(data: InsertLowStockAlert) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(lowStockAlerts).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateLowStockAlert(id: number, data: Partial<InsertLowStockAlert>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(lowStockAlerts).set(data).where(eq(lowStockAlerts.id, id));
}

export async function deleteLowStockAlert(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(lowStockAlerts).where(eq(lowStockAlerts.id, id));
}
