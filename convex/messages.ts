import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertConversationMember, getViewerId } from "./lib/auth";

export const list = query({
  args: {
    conversationId: v.id("conversations"),
    viewerId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx, args.viewerId);
    await assertConversationMember(ctx, args.conversationId, viewerId);

    const limit = Math.max(1, Math.min(args.limit ?? 200, 500));
    const page = await ctx.db
      .query("messages")
      .withIndex("by_conversationId_createdAt", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(limit);

    return page.reverse();
  },
});

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    body: v.string(),
    viewerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx, args.viewerId);
    await assertConversationMember(ctx, args.conversationId, viewerId);

    const body = args.body.trim();
    if (!body) throw new Error("Message required");

    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: viewerId,
      body,
      createdAt: now,
    });

    await ctx.db.patch(args.conversationId, { lastMessageAt: now });
    return { messageId, createdAt: now };
  },
});

export const remove = mutation({
  args: { messageId: v.id("messages"), viewerId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx, args.viewerId);
    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Not found");
    await assertConversationMember(ctx, msg.conversationId, viewerId);
    if (msg.senderId !== viewerId) throw new Error("Permission denied");

    const now = Date.now();
    await ctx.db.patch(args.messageId, {
      body: "",
      deletedAt: now,
      deletedBy: viewerId,
    });
    return { deletedAt: now };
  },
});

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
    viewerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx, args.viewerId);
    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Not found");
    await assertConversationMember(ctx, msg.conversationId, viewerId);

    const emoji = args.emoji.trim();
    if (!emoji) throw new Error("Invalid emoji");

    const current = (msg.reactions ?? []) as Array<{ emoji: string; userId: string }>;
    const exists = current.some((r) => r.emoji === emoji && r.userId === viewerId);
    const next = exists
      ? current.filter((r) => !(r.emoji === emoji && r.userId === viewerId))
      : [...current, { emoji, userId: viewerId }];

    await ctx.db.patch(args.messageId, { reactions: next });
    return { ok: true };
  },
});

