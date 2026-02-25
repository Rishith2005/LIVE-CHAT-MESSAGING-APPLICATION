"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/components/ui/utils";
import { Smile } from "lucide-react";

const base = ["😀", "😅", "😂", "😊", "😍", "🥲", "😉", "👍", "👏", "🙏", "🎉", "✨", "🔥", "💯", "❤️", "💙", "💚", "🤍", "⚡", "🚀"]; 

export function EmojiPicker(props: { onSelect: (emoji: string) => void; disabled?: boolean }) {
  const { onSelect, disabled } = props;
  const [open, setOpen] = useState(false);
  const items = useMemo(() => base, []);
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => setOpen(true)}
        disabled={disabled}
        aria-label="Open emoji picker"
      >
        <Smile className="h-5 w-5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Emoji</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-8 gap-1">
            {items.map((e) => (
              <button
                key={e}
                type="button"
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-xl text-xl transition-colors hover:bg-accent"
                )}
                onClick={() => {
                  onSelect(e);
                  setOpen(false);
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

