import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { sendWhatsAppOTP } from "./_core/whatsapp";
import {
  createOtpVerification,
  getOtpVerification,
  deleteOtpVerification,
  updateOtpVerification,
  createAttendant,
  getAttendantsByBusiness,
  getAttendantById,
  updateAttendant,
  createProductBarcode,
  getProductBarcodeByValue,
  getProductBarcodesByProduct,
  createPosTransaction,
  getPosTransactionsByBusiness,
  createDayEndReconciliation,
  getDayEndReconciliation,
  updateDayEndReconciliation,
  getDayEndReconciliationHistory,
  createDeviceSession,
  getDeviceSession,
  updateDeviceSession,
  getProductByCode,
  getPopularProductsByBusiness,
  getBusinessByUserId,
  getProductById,
  deductStock,
  getBusinessById,
} from "./db";
import { nanoid } from "nanoid";
import { sendOrderConfirmationEmail } from "./email";
import { broadcastInventoryUpdate } from "./_core/inventoryEvents";
import { sendOTPViaSMS, isSMSAvailable } from "./_core/sms";

// ─── OTP Router ───────────────────────────────────────────────────────────────
export const otpRouter = router({
  send: publicProcedure
    .input(z.object({ phone: z.string().min(7) }))
    .mutation(async ({ input }) => {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await deleteOtpVerification(input.phone);
      await createOtpVerification({
        phone: input.phone,
        otpCode,
        expiresAt,
        attempts: 0,
      });

      // Try WhatsApp first, fallback to SMS
      let deliveryMethod = "none";
      let deliverySuccess = false;

      console.log(`[OTP] Attempting to send OTP to ${input.phone}`);
      const whatsappSent = await sendWhatsAppOTP(input.phone, otpCode);
      if (whatsappSent) {
        console.log(`[OTP] OTP sent successfully via WhatsApp`);
        deliveryMethod = "whatsapp";
        deliverySuccess = true;
      } else {
        console.warn(`[OTP] WhatsApp delivery failed, attempting SMS fallback`);
        // Fallback to SMS if available
        if (isSMSAvailable()) {
          const smsSent = await sendOTPViaSMS(input.phone, otpCode);
          if (smsSent.success) {
            console.log(`[OTP] OTP sent successfully via SMS (fallback)`);
            deliveryMethod = "sms";
            deliverySuccess = true;
          } else {
            console.error(`[OTP] SMS fallback failed: ${smsSent.error}`);
          }
        } else {
          console.warn(`[OTP] SMS service not configured`);
        }
      }

      if (!deliverySuccess) {
        console.warn(`[OTP] Failed to send OTP to ${input.phone} via any method`);
      }

      return {
        success: true,
        message: deliverySuccess
          ? `OTP sent via ${deliveryMethod.toUpperCase()}`
          : "OTP generated (delivery failed - check phone number and try again)",
        deliveryMethod,
      };
    }),

  verify: publicProcedure
    .input(z.object({ phone: z.string().min(7), otpCode: z.string().length(6) }))
    .mutation(async ({ input }) => {
      const otp = await getOtpVerification(input.phone);
      if (!otp) throw new TRPCError({ code: "NOT_FOUND", message: "OTP expired or not found" });
      if (otp.attempts >= 3) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts. Request new OTP." });
      if (new Date() > otp.expiresAt) throw new TRPCError({ code: "BAD_REQUEST", message: "OTP expired" });
      if (otp.otpCode !== input.otpCode) {
        await updateOtpVerification(input.phone, { attempts: otp.attempts + 1 });
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid OTP" });
      }
      await deleteOtpVerification(input.phone);
      return { success: true };
    }),
});

// ─── Attendant Router ─────────────────────────────────────────────────────────
export const attendantRouter = router({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(255), email: z.string().email().optional(), role: z.enum(["attendant", "accountant", "manager"]) }))
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Create a store first" });
      const attendantId = await createAttendant({ businessId: business.id, name: input.name, email: input.email, role: input.role });
      return { id: attendantId, ...input };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const business = await getBusinessByUserId(ctx.user.id);
    if (!business) return [];
    return getAttendantsByBusiness(business.id);
  }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string().optional(), role: z.enum(["attendant", "accountant", "manager"]).optional(), isActive: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) throw new TRPCError({ code: "NOT_FOUND" });
      const attendant = await getAttendantById(input.id);
      if (!attendant || attendant.businessId !== business.id) throw new TRPCError({ code: "FORBIDDEN" });
      await updateAttendant(input.id, { name: input.name, role: input.role, isActive: input.isActive });
    }),
});

// ─── Barcode Router ───────────────────────────────────────────────────────────
export const barcodeRouter = router({
  generate: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const product = await getProductById(input.productId);
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business || product.businessId !== business.id) throw new TRPCError({ code: "FORBIDDEN" });
      const barcodeValue = `${business.id}-${product.id}-${nanoid(8)}`;
      await createProductBarcode({ productId: product.id, barcodeValue, barcodeImage: null });
      return { barcodeValue };
    }),

  getByProduct: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ ctx, input }) => {
      const product = await getProductById(input.productId);
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business || product.businessId !== business.id) throw new TRPCError({ code: "FORBIDDEN" });
      return getProductBarcodesByProduct(product.id);
    }),

  scan: publicProcedure
    .input(z.object({ barcodeValue: z.string(), businessId: z.number() }))
    .query(async ({ input }) => {
      const barcode = await getProductBarcodeByValue(input.barcodeValue);
      if (!barcode) throw new TRPCError({ code: "NOT_FOUND", message: "Barcode not found" });
      const product = await getProductById(barcode.productId);
      if (!product || product.businessId !== input.businessId) throw new TRPCError({ code: "FORBIDDEN" });
      return product;
    }),
});

// ─── POS Router ───────────────────────────────────────────────────────────────
export const posRouter = router({
  searchByCode: publicProcedure
    .input(z.object({ businessId: z.number(), productCode: z.string() }))
    .query(async ({ input }) => {
      const product = await getProductByCode(input.businessId, input.productCode);
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      return product;
    }),

  getPopular: publicProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      return getPopularProductsByBusiness(input.businessId, 12);
    }),

  checkout: publicProcedure
    .input(z.object({ businessId: z.number(), attendantId: z.number().optional(), items: z.array(z.object({ productId: z.number(), quantity: z.number().int().min(1), price: z.string() })), paymentMethod: z.enum(["cash", "mpesa", "card", "credit"]), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const business = await getBusinessById(input.businessId);
      if (!business) throw new TRPCError({ code: "NOT_FOUND" });
      let totalAmount = "0";
      for (const item of input.items) {
        const product = await getProductById(item.productId);
        if (!product || product.businessId !== input.businessId) throw new TRPCError({ code: "FORBIDDEN" });
        if (product.stock < item.quantity) throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient stock for ${product.name}` });
        totalAmount = (parseFloat(totalAmount) + parseFloat(item.price) * item.quantity).toString();
      }
      const transactionId = await createPosTransaction({ businessId: input.businessId, attendantId: input.attendantId, items: JSON.stringify(input.items), totalAmount, paymentMethod: input.paymentMethod, notes: input.notes });
      for (const item of input.items) {
        const product = await getProductById(item.productId);
        const previousStock = product?.stock ?? 0;
        await deductStock(item.productId, item.quantity);
        // Broadcast inventory update to all connected clients
        broadcastInventoryUpdate(input.businessId, item.productId, previousStock - item.quantity, previousStock);
      }
      // Send confirmation email (async, don't wait)
      const itemsForEmail = input.items.map((item) => ({ name: `Product #${item.productId}`, quantity: item.quantity, price: item.price }));
      sendOrderConfirmationEmail(
        "customer@example.com",
        "Valued Customer",
        transactionId,
        itemsForEmail,
        totalAmount,
        business.name || "ShopLink Store"
      ).catch((err) => console.error("Failed to send POS confirmation email:", err));
      return { transactionId, totalAmount };
    }),

  getTransactions: protectedProcedure
    .input(z.object({ date: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) return [];
      return getPosTransactionsByBusiness(business.id, input.date);
    }),
});

// ─── Reconciliation Router ────────────────────────────────────────────────────
export const reconciliationRouter = router({
  getTodayOrCreate: protectedProcedure.query(async ({ ctx }) => {
    const business = await getBusinessByUserId(ctx.user.id);
    if (!business) throw new TRPCError({ code: "NOT_FOUND" });
    const today = new Date().toISOString().split("T")[0];
    let reconciliation = await getDayEndReconciliation(business.id, today);
    if (!reconciliation) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const yesterdayReconciliation = await getDayEndReconciliation(business.id, yesterday);
      const openingBalance = yesterdayReconciliation?.closingBalance ?? "0";
      await createDayEndReconciliation({ businessId: business.id, date: today, openingBalance, daysSales: "0", expenditures: "0", closingBalance: openingBalance, status: "pending" });
      reconciliation = await getDayEndReconciliation(business.id, today);
    }
    return reconciliation;
  }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), cashAtHand: z.string().optional(), mpesaTotal: z.string().optional(), cardTotal: z.string().optional(), credits: z.string().optional(), expenditures: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) throw new TRPCError({ code: "NOT_FOUND" });
      const today = new Date().toISOString().split("T")[0];
      const reconciliation = await getDayEndReconciliation(business.id, today);
      if (!reconciliation || reconciliation.id !== input.id) throw new TRPCError({ code: "FORBIDDEN" });
      const daysSales = parseFloat(input.mpesaTotal ?? "0") + parseFloat(input.cardTotal ?? "0") + parseFloat(input.cashAtHand ?? "0");
      const expenditures = parseFloat(input.expenditures ?? "0");
      const closingBalance = (parseFloat(reconciliation.openingBalance) + daysSales - expenditures).toString();
      await updateDayEndReconciliation(input.id, { cashAtHand: input.cashAtHand, mpesaTotal: input.mpesaTotal, cardTotal: input.cardTotal, credits: input.credits, expenditures: input.expenditures, daysSales: daysSales.toString(), closingBalance });
    }),

  verify: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) throw new TRPCError({ code: "NOT_FOUND" });
      await updateDayEndReconciliation(input.id, { status: "verified" });
      return { success: true };
    }),

  close: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) throw new TRPCError({ code: "NOT_FOUND" });
      await updateDayEndReconciliation(input.id, { status: "closed" });
      return { success: true };
    }),

  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const business = await getBusinessByUserId(ctx.user.id);
    if (!business) return [];
    return getDayEndReconciliationHistory(business.id);
  }),
});
