import { v } from "convex/values";
import { query, mutation, action, internalQuery, internalMutation, internalAction } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const getUserCollages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const collages = await ctx.db
      .query("collages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      collages.map(async (collage) => {
        const products = await ctx.db
          .query("products")
          .withIndex("by_collage", (q) => q.eq("collageId", collage._id))
          .collect();

        const originalImageUrl = await ctx.storage.getUrl(collage.originalImageId);
        const collageImageUrl = collage.collageImageId 
          ? await ctx.storage.getUrl(collage.collageImageId)
          : null;

        return {
          ...collage,
          products,
          originalImageUrl,
          collageImageUrl,
        };
      })
    );
  },
});

export const getCollage = query({
  args: { collageId: v.id("collages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const collage = await ctx.db.get(args.collageId);
    if (!collage || collage.userId !== userId) {
      throw new Error("Collage not found");
    }

    const products = await ctx.db
      .query("products")
      .withIndex("by_collage", (q) => q.eq("collageId", collage._id))
      .collect();

    const originalImageUrl = await ctx.storage.getUrl(collage.originalImageId);
    const collageImageUrl = collage.collageImageId 
      ? await ctx.storage.getUrl(collage.collageImageId)
      : null;

    return {
      ...collage,
      products,
      originalImageUrl,
      collageImageUrl,
    };
  },
});

export const createCollage = mutation({
  args: {
    originalImageId: v.id("_storage"),
    products: v.array(v.object({
      name: v.string(),
      brand: v.string(),
      url: v.optional(v.string()),
    })),
    style: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const productsText = args.products
      .map(p => `${p.name} by ${p.brand}${p.url ? ` (${p.url})` : ''}`)
      .join(', ');

    const prompt = `Create a fashion mood board collage in ${args.style} style. The collage should feature cutouts and illustrations of these fashion items: ${productsText}.

IMPORTANT: When adding text labels to the collage, you must use these EXACT spellings for brand and product names (do not change, correct, or modify the spelling in any way):
${args.products.map(p => `- Product: "${p.name}" (spell exactly as shown)
- Brand: "${p.brand}" (spell exactly as shown)`).join('\n')}

Include handwritten-style labels with these exact brand names and product names as provided above. The overall aesthetic should be ${args.style}. Make it look like a professional fashion mood board with a clean layout, good typography, and stylish presentation. Size should be 1080x1080 pixels, perfect for social media sharing.`;

    const collageId = await ctx.db.insert("collages", {
      userId,
      originalImageId: args.originalImageId,
      prompt,
      style: args.style,
      status: "generating",
    });

    // Insert products
    for (const product of args.products) {
      await ctx.db.insert("products", {
        collageId,
        ...product,
      });
    }

    // Schedule AI generation
    await ctx.scheduler.runAfter(0, internal.collages.generateCollage, {
      collageId,
    });

    return collageId;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const generateCollage = internalAction({
  args: { collageId: v.id("collages") },
  handler: async (ctx, args) => {
    // Call the Node.js action for Google AI generation
    await ctx.runAction(internal.googleAI.generateCollageWithGoogle, {
      collageId: args.collageId,
    });
  },
});

export const getCollageForGeneration = internalQuery({
  args: { collageId: v.id("collages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.collageId);
  },
});

export const updateCollageStatus = internalMutation({
  args: {
    collageId: v.id("collages"),
    status: v.union(v.literal("generating"), v.literal("completed"), v.literal("failed")),
    collageImageId: v.optional(v.id("_storage")),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.collageId, {
      status: args.status,
      ...(args.collageImageId && { collageImageId: args.collageImageId }),
      ...(args.errorMessage && { errorMessage: args.errorMessage }),
    });
  },
});
