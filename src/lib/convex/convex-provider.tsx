"use client";

import { ConvexReactClient, ConvexProvider as ConvexProviderBase } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { isConvexConfigured } from "@/lib/env";
import { isClerkConfigured } from "@/lib/env";

let client: ConvexReactClient | null = null;

function getClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return null;
  if (client) return client;
  client = new ConvexReactClient(url);
  return client;
}

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  if (!isConvexConfigured()) return <>{children}</>;
  const c = getClient();
  if (!c) return <>{children}</>;
  if (isClerkConfigured()) {
    return (
      <ConvexProviderWithClerk client={c} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    );
  }
  return <ConvexProviderBase client={c}>{children}</ConvexProviderBase>;
}

