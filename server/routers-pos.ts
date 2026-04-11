import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { sendWhatsAppOTP } from "./_core/whatsapp";
import { notifyBusinessOfNewOrder } from "./_core/businessNotifications";
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
import { sendAttendantInviteEmail } from "./attendantInvite";
import { broadcastInventoryUpdate } from "./_core/inventoryEvents";
import { sendOTPViaSMS, isSMSAvailable } from "./_core/sms";
import * as bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";

// ─── OTP Router ───────────────────────────────────────────────────────────
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

// ─── Attendant Router ─────────────────────────────────────────────────────
export const attendantRouter = router({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(255), email: z.string().email().optional(), role: z.enum(["attendant", "accountant", "manager"]) }))
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Create a store first" });
      const attendantId = await createAttendant({ businessId: business.id, name: input.name, email: input.email || undefined, role: input.role });
      
      // Send invite email if email is provided
      if (input.email) {
        const inviteLink = `${process.env.VITE_APP_URL || "http://localhost:3000"}/invite/attendant/${attendantId}`;
        try {
          await sendAttendantInviteEmail(input.email, input.name, business.name, inviteLink);
          console.log(`[Attendant] Invite email sent to ${input.email}`);
        } catch (err) {
          console.error(`[Attendant] Failed to send invite email to ${input.email}:`, err);
        }
      }
      
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

  generateCredentials: protectedProcedure
    .input(z.object({ attendantId: z.number(), username: z.string().min(3).max(100), password: z.string().min(8), pin: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) throw new TRPCError({ code: "NOT_FOUND" });
      const attendant = await getAttendantById(input.attendantId);
      if (!attendant || attendant.businessId !== business.id) throw new TRPCError({ code: "FORBIDDEN" });
      
      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);
      
      // Update attendant with credentials
      await updateAttendant(input.attendantId, {
        username: input.username,
        passwordHash,
        pin: input.pin || undefined,
        credentialsStatus: "generated" as any,
      });
      
      console.log(`[Attendant] Credentials generated for ${attendant.name}`);
      
      return { success: true, message: "Credentials generated successfully" };
    }),
});

// ─── Barcode Router ───────────────────────────────────────────────────────
export const barcodeRouter = router({
  generate: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const product = await getProductById(input.productId);
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business || product.businessId !== business.id) throw new TRPCError({ code: "FORBIDDEN" });
      const barcodeValue = `${business.id}-${product.id}-${nanoid(8)}`;
      const barcode = await createProductBarcode({ productId: input.productId, barcodeValue });
      return barcode;
    }),

  getByValue: publicProcedure
    .input(z.object({ barcodeValue: z.string() }))
    .query(async ({ input }) => {
      return getProductBarcodeByValue(input.barcodeValue);
    }),

  getByProduct: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ ctx, input }) => {
      const product = await getProductById(input.productId);
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business || product.businessId !== business.id) throw new TRPCError({ code: "FORBIDDEN" });
      return getProductBarcodesByProduct(input.productId);
    }),

  scan: publicProcedure
    .input(z.object({ barcodeValue: z.string() }))
    .query(async ({ input }) => {
      const barcode = await getProductBarcodeByValue(input.barcodeValue);
      if (!barcode) throw new TRPCError({ code: "NOT_FOUND", message: "Barcode not found" });
      const product = await getProductById(barcode.productId);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      return product;
    }),
});

// ─── POS Router ───────────────────────────────────────────────────────────
export const posRouter = router({
  searchByCode: publicProcedure
    .input(z.object({ businessId: z.number(), productCode: z.string() }))
    .query(async ({ input }) => {
      const product = await getProductByCode(input.businessId, input.productCode);
      if (!product || product.businessId !== input.businessId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }
      return product;
    }),

  getPopular: publicProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      return getPopularProductsByBusiness(input.businessId);
    }),

  checkout: publicProcedure
    .input(
      z.object({
        businessId: z.number(),
        items: z.array(z.object({ productId: z.number(), quantity: z.number(), price: z.string() })),
        totalAmount: z.string().optional(),
        paymentMethod: z.enum(["cash", "mpesa", "card", "credit"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const business = await getBusinessById(input.businessId);
      if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });

      // Calculate total if not provided
      let totalAmount = input.totalAmount;
      if (!totalAmount) {
        totalAmount = input.items
          .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
          .toString();
      }

      // Deduct stock for each item
      for (const item of input.items) {
        await deductStock(item.productId, item.quantity);
      }

      // Create POS transaction
      const transaction = await createPosTransaction({
        businessId: input.businessId,
        attendantId: 0, // Public checkout, no attendant
        items: JSON.stringify(input.items),
        totalAmount: totalAmount as any,
        paymentMethod: input.paymentMethod,
        notes: input.notes,
      });

      // Broadcast inventory update
      for (const item of input.items) {
        const product = await getProductById(item.productId);
        if (product) {
          await broadcastInventoryUpdate(input.businessId, item.productId, product.stock, product.stock + item.quantity);
        }
      }

      return { id: transaction, totalAmount };
    }),

  getTransactions: protectedProcedure
    .input(z.object({ date: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) return [];
      return getPosTransactionsByBusiness(business.id);
    }),
});

// ─── Reconciliation Router ────────────────────────────────────────────────
export const reconciliationRouter = router({
  getTodayOrCreate: protectedProcedure.query(async ({ ctx }) => {
    const business = await getBusinessByUserId(ctx.user.id);
    if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Create a store first" });

    const today = new Date().toISOString().split("T")[0];
    let reconciliation = await getDayEndReconciliation(business.id, today);

    if (!reconciliation) {
      const id = await createDayEndReconciliation({
        businessId: business.id,
        date: today,
        openingBalance: "0" as any,
        daysSales: "0" as any,
        expenditures: "0" as any,
        closingBalance: "0" as any,
      });
      reconciliation = await getDayEndReconciliation(business.id, today);
    }

    return reconciliation;
  }),

  create: protectedProcedure
    .input(
      z.object({
        date: z.string(),
        openingBalance: z.string(),
        daysSales: z.string(),
        expenditures: z.string(),
        cashAtHand: z.string().optional(),
        mpesaTotal: z.string().optional(),
        cardTotal: z.string().optional(),
        credits: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) throw new TRPCError({ code: "NOT_FOUND" });

      const closingBalance = (parseFloat(input.openingBalance) + parseFloat(input.daysSales) - parseFloat(input.expenditures)).toString();

      const reconciliationId = await createDayEndReconciliation({
        businessId: business.id,
        date: input.date,
        openingBalance: input.openingBalance as any,
        daysSales: input.daysSales as any,
        expenditures: input.expenditures as any,
        closingBalance: closingBalance as any,
        cashAtHand: input.cashAtHand ? (input.cashAtHand as any) : null,
        mpesaTotal: input.mpesaTotal ? (input.mpesaTotal as any) : null,
        cardTotal: input.cardTotal ? (input.cardTotal as any) : null,
        credits: input.credits ? (input.credits as any) : null,
      });

      return reconciliationId;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        cashAtHand: z.string().optional(),
        mpesaTotal: z.string().optional(),
        cardTotal: z.string().optional(),
        expenditures: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) throw new TRPCError({ code: "NOT_FOUND" });

      const updateData: Record<string, any> = {};
      if (input.cashAtHand) updateData.cashAtHand = input.cashAtHand;
      if (input.mpesaTotal) updateData.mpesaTotal = input.mpesaTotal;
      if (input.cardTotal) updateData.cardTotal = input.cardTotal;
      if (input.expenditures) updateData.expenditures = input.expenditures;

      await updateDayEndReconciliation(input.id, updateData);
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

  get: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const business = await getBusinessByUserId(ctx.user.id);
      if (!business) return null;
      return getDayEndReconciliation(business.id, input.date);
    }),

  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const business = await getBusinessByUserId(ctx.user.id);
    if (!business) return [];
    return getDayEndReconciliationHistory(business.id);
  }),
});
