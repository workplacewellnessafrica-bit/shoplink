import { TRPCError } from "@trpc/server";
import * as bcrypt from "bcryptjs";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createBusiness,
  createCustomer,
  createOrder,
  createOrderItems,
  createProduct,
  deductStock,
  deleteProduct,
  getAllBusinesses,
  getBusinessById,
  getBusinessBySlug,
  getBusinessByUserId,
  getCustomerByPhone,
  getOrderById,
  getOrderItems,
  getOrdersByBusiness,
  getOrdersByCustomer,
  getProductById,
  getProductsByBusiness,
  markWhatsappSent,
  updateBusiness,
  updateOrderStatus,
  updateProduct,
  updateCustomer,
  getCustomerById,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { otpRouter, attendantRouter, barcodeRouter, posRouter, reconciliationRouter } from "./routers-pos";
import { broadcastInventoryUpdate } from "./_core/inventoryEvents";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80);
}

// ─── Business Router ──────────────────────────────────────────────────────────
const businessRouter = router({
  getAll: publicProcedure.query(async () => {
    const businesses = await getAllBusinesses();
    return businesses ?? [];
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const business = await getBusinessBySlug(input.slug);
      if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" });
      return business;
    }),

  getMine: protectedProcedure.query(async ({ ctx }) => {
    const business = await getBusinessByUserId(ctx.user.id);
    return business ?? null;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        description: z.string().optional(),
        whatsappNumber: z.string().min(7).max(30),
        slug: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getBusinessByUserId(ctx.user.id);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "You already have a store" });

      let slug = input.slug ? slugify(input.slug) : slugify(input.name);
      const slugExists = await getBusinessBySlug(slug);
      if (slugExists) slug = `${slug}-${nanoid(4)}`;

      await createBusiness({
        userId: ctx.user.id,
        name: input.name,
        slug,
        description: input.description ?? null,
        whatsappNumber: input.whatsappNumber,
      });

      return getBusinessByUserId(ctx.user.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255).optional(),
        description: z.string().optional(),
        whatsappNumber: z.string().min(7).max(30).optional(),
        logoUrl: z.string().url().optional().nullable(),
        logoKey: z.string().optional().nullable(),
        coverUrl: z.string().url().optional().nullable(),
        coverKey: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "No store found" });
      await updateBusiness(business.id, input);
      return getBusinessByUserId(ctx.user.id);
    }),

  uploadImage: protectedProcedure
    .input(
      z.object({
        type: z.enum(["logo", "cover"]),
        base64: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) throw new TRPCError({ code: "NOT_FOUND" });

      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.mimeType.split("/")[1] || "jpg";
      const key = `businesses/${business.id}/${input.type}-${nanoid(8)}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);

      if (input.type === "logo") {
        await updateBusiness(business.id, { logoUrl: url, logoKey: key });
      } else {
        await updateBusiness(business.id, { coverUrl: url, coverKey: key });
      }

      return { url, key };
    }),
});

// ─── Product Router ───────────────────────────────────────────────────────────
const productRouter = router({
  listByBusiness: publicProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      const products = await getProductsByBusiness(input.businessId, false);
      return products ?? [];
    }),

  listMine: protectedProcedure.query(async ({ ctx }) => {
    const business = await getBusinessByUserId(ctx.user.id);
    if (!business) return [];
    const products = await getProductsByBusiness(business.id, true);
    return products ?? [];
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const product = await getProductById(input.id);
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      return product;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        price: z.string(),
        stock: z.number().int().min(0),
        imageBase64: z.string().optional(),
        imageMimeType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Create a store first" });

      let imageUrl: string | null = null;
      let imageKey: string | null = null;

      if (input.imageBase64 && input.imageMimeType) {
        const buffer = Buffer.from(input.imageBase64, "base64");
        const ext = input.imageMimeType.split("/")[1] || "jpg";
        const key = `products/${business.id}/${nanoid(12)}.${ext}`;
        const { url } = await storagePut(key, buffer, input.imageMimeType);
        imageUrl = url;
        imageKey = key;
      }

      await createProduct({
        businessId: business.id,
        name: input.name,
        description: input.description ?? null,
        price: input.price,
        stock: input.stock,
        imageUrl,
        imageKey,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        stock: z.number().int().min(0).optional(),
        isActive: z.boolean().optional(),
        imageBase64: z.string().optional(),
        imageMimeType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) throw new TRPCError({ code: "NOT_FOUND" });

      const product = await getProductById(input.id);
      if (!product || product.businessId !== business.id)
        throw new TRPCError({ code: "FORBIDDEN" });

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.price !== undefined) updateData.price = input.price;
      if (input.stock !== undefined) updateData.stock = input.stock;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      if (input.imageBase64 && input.imageMimeType) {
        const buffer = Buffer.from(input.imageBase64, "base64");
        const ext = input.imageMimeType.split("/")[1] || "jpg";
        const key = `products/${business.id}/${nanoid(12)}.${ext}`;
        const { url } = await storagePut(key, buffer, input.imageMimeType);
        updateData.imageUrl = url;
        updateData.imageKey = key;
      }

      const previousProduct = await getProductById(input.id);
      await updateProduct(input.id, updateData as any);
      // Broadcast inventory update if stock changed
      if (input.stock !== undefined && previousProduct && input.stock !== previousProduct.stock) {
        broadcastInventoryUpdate(business.id, input.id, input.stock, previousProduct.stock);
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) throw new TRPCError({ code: "NOT_FOUND" });
      const product = await getProductById(input.id);
      if (!product || product.businessId !== business.id)
        throw new TRPCError({ code: "FORBIDDEN" });
      await deleteProduct(input.id);
    }),
});

// ─── Order Router ─────────────────────────────────────────────────────────────
const CartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().int().min(1),
});

const orderRouter = router({
  create: publicProcedure
    .input(
      z.object({
        businessId: z.number(),
        customerName: z.string().min(1),
        customerPhone: z.string().min(7),
        deliveryAddress: z.string().min(5),
        deliveryNotes: z.string().optional(),
        items: z.array(CartItemSchema).min(1),
        customerId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Validate products and compute totals
      const resolvedItems: Array<{
        productId: number;
        productName: string;
        productPrice: string;
        quantity: number;
        subtotal: string;
      }> = [];

      for (const item of input.items) {
        const product = await getProductById(item.productId);
        if (!product || !product.isActive)
          throw new TRPCError({ code: "BAD_REQUEST", message: `Product not found: ${item.productId}` });
        if (product.stock < item.quantity)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient stock for "${product.name}"`,
          });
        const price = parseFloat(product.price);
        const subtotal = price * item.quantity;
        resolvedItems.push({
          productId: item.productId,
          productName: product.name,
          productPrice: price.toFixed(2),
          quantity: item.quantity,
          subtotal: subtotal.toFixed(2),
        });
      }

      const totalAmount = resolvedItems
        .reduce((sum, i) => sum + parseFloat(i.subtotal), 0)
        .toFixed(2);

      // Create order
      const orderId = await createOrder({
        businessId: input.businessId,
        customerId: input.customerId ?? null,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        deliveryAddress: input.deliveryAddress,
        deliveryNotes: input.deliveryNotes ?? null,
        totalAmount,
        status: "pending",
        whatsappSent: false,
      });

      // Create order items
      await createOrderItems(
        resolvedItems.map((i) => ({
          orderId,
          productId: i.productId,
          productName: i.productName,
          productPrice: i.productPrice,
          quantity: i.quantity,
          subtotal: i.subtotal,
        }))
      );

      // Deduct stock
      for (const item of resolvedItems) {
        await deductStock(item.productId, item.quantity);
      }

      // Build WhatsApp message
      const business = await getBusinessById(input.businessId);
      if (business) {
        const lines = [
          `🛍️ *New Order #${orderId}*`,
          ``,
          `*Customer:* ${input.customerName}`,
          `*Phone:* ${input.customerPhone}`,
          `*Delivery:* ${input.deliveryAddress}`,
          input.deliveryNotes ? `*Notes:* ${input.deliveryNotes}` : null,
          ``,
          `*Items:*`,
          ...resolvedItems.map(
            (i) => `• ${i.productName} x${i.quantity} — $${i.subtotal}`
          ),
          ``,
          `*Total: $${totalAmount}*`,
        ]
          .filter((l) => l !== null)
          .join("\n");

        const whatsappUrl = `https://wa.me/${business.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(lines)}`;
        await markWhatsappSent(orderId);
        return { orderId, whatsappUrl, totalAmount };
      }

      return { orderId, whatsappUrl: null, totalAmount };
    }),

  getByBusiness: protectedProcedure.query(async ({ ctx }) => {
    const business = await getBusinessByUserId(ctx.user.id);
    if (!business) return [];
    const orders = await getOrdersByBusiness(business.id);
    return orders ?? [];
  }),

  getOrderDetails: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      const order = await getOrderById(input.orderId);
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      if (business && order.businessId !== business.id)
        throw new TRPCError({ code: "FORBIDDEN" });
      const items = await getOrderItems(input.orderId) ?? [];
      return { order, items: items ?? [] };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) throw new TRPCError({ code: "NOT_FOUND" });
      const order = await getOrderById(input.orderId);
      if (!order || order.businessId !== business.id)
        throw new TRPCError({ code: "FORBIDDEN" });
      await updateOrderStatus(input.orderId, input.status);
    }),
});

// ─── Customer Router ──────────────────────────────────────────────────────────
const CUSTOMER_COOKIE = "shoplink_customer";

const customerRouter = router({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        phone: z.string().min(7).max(30),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getCustomerByPhone(input.phone);
      if (existing)
        throw new TRPCError({ code: "CONFLICT", message: "Phone number already registered" });

      const passwordHash = await bcrypt.hash(input.password, 10);
      await createCustomer({ name: input.name, phone: input.phone, passwordHash });

      const customer = await getCustomerByPhone(input.phone);
      if (!customer) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(
        CUSTOMER_COOKIE,
        JSON.stringify({ id: customer.id, name: customer.name, phone: customer.phone }),
        { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }
      );

      return { id: customer.id, name: customer.name, phone: customer.phone };
    }),

  login: publicProcedure
    .input(
      z.object({
        phone: z.string().min(7),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customer = await getCustomerByPhone(input.phone);
      if (!customer)
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid phone or password" });

      if (!customer.passwordHash)
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid phone or password" });

      const valid = await bcrypt.compare(input.password, customer.passwordHash);
      if (!valid)
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid phone or password" });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(
        CUSTOMER_COOKIE,
        JSON.stringify({ id: customer.id, name: customer.name, phone: customer.phone }),
        { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }
      );

      return { id: customer.id, name: customer.name, phone: customer.phone };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(CUSTOMER_COOKIE, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),

  me: publicProcedure.query(({ ctx }) => {
    const raw = ctx.req.cookies?.[CUSTOMER_COOKIE];
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { id: number; name: string; phone: string };
      return parsed ?? null;
    } catch {
      return null;
    }
  }),

  myOrders: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      const orders = await getOrdersByCustomer(input.customerId);
      return orders ?? [];
    }),

  orderDetails: publicProcedure
    .input(z.object({ orderId: z.number(), customerId: z.number() }))
    .query(async ({ input }) => {
      const order = await getOrderById(input.orderId);
      if (!order || order.customerId !== input.customerId)
        throw new TRPCError({ code: "NOT_FOUND" });
      const items = await getOrderItems(input.orderId) ?? [];
      const business = await getBusinessById(order.businessId);
      return { order, items, business: business ?? null };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user ?? null),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
  }),
  business: businessRouter,
  product: productRouter,
  order: orderRouter,
  customer: customerRouter,
  otp: otpRouter,
  attendant: attendantRouter,
  barcode: barcodeRouter,
  pos: posRouter,
  reconciliation: reconciliationRouter,
});

export type AppRouter = typeof appRouter;
