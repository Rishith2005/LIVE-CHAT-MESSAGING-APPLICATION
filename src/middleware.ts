import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

const handler = isClerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      if (isPublicRoute(req)) return;
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }
    })
  : () => NextResponse.next();

export default handler;

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
