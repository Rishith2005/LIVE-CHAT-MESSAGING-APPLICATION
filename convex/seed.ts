import { mutation } from "./_generated/server";
import { demoCurrentUser, demoUsers } from "./demoData";

export const seedDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("users").take(1);
    if (existing.length > 0) return { seeded: false };

    const now = Date.now();
    for (const u of [demoCurrentUser, ...demoUsers]) {
      await ctx.db.insert("users", {
        userId: u.userId,
        name: u.name,
        imageUrl: u.imageUrl,
        status: u.status,
        updatedAt: now,
      });
    }

    const conversationId = await ctx.db.insert("conversations", {
      type: "dm",
      createdAt: now - 1000 * 60 * 60,
      lastMessageAt: now - 1000 * 60 * 8,
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: demoCurrentUser.userId,
      joinedAt: now - 1000 * 60 * 60,
    });
    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: demoUsers[0].userId,
      joinedAt: now - 1000 * 60 * 60,
    });

    await ctx.db.insert("messages", {
      conversationId,
      senderId: demoUsers[0].userId,
      body: "Hey — welcome to Nebula Chat (Convex demo).",
      createdAt: now - 1000 * 60 * 9,
    });
    await ctx.db.insert("messages", {
      conversationId,
      senderId: demoCurrentUser.userId,
      body: "Nice! This is backed by Convex now.",
      createdAt: now - 1000 * 60 * 8,
    });

    return { seeded: true, conversationId };
  },
});

