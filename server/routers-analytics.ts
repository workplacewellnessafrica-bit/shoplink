import { z } from "zod";
import { orders } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { router, protectedProcedure } from "./_core/trpc";

export const analyticsRouter = router({
  // Get day sales with breakdown by channel and payment method
  getDaySales: protectedProcedure
    .input(z.object({ date: z.string().optional() }))
    .query(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const targetDate = input.date ? new Date(input.date) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all orders for the business
      const allOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.businessId, ctx.user.businessId));

      // Filter by date in JavaScript since createdAt is a timestamp
      const dayOrders = allOrders.filter((o: any) => {
        const orderTime = typeof o.createdAt === 'number' ? o.createdAt : new Date(o.createdAt).getTime();
        return orderTime >= startOfDay.getTime() && orderTime <= endOfDay.getTime();
      });

      // Calculate totals by channel and payment method
      const webSales = dayOrders
        .filter((o: any) => o.channel === "web")
        .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

      const posSales = dayOrders
        .filter((o: any) => o.channel === "pos")
        .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

      const paymentBreakdown = {
        cash: dayOrders
          .filter((o: any) => o.channel === "pos" && o.paymentMethod === "cash")
          .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
        card: dayOrders
          .filter((o: any) => o.channel === "pos" && o.paymentMethod === "card")
          .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
        mpesa: dayOrders
          .filter((o: any) => o.channel === "pos" && o.paymentMethod === "mpesa")
          .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
        credit: dayOrders
          .filter((o: any) => o.channel === "pos" && o.paymentMethod === "credit")
          .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
      };

      return {
        date: targetDate.toISOString().split("T")[0],
        totalSales: webSales + posSales,
        webSales,
        posSales,
        orderCount: dayOrders.length,
        paymentBreakdown,
      };
    }),

  // Get sales for date range
  getSalesRange: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const start = new Date(input.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(input.endDate);
      end.setHours(23, 59, 59, 999);

      const allOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.businessId, ctx.user.businessId));

      // Filter by date range in JavaScript
      const rangeOrders = allOrders.filter((o: any) => {
        const orderTime = typeof o.createdAt === 'number' ? o.createdAt : new Date(o.createdAt).getTime();
        return orderTime >= start.getTime() && orderTime <= end.getTime();
      });

      const totalSales = rangeOrders.reduce(
        (sum: number, o: any) => sum + (o.totalAmount || 0),
        0
      );
      const webSales = rangeOrders
        .filter((o: any) => o.channel === "web")
        .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      const posSales = rangeOrders
        .filter((o: any) => o.channel === "pos")
        .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

      return {
        startDate: input.startDate,
        endDate: input.endDate,
        totalSales,
        webSales,
        posSales,
        orderCount: rangeOrders.length,
        averageOrderValue: rangeOrders.length > 0 ? totalSales / rangeOrders.length : 0,
      };
    }),
});
