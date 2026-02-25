"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/components/ui/utils";

export function Avatar(props: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  const { className, ...rest } = props;
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...rest}
    />
  );
}

export function AvatarImage(
  props: React.ComponentProps<typeof AvatarPrimitive.Image>
) {
  const { className, ...rest } = props;
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("h-full w-full object-cover", className)}
      {...rest}
    />
  );
}

export function AvatarFallback(
  props: React.ComponentProps<typeof AvatarPrimitive.Fallback>
) {
  const { className, ...rest } = props;
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground",
        className
      )}
      {...rest }
    />
  );
}

