import { z } from "zod";
import { productVariants } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { storagePut } from "./storage";
import { router, protectedProcedure } from "./_core/trpc";

export const variantRouter = router({
  // List variants for a product
  listByProduct: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const variants = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, input.productId))
        .orderBy((v: any) => v.order);
      return variants;
    }),

  // Create variant
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        name: z.string().min(1),
        sku: z.string().optional(),
        price: z.string(),
        stock: z.number().min(0),
        size: z.string().optional(),
        color: z.string().optional(),
        quality: z.string().optional(),
        origin: z.string().optional(),
        materials: z.string().optional(),
        description: z.string().optional(),
        imageBase64: z.string().optional(),
        imageMimeType: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        let imageUrl: string | undefined;
        let imageKey: string | undefined;

        if (input.imageBase64 && input.imageMimeType) {
          try {
            const buffer = Buffer.from(input.imageBase64, "base64");
            const fileName = `variant-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            const result = await storagePut(
              `products/variants/${fileName}`,
              buffer,
              input.imageMimeType
            );
            imageUrl = result.url;
            imageKey = result.key;
          } catch (imageError) {
            console.error("Image upload failed:", imageError);
            throw new Error("Failed to upload variant image");
          }
        }

        const priceDecimal = parseFloat(input.price).toFixed(2);
        
        const result = await db.insert(productVariants).values({
          productId: input.productId,
          name: input.name,
          sku: input.sku || null,
          price: priceDecimal as any,
          stock: parseInt(input.stock.toString()),
          size: input.size || null,
          color: input.color || null,
          quality: input.quality || null,
          origin: input.origin || null,
          materials: input.materials || null,
          description: input.description || null,
          imageUrl: imageUrl || null,
          imageKey: imageKey || null,
          order: 0,
          isActive: true,
        } as any);

        return { success: true };
      } catch (error) {
        console.error("Variant creation error:", error);
        throw error;
      }
    }),

  // Update variant
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        sku: z.string().optional(),
        price: z.string().optional(),
        stock: z.number().optional(),
        size: z.string().optional(),
        color: z.string().optional(),
        quality: z.string().optional(),
        origin: z.string().optional(),
        materials: z.string().optional(),
        description: z.string().optional(),
        imageBase64: z.string().optional(),
        imageMimeType: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const updates: any = {};

      if (input.name !== undefined) updates.name = input.name;
      if (input.sku !== undefined) updates.sku = input.sku;
      if (input.price !== undefined) updates.price = input.price;
      if (input.stock !== undefined) updates.stock = input.stock;
      if (input.size !== undefined) updates.size = input.size;
      if (input.color !== undefined) updates.color = input.color;
      if (input.quality !== undefined) updates.quality = input.quality;
      if (input.origin !== undefined) updates.origin = input.origin;
      if (input.materials !== undefined) updates.materials = input.materials;
      if (input.description !== undefined) updates.description = input.description;

      if (input.imageBase64 && input.imageMimeType) {
        const buffer = Buffer.from(input.imageBase64, "base64");
        const fileName = `variant-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const result = await storagePut(
          `products/variants/${fileName}`,
          buffer,
          input.imageMimeType
        );
        updates.imageUrl = result.url;
        updates.imageKey = result.key;
      }

      await db.update(productVariants).set(updates as any).where(eq(productVariants.id, input.id));

      return { success: true };
    }),

  // Delete variant
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      await db.delete(productVariants).where(eq(productVariants.id, input.id));
      return { success: true };
    }),

  // Reorder variants
  reorder: protectedProcedure
    .input(
      z.object({
        variants: z.array(
          z.object({
            id: z.number(),
            order: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      for (const v of input.variants) {
        await db.update(productVariants).set({ order: v.order } as any).where(eq(productVariants.id, v.id));
      }
      return { success: true };
    }),
});
