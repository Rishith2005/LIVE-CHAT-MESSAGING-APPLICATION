"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";

export function Input(props: React.ComponentProps<"input">) {
  const { className, type, ...rest } = props;
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-[--color-input-background] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
        className
      )}
      {...rest}
    />
  );
}

