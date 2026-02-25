"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ConvexProvider } from "@/lib/convex/convex-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/env";
import { isConvexConfigured } from "@/lib/env";
import { ConvexBootstrap } from "@/components/providers/convex-bootstrap";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const content = (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ConvexProvider>
        {isConvexConfigured() ? <ConvexBootstrap /> : null}
        {children}
      </ConvexProvider>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );

  if (!isClerkConfigured()) return content;
  return <ClerkProvider>{content}</ClerkProvider>;
}

