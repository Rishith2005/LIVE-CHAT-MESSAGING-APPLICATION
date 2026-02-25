"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";

export function Textarea(props: React.ComponentProps<"textarea">) {
  const { className, ...rest } = props;
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[44px] w-full rounded-2xl border border-border bg-[--color-input-background] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
        className
      )}
      {...rest}
    />
  );
}

