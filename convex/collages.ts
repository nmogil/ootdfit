import { v } from "convex/values";
import { query, mutation, action, internalQuery, internalMutation, internalAction } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

function buildPrompt(
  style: string,
  productsText: string,
  products: Array<{ name: string; brand: string; url?: string }>,
  advancedOptions?: {
    colorPalette?: string;
    mood?: string;
    textStyle?: string;
    showLabels?: boolean;
    labelPlacement?: string;
    layout?: string;
    spacing?: string;
    background?: string;
    texture?: boolean;
    decorativeElements?: boolean;
    borderStyle?: string;
  }
) {
  let prompt = `❌ CRITICAL RESTRICTIONS - READ FIRST ❌
- NEVER add clothing items, accessories, or fashion pieces beyond the exact list below
- NEVER use stock photos or generic illustrations of similar items
- NEVER invent items that "would go well" with the outfit
- NEVER add complementary pieces not visible in the uploaded image
- ONLY use visual elements that can be directly seen in the uploaded photo
- ALWAYS include the orginal model in the collage

STRICT REQUIREMENT: You must ONLY work with the uploaded image and create a collage using EXCLUSIVELY the following items that are actually visible in that specific photo. DO NOT ADD, INVENT, OR IMAGINE any additional fashion items.

Fashion items visible in the uploaded image that you MUST use (and ONLY these): ${productsText}.

Create a fashion mood board collage in ${style} style featuring ONLY these specific items from the uploaded image.

VISUAL VERIFICATION REQUIREMENTS:
1. Before adding any item to the collage, verify it is actually visible in the uploaded image
2. If you cannot clearly see an item in the uploaded photo, DO NOT include it
3. Use ONLY the visual elements, colors, and textures from the actual uploaded image
4. DO NOT supplement with stock photos, illustrations, or imagined versions of the items

EXACT SPELLING REQUIREMENTS - When adding text labels to the collage, you must use these EXACT spellings for brand and product names (do not change, correct, or modify the spelling in any way):
${products.map(p => `- Product: "${p.name}" (spell exactly as shown)
- Brand: "${p.brand}" (spell exact/baly as shown)`).join('\n')}

Work EXCLUSIVELY with this uploaded image and extract/highlight/stylize ONLY the specific items listed above that are actually visible in this particular photo.`;

  // Add advanced options if provided
  if (advancedOptions) {
    // Visual Style
    if (advancedOptions.colorPalette && advancedOptions.colorPalette !== 'default') {
      const colorMap: Record<string, string> = {
        'vibrant': 'bright, bold colors with high contrast',
        'pastel': 'soft, muted pastel colors',
        'monochrome': 'black, white, and shades of gray only',
        'earth': 'warm earth tones like browns, terracotta, and sage green',
        'neon': 'electric neon colors that pop',
        'bw': 'strictly black and white with no color'
      };
      prompt += `\n\nColor Palette: Use ${colorMap[advancedOptions.colorPalette] || advancedOptions.colorPalette} throughout the collage.`;
    }

    if (advancedOptions.mood && advancedOptions.mood !== 'default') {
      const moodMap: Record<string, string> = {
        'playful': 'fun, energetic, and whimsical with dynamic elements',
        'elegant': 'sophisticated, refined, and luxurious',
        'edgy': 'bold, dramatic, and modern with sharp contrasts',
        'minimalist': 'clean, simple, and uncluttered',
        'maximalist': 'rich, layered, and visually dense'
      };
      prompt += `\n\nMood: Create a ${moodMap[advancedOptions.mood] || advancedOptions.mood} aesthetic.`;
    }

    // Typography and Labels
    if (advancedOptions.showLabels === false) {
      prompt += `\n\nText Labels: Do NOT include any text labels or brand names in the collage. Focus purely on visual elements and imagery.`;
    } else {
      if (advancedOptions.textStyle && advancedOptions.textStyle !== 'default') {
        const textMap: Record<string, string> = {
          'handwritten': 'casual, handwritten-style fonts',
          'modern': 'clean, modern sans-serif fonts',
          'script': 'elegant script or calligraphy fonts',
          'vintage': 'retro or vintage-inspired typography',
          'bold': 'strong, bold block letters'
        };
        prompt += `\n\nTypography: Use ${textMap[advancedOptions.textStyle] || advancedOptions.textStyle} for all text labels.`;
      }

      if (advancedOptions.labelPlacement && advancedOptions.labelPlacement !== 'default') {
        const placementMap: Record<string, string> = {
          'overlay': 'directly overlaid on or near the product images',
          'side': 'positioned to the side of product images',
          'bottom': 'placed at the bottom of the collage',
          'scattered': 'scattered naturally throughout the composition'
        };
        prompt += `\n\nLabel Placement: Position text labels ${placementMap[advancedOptions.labelPlacement] || advancedOptions.labelPlacement}.`;
      }
    }

    // Layout
    if (advancedOptions.layout && advancedOptions.layout !== 'default') {
      const layoutMap: Record<string, string> = {
        'grid': 'organized in a clean grid pattern',
        'collage': 'overlapping and layered in a natural collage style',
        'centered': 'arranged around a central focal point',
        'asymmetric': 'using asymmetrical, dynamic composition',
        'magazine': 'styled like a magazine editorial layout'
      };
      prompt += `\n\nLayout: Arrange elements ${layoutMap[advancedOptions.layout] || advancedOptions.layout}.`;
    }

    if (advancedOptions.spacing && advancedOptions.spacing !== 'default') {
      const spacingMap: Record<string, string> = {
        'tight': 'densely packed with minimal white space',
        'balanced': 'well-balanced spacing between elements',
        'spacious': 'generous white space and breathing room'
      };
      prompt += `\n\nSpacing: Use ${spacingMap[advancedOptions.spacing] || advancedOptions.spacing}.`;
    }

    // Background
    if (advancedOptions.background && advancedOptions.background !== 'default') {
      const backgroundMap: Record<string, string> = {
        'white': 'clean white background',
        'paper': 'textured paper background',
        'gradient': 'subtle gradient background',
        'pattern': 'subtle pattern background',
        'photo': 'photographic or textured background'
      };
      prompt += `\n\nBackground: Use a ${backgroundMap[advancedOptions.background] || advancedOptions.background}.`;
    }

    if (advancedOptions.texture) {
      prompt += `\n\nTexture: Add subtle texture overlays to give the collage a tactile, handmade feel.`;
    }

    // Special Effects
    if (advancedOptions.decorativeElements) {
      prompt += `\n\nDecorative Elements: Include tasteful decorative elements like stars, hearts, doodles, or geometric shapes.`;
    }

    if (advancedOptions.borderStyle && advancedOptions.borderStyle !== 'none') {
      const borderMap: Record<string, string> = {
        'torn': 'torn or ripped paper edges',
        'polaroid': 'polaroid-style photo frames',
        'rounded': 'rounded corner frames'
      };
      prompt += `\n\nBorder Style: Use ${borderMap[advancedOptions.borderStyle] || advancedOptions.borderStyle} for image elements.`;
    }
  }

  // Always include final requirements and restrictions
  prompt += `\n\nFINAL REQUIREMENTS:
- Include handwritten-style labels with these exact brand names and product names as provided above
- Make it look like a professional fashion mood board with a clean layout, good typography, and stylish presentation
- Size should be 1080x1080 pixels, perfect for social media sharing

🔍 FINAL VERIFICATION CHECKLIST:
Before generating the collage, confirm:
□ Every item in the collage is from the provided list
□ Every item is actually visible in the uploaded image
□ No additional items have been added or invented
□ No stock photos or generic illustrations are used
□ All visual elements come from the actual uploaded photo

REMEMBER: Only use the specific items from the uploaded image that the user identified - do not add any other fashion items or products`;

  return prompt;
}

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
      imageId: v.optional(v.id("_storage")),
    })),
    style: v.string(),
    advancedOptions: v.optional(v.object({
      // Visual Style
      colorPalette: v.optional(v.string()),
      mood: v.optional(v.string()),

      // Typography
      textStyle: v.optional(v.string()),
      showLabels: v.optional(v.boolean()),
      labelPlacement: v.optional(v.string()),

      // Layout
      layout: v.optional(v.string()),
      spacing: v.optional(v.string()),

      // Background
      background: v.optional(v.string()),
      texture: v.optional(v.boolean()),

      // Special Effects
      decorativeElements: v.optional(v.boolean()),
      borderStyle: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const productsText = args.products
      .map(p => `${p.name} by ${p.brand}${p.url ? ` (${p.url})` : ''}`)
      .join(', ');

    const prompt = buildPrompt(args.style, productsText, args.products, args.advancedOptions);

    const collageId = await ctx.db.insert("collages", {
      userId,
      originalImageId: args.originalImageId,
      prompt,
      style: args.style,
      status: "generating",
      advancedOptions: args.advancedOptions,
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
    const collage = await ctx.db.get(args.collageId);
    if (!collage) {
      return null;
    }

    const products = await ctx.db
      .query("products")
      .withIndex("by_collage", (q) => q.eq("collageId", collage._id))
      .collect();

    return {
      ...collage,
      products,
    };
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
