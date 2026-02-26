import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const userStatus = v.union(
  v.literal("online"),
  v.literal("away"),
  v.literal("offline")
);

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    status: v.optional(userStatus),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .searchIndex("search_name", { searchField: "name" }),

  conversations: defineTable({
    type: v.union(v.literal("dm"), v.literal("room")),
    title: v.optional(v.string()),
    createdAt: v.number(),
    lastMessageAt: v.optional(v.number()),
  }).index("by_lastMessageAt", ["lastMessageAt"]),

  conversationMembers: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    joinedAt: v.number(),
    lastReadAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId", "conversationId"])
    .index("by_conversationId", ["conversationId", "userId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    body: v.optional(v.string()),
    createdAt: v.number(),
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.string()),
    reactions: v.optional(
      v.array(
        v.object({
          emoji: v.string(),
          userId: v.string(),
        })
      )
    ),
  }).index("by_conversationId_createdAt", ["conversationId", "createdAt"]),

  typing: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_conversationId", ["conversationId", "updatedAt"])
    .index("by_conversationId_userId", ["conversationId", "userId"]),
});
