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
  }).index("by_user", ["userId"]),
  
  products: defineTable({
    collageId: v.id("collages"),
    name: v.string(),
    brand: v.string(),
    url: v.optional(v.string()),
  }).index("by_collage", ["collageId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
