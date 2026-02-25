import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getViewerId } from "./lib/auth";

export const upsertViewer = mutation({
  args: {
    viewerId: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("online"), v.literal("away"), v.literal("offline"))
    ),
  },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx, args.viewerId);
    const now = Date.now();

    const identity = await ctx.auth.getUserIdentity();
    const fallbackName =
      identity?.name || identity?.nickname || identity?.email || "User";

    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", viewerId))
      .unique();

    const name = args.name?.trim() || fallbackName;
    const imageUrl = args.imageUrl || identity?.pictureUrl;

    if (!existing) {
      await ctx.db.insert("users", {
        userId: viewerId,
        name,
        imageUrl,
        status: args.status,
        updatedAt: now,
      });
      return { viewerId, created: true };
    }

    await ctx.db.patch(existing._id, {
      name,
      imageUrl,
      status: args.status ?? existing.status,
      updatedAt: now,
    });
    return { viewerId, created: false };
  },
});

export const getViewer = query({
  args: { viewerId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx, args.viewerId);
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", viewerId))
      .unique();
  },
});

export const getMany = query({
  args: { userIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const unique = Array.from(new Set(args.userIds));
    const out = [];
    for (const userId of unique) {
      const u = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();
      if (u) out.push(u);
    }
    return out;
  },
});

export const search = query({
  args: { query: v.string(), viewerId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx, args.viewerId);
    const q = args.query.trim();

    let users;
    if (!q) {
      users = await ctx.db.query("users").order("desc").take(20);
    } else {
      users = await ctx.db
        .query("users")
        .withSearchIndex("search_name", (s) => s.search("name", q))
        .take(20);
    }

    return users.filter((u) => u.userId !== viewerId);
  },
});

