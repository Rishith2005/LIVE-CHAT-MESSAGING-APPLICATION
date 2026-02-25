import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertConversationMember, getViewerId } from "./lib/auth";

export const list = query({
  args: { conversationId: v.id("conversations"), viewerId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx, args.viewerId);
    await assertConversationMember(ctx, args.conversationId, viewerId);
    const now = Date.now();

    const rows = await ctx.db
      .query("typing")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    return rows
      .filter((r) => now - r.updatedAt < 4500)
      .map((r) => r.userId)
      .filter((id) => id !== viewerId);
  },
});

export const set = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
    viewerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx, args.viewerId);
    await assertConversationMember(ctx, args.conversationId, viewerId);

    const existing = await ctx.db
      .query("typing")
      .withIndex("by_conversationId_userId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("userId"), viewerId))
      .unique();

    if (!args.isTyping) {
      if (existing) await ctx.db.delete(existing._id);
      return { ok: true };
    }

    const now = Date.now();
    if (!existing) {
      await ctx.db.insert("typing", {
        conversationId: args.conversationId,
        userId: viewerId,
        updatedAt: now,
      });
      return { ok: true };
    }

    await ctx.db.patch(existing._id, { updatedAt: now });
    return { ok: true };
  },
});

