import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export async function getViewerId(
  ctx: QueryCtx | MutationCtx,
  viewerIdArg?: string
) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity?.subject) return identity.subject;

  const clerkIssuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;
  const isClerkAuthEnabled = Boolean(clerkIssuerDomain && clerkIssuerDomain !== "DISABLED");

  if (!isClerkAuthEnabled && viewerIdArg) return viewerIdArg;
  throw new Error("Not authenticated");
}

export async function assertConversationMember(
  ctx: QueryCtx | MutationCtx,
  conversationId: Id<"conversations">,
  viewerId: string
) {
  const membership = await ctx.db
    .query("conversationMembers")
    .withIndex("by_conversationId", (q) => q.eq("conversationId", conversationId))
    .filter((q) => q.eq(q.field("userId"), viewerId))
    .unique();

  if (!membership) throw new Error("Permission denied");
}

