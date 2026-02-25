"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent(
  props: React.ComponentProps<typeof DialogPrimitive.Content>
) {
  const { className, children, ...rest } = props;
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-popover p-5 text-popover-foreground shadow-[var(--shadow-soft)]",
          className
        )}
        {...rest}
      >
        {children}
        <DialogPrimitive.Close asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 rounded-full"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props;
  return <div className={cn("space-y-1", className)} {...rest} />;
}

export function DialogTitle(props: React.ComponentProps<"h3">) {
  const { className, ...rest } = props;
  return <h3 className={cn("text-base font-semibold", className)} {...rest} />;
}

export function DialogDescription(props: React.ComponentProps<"p">) {
  const { className, ...rest } = props;
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...rest} />
  );
}

export function DialogFooter(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props;
  return (
    <div className={cn("mt-4 flex items-center justify-end gap-2", className)} {...rest} />
  );
}

