"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { isClerkConfigured } from "@/lib/env";
import { demoCurrentUser } from "@/lib/mock";
import { useUser } from "@clerk/nextjs";

export function ConvexBootstrap() {
  if (isClerkConfigured()) return <ConvexBootstrapClerkAware />;
  return <ConvexBootstrapDemo />;
}

function ConvexBootstrapDemo() {
  const didRun = useRef(false);
  const seedDemo = useMutation(api.seed.seedDemo);
  const upsertViewer = useMutation(api.users.upsertViewer);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    void seedDemo({});
    void upsertViewer({
      viewerId: demoCurrentUser.id,
      name: demoCurrentUser.name,
      imageUrl: demoCurrentUser.avatarUrl,
      status: "online",
    });
  }, [seedDemo, upsertViewer]);

  return null;
}

function ConvexBootstrapClerkAware() {
  const { isAuthenticated } = useConvexAuth();
  if (isAuthenticated) return <ConvexBootstrapClerk />;
  return <ConvexBootstrapClerkFallback />;
}

function ConvexBootstrapClerkFallback() {
  const didRun = useRef(false);
  const { user } = useUser();
  const seedDemo = useMutation(api.seed.seedDemo);
  const upsertViewer = useMutation(api.users.upsertViewer);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    void seedDemo({});
    if (!user) return;
    void upsertViewer({
      viewerId: user.id,
      name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress,
      imageUrl: user.imageUrl,
      status: "online",
    });
  }, [seedDemo, upsertViewer, user]);

  return null;
}

function ConvexBootstrapClerk() {
  const didRun = useRef(false);
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const upsertViewer = useMutation(api.users.upsertViewer);

  useEffect(() => {
    if (didRun.current) return;
    if (!user) return;
    if (!isAuthenticated) return;
    didRun.current = true;
    void upsertViewer({
      name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress,
      imageUrl: user.imageUrl,
      status: "online",
    });
  }, [isAuthenticated, upsertViewer, user]);

  return null;
}

