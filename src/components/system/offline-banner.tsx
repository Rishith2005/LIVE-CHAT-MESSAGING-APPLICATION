"use client";

import { cn } from "@/components/ui/utils";
import { CloudOff, Loader2 } from "lucide-react";

export function OfflineBanner(props: {
  offline: boolean;
  reconnecting?: boolean;
  className?: string;
}) {
  const { offline, reconnecting, className } = props;
  if (!offline) return null;
  return (
    <div
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/80 px-4 py-2 backdrop-blur",
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2 text-sm">
        {reconnecting ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <CloudOff className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-muted-foreground">
          {reconnecting ? "Reconnecting…" : "You are offline. Sending is disabled."}
        </span>
      </div>
    </div>
  );
}

