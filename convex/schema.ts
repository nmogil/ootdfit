import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  collages: defineTable({
    userId: v.id("users"),
    originalImageId: v.id("_storage"),
    collageImageId: v.optional(v.id("_storage")),
    prompt: v.string(),
    style: v.string(),
    status: v.union(v.literal("generating"), v.literal("completed"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
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
  }).index("by_user", ["userId"]),
  
  products: defineTable({
    collageId: v.id("collages"),
    name: v.string(),
    brand: v.string(),
    url: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
  }).index("by_collage", ["collageId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
