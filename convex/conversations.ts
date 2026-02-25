import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { assertConversationMember, getViewerId } from "./lib/auth";

async function getUserByUserId(ctx: QueryCtx | MutationCtx, userId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
}

export const listForViewer = query({
  args: { viewerId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx, args.viewerId);

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", viewerId))
      .collect();

    const rows = [];
    for (const m of memberships) {
      const c = await ctx.db.get(m.conversationId);
      if (!c) continue;

      const last = await ctx.db
        .query("messages")
        .withIndex("by_conversationId_createdAt", (q) =>
          q.eq("conversationId", c._id)
        )
        .order("desc")
        .take(1);

      const lastMessage = last[0];
      const lastMessageAt = lastMessage?.createdAt ?? c.lastMessageAt ?? c.createdAt;

      const members = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversationId", (q) => q.eq("conversationId", c._id))
        .collect();

      const memberIds = members.map((mm) => mm.userId);
      const peerId = memberIds.find((id) => id !== viewerId);
      const peer = peerId ? await getUserByUserId(ctx, peerId) : null;

      const title = c.type === "room" ? c.title ?? "Room" : peer?.name ?? "Direct message";
      const preview =
        !lastMessage
          ? ""
          : lastMessage.deletedAt
            ? "Message deleted"
            : (lastMessage.body ?? "");

      rows.push({
        conversationId: c._id,
        type: c.type,
        title,
        peer,
        lastMessage: preview,
        lastMessageAt,
        unreadCount: 0,
        memberIds,
      });
    }

    rows.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    return rows;
  },
});

export const get = query({
  args: { conversationId: v.id("conversations"), viewerId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx, args.viewerId);
    await assertConversationMember(ctx, args.conversationId, viewerId);
    const c = await ctx.db.get(args.conversationId);
    if (!c) return null;

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const memberIds = memberships.map((m) => m.userId);
    const members = [];
    for (const id of memberIds) {
      const u = await getUserByUserId(ctx, id);
      if (u) members.push(u);
    }

    const peerId = memberIds.find((id) => id !== viewerId);
    const peer = peerId ? await getUserByUserId(ctx, peerId) : null;
    const title = c.type === "room" ? c.title ?? "Room" : peer?.name ?? "Direct message";

    return { ...c, title, memberIds, members, peer };
  },
});

export const createDm = mutation({
  args: { otherUserId: v.string(), viewerId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx, args.viewerId);
    if (viewerId === args.otherUserId) throw new Error("Invalid user");

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", viewerId))
      .collect();

    for (const m of memberships) {
      const c = await ctx.db.get(m.conversationId);
      if (!c || c.type !== "dm") continue;
      const others = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversationId", (q) =>
          q.eq("conversationId", c._id)
        )
        .collect();

      const ids = others.map((mm) => mm.userId).sort();
      const want = [viewerId, args.otherUserId].sort();
      if (ids.length === 2 && ids[0] === want[0] && ids[1] === want[1]) {
        return { conversationId: c._id, created: false };
      }
    }

    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      type: "dm",
      createdAt: now,
      lastMessageAt: now,
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: viewerId,
      joinedAt: now,
    });
    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: args.otherUserId,
      joinedAt: now,
    });

    return { conversationId, created: true };
  },
});

export const createRoom = mutation({
  args: { title: v.string(), memberIds: v.array(v.string()), viewerId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx, args.viewerId);
    const title = args.title.trim();
    if (!title) throw new Error("Title required");

    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      type: "room",
      title,
      createdAt: now,
      lastMessageAt: now,
    });

    const unique = Array.from(new Set([viewerId, ...args.memberIds]));
    for (const userId of unique) {
      await ctx.db.insert("conversationMembers", {
        conversationId,
        userId,
        joinedAt: now,
      });
    }

    return { conversationId };
  },
});

