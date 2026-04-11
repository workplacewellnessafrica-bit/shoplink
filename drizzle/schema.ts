import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/mysql-core";

// ─── Core Auth User (Manus OAuth) ────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Businesses ───────────────────────────────────────────────────────────────
export const businesses = mysqlTable("businesses", {
  userId: int("userId").notNull(), // FK → users.id
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  whatsappNumber: varchar("whatsappNumber", { length: 30 }).notNull(),
  logoUrl: text("logoUrl"),
  logoKey: varchar("logoKey", { length: 500 }),
  coverUrl: text("coverUrl"),
  coverKey: varchar("coverKey", { length: 500 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull(), // FK → businesses.id
    productCode: varchar("productCode", { length: 50 }), // For POS search
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    stock: int("stock").default(0).notNull(),
    imageUrl: text("imageUrl"),
    imageKey: varchar("imageKey", { length: 500 }),
    emoji: varchar("emoji", { length: 10 }), // For POS emoji buttons
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    businessIdIdx: index("businessIdIdx").on(table.businessId),
    productCodeIdx: index("productCodeIdx").on(table.productCode),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Product Variants (sizes, options) ────────────────────────────────────────
export const productVariants = mysqlTable(
  "productVariants",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(), // FK → products.id
    name: varchar("name", { length: 100 }).notNull(), // e.g., "Small", "½ kg", "500ml"
    sku: varchar("sku", { length: 50 }), // e.g., "PROD-001-SM"
    price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Variant-specific price
    stock: int("stock").default(0).notNull(), // Variant-specific stock
    order: int("order").default(0).notNull(), // Display order
    // Variant attributes
    size: varchar("size", { length: 100 }), // e.g., "Small", "Medium", "Large"
    color: varchar("color", { length: 100 }), // e.g., "Red", "Blue"
    quality: varchar("quality", { length: 100 }), // e.g., "Premium", "Standard"
    origin: varchar("origin", { length: 100 }), // e.g., "Kenya", "Uganda"
    materials: text("materials"), // e.g., "100% Cotton", "Polyester blend"
    // Variant images
    imageUrl: text("imageUrl"), // Primary variant image
    imageKey: varchar("imageKey", { length: 500 }), // S3 key for image
    description: text("description"), // Variant-specific description
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    productIdIdx: index("productIdIdx").on(table.productId),
    skuIdx: index("skuIdx").on(table.sku),
  })
);

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;

// ─── Low Stock Alerts ─────────────────────────────────────────────────────────
export const lowStockAlerts = mysqlTable(
  "lowStockAlerts",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull(), // FK → businesses.id
    productId: int("productId").notNull(), // FK → products.id
    threshold: int("threshold").default(10).notNull(), // Alert when stock < threshold
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    businessIdIdx: index("businessIdIdx").on(table.businessId),
    productIdIdx: index("productIdIdx").on(table.productId),
  })
);

export type LowStockAlert = typeof lowStockAlerts.$inferSelect;
export type InsertLowStockAlert = typeof lowStockAlerts.$inferInsert;

// ─── Customers (phone-based auth, separate from OAuth users) ──────────────────
export const customers = mysqlTable(
  "customers",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 30 }).notNull().unique(),
    passwordHash: varchar("passwordHash", { length: 255 }),
    isPasswordSet: boolean("isPasswordSet").default(false).notNull(), // For OTP first-time setup
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    phoneIdx: index("phoneIdx").on(table.phone),
  })
);

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull(), // FK → businesses.id
    customerId: int("customerId"), // nullable if guest
    customerName: varchar("customerName", { length: 255 }).notNull(),
    customerPhone: varchar("customerPhone", { length: 30 }).notNull(),
    deliveryAddress: text("deliveryAddress").notNull(),
    deliveryNotes: text("deliveryNotes"),
    totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
    orderType: mysqlEnum("orderType", ["web", "pos"]).default("web").notNull(), // Track order source
    status: mysqlEnum("status", [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ])
      .default("pending")
      .notNull(),
    whatsappSent: boolean("whatsappSent").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    businessIdIdx: index("ordersBusinessIdIdx").on(table.businessId),
    customerIdIdx: index("ordersCustomerIdIdx").on(table.customerId),
  })
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─── Order Items ──────────────────────────────────────────────────────────────
export const orderItems = mysqlTable(
  "orderItems",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(), // FK → orders.id
    productId: int("productId").notNull(), // FK → products.id
    productName: varchar("productName", { length: 255 }).notNull(),
    productPrice: decimal("productPrice", { precision: 10, scale: 2 }).notNull(),
    quantity: int("quantity").notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => ({
    orderIdIdx: index("orderIdIdx").on(table.orderId),
  })
);

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ─── OTP Verifications ────────────────────────────────────────────────────────
export const otpVerifications = mysqlTable(
  "otpVerifications",
  {
    id: int("id").autoincrement().primaryKey(),
    phone: varchar("phone", { length: 30 }).notNull(),
    otpCode: varchar("otpCode", { length: 6 }).notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    attempts: int("attempts").default(0).notNull(),
    deliveryMethod: mysqlEnum("deliveryMethod", ["whatsapp", "sms", "none"]).default("none").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    phoneIdx: index("otpPhoneIdx").on(table.phone),
  })
);

export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = typeof otpVerifications.$inferInsert;

// ─── Business Features ────────────────────────────────────────────────────────
export const businessFeatures = mysqlTable(
  "businessFeatures",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull(),
    featureName: varchar("featureName", { length: 50 }).notNull(), // "pos", "analytics", etc.
    isEnabled: boolean("isEnabled").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    businessIdIdx: index("featureBusinessIdIdx").on(table.businessId),
  })
);

export type BusinessFeature = typeof businessFeatures.$inferSelect;
export type InsertBusinessFeature = typeof businessFeatures.$inferInsert;

// ─── Attendants (POS staff) ───────────────────────────────────────────────────
export const attendants = mysqlTable(
  "attendants",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).unique(),
    role: mysqlEnum("role", ["attendant", "accountant", "manager"]).default("attendant").notNull(),

    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    businessIdIdx: index("attendantBusinessIdIdx").on(table.businessId),
  })
);

export type Attendant = typeof attendants.$inferSelect;
export type InsertAttendant = typeof attendants.$inferInsert;

// ─── Product Barcodes ─────────────────────────────────────────────────────────
export const productBarcodes = mysqlTable(
  "productBarcodes",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    barcodeValue: varchar("barcodeValue", { length: 255 }).notNull().unique(),
    barcodeImage: text("barcodeImage"), // Base64 or URL
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    productIdIdx: index("barcodeProductIdIdx").on(table.productId),
    barcodeValueIdx: index("barcodeValueIdx").on(table.barcodeValue),
  })
);

export type ProductBarcode = typeof productBarcodes.$inferSelect;
export type InsertProductBarcode = typeof productBarcodes.$inferInsert;

// ─── POS Transactions ─────────────────────────────────────────────────────────
export const posTransactions = mysqlTable(
  "posTransactions",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull(),
    attendantId: int("attendantId"), // FK → attendants.id
    items: text("items").notNull(), // JSON array of {productId, quantity, price}
    totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: mysqlEnum("paymentMethod", ["cash", "mpesa", "card", "credit"]).notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    businessIdIdx: index("posBusinessIdIdx").on(table.businessId),
    createdAtIdx: index("posCreatedAtIdx").on(table.createdAt),
  })
);

export type PosTransaction = typeof posTransactions.$inferSelect;
export type InsertPosTransaction = typeof posTransactions.$inferInsert;

// ─── Day-End Reconciliation ───────────────────────────────────────────────────
export const dayEndReconciliations = mysqlTable(
  "dayEndReconciliations",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull(),
    date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
    openingBalance: decimal("openingBalance", { precision: 10, scale: 2 }).default("0").notNull(),
    daysSales: decimal("daysSales", { precision: 10, scale: 2 }).default("0").notNull(),
    expenditures: decimal("expenditures", { precision: 10, scale: 2 }).default("0").notNull(),
    closingBalance: decimal("closingBalance", { precision: 10, scale: 2 }).default("0").notNull(),
    cashAtHand: decimal("cashAtHand", { precision: 10, scale: 2 }),
    mpesaTotal: decimal("mpesaTotal", { precision: 10, scale: 2 }).default("0").notNull(),
    cardTotal: decimal("cardTotal", { precision: 10, scale: 2 }).default("0").notNull(),
    credits: decimal("credits", { precision: 10, scale: 2 }).default("0").notNull(),
    status: mysqlEnum("status", ["pending", "verified", "closed"]).default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    businessIdIdx: index("reconcileBusinessIdIdx").on(table.businessId),
    dateIdx: index("reconcileDateIdx").on(table.date),
  })
);

export type DayEndReconciliation = typeof dayEndReconciliations.$inferSelect;
export type InsertDayEndReconciliation = typeof dayEndReconciliations.$inferInsert;

// ─── Device Sessions (persistent login) ────────────────────────────────────────
export const deviceSessions = mysqlTable(
  "deviceSessions",
  {
    id: int("id").autoincrement().primaryKey(),
    customerId: int("customerId").notNull(),
    deviceId: varchar("deviceId", { length: 255 }).notNull(),
    lastAccessedAt: timestamp("lastAccessedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    customerIdIdx: index("deviceCustomerIdIdx").on(table.customerId),
    deviceIdIdx: index("deviceIdIdx").on(table.deviceId),
  })
);

export type DeviceSession = typeof deviceSessions.$inferSelect;
export type InsertDeviceSession = typeof deviceSessions.$inferInsert;

// ─── Indexes for common queries ───────────────────────────────────────────────
// Already defined in table definitions above for performance

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(), // FK → users.id (recipient)
    businessId: int("businessId"), // FK → businesses.id (for business notifications, null for customer)
    type: mysqlEnum("type", ["order_placed", "order_confirmed", "order_shipped", "order_delivered", "payment_received", "low_stock", "new_order", "system"]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    relatedOrderId: int("relatedOrderId"), // FK → orders.id (if applicable)
    relatedProductId: int("relatedProductId"), // FK → products.id (if applicable)
    isRead: boolean("isRead").default(false).notNull(),
    actionUrl: text("actionUrl"), // URL to navigate to (e.g., order details)
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("notifUserIdIdx").on(table.userId),
    businessIdIdx: index("notifBusinessIdIdx").on(table.businessId),
    isReadIdx: index("notifIsReadIdx").on(table.isRead),
    createdAtIdx: index("notifCreatedAtIdx").on(table.createdAt),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
