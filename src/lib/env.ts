export function isClerkConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

export function isConvexConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}

