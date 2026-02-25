"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/components/ui/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export function DropdownMenuContent(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Content>
) {
  const { className, sideOffset = 8, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-52 overflow-hidden rounded-2xl border border-border bg-popover p-1 text-popover-foreground shadow-[var(--shadow-soft)]",
          className
        )}
        {...rest}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Item>
) {
  const { className, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-item"
      className={cn(
        "flex cursor-default select-none items-center gap-2 rounded-xl px-3 py-2 text-sm outline-none transition-colors focus:bg-accent",
        className
      )}
      {...rest}
    />
  );
}

export function DropdownMenuSeparator(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>
) {
  const { className, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-separator"
      className={cn("my-1 h-px bg-border", className)}
      {...rest}
    />
  );
}

