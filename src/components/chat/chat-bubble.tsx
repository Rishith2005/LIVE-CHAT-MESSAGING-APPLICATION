"use client";

import { cn } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "@/components/chat/emoji-picker";
import { AlertTriangle, Check, CheckCheck, Loader2, Trash2 } from "lucide-react";

export function ChatBubble(props: {
  body: string;
  timestamp: string;
  sender: boolean;
  read?: boolean;
  deleted?: boolean;
  reactions?: string[];
  status?: "sent" | "sending" | "failed";
  onRetry?: () => void;
  onDelete?: () => void;
  onAddReaction?: (emoji: string) => void;
}) {
  const {
    body,
    timestamp,
    sender,
    read,
    deleted,
    reactions,
    status = "sent",
    onRetry,
    onDelete,
    onAddReaction,
  } = props;

  const showActions = !deleted && status !== "sending" && (onDelete || onAddReaction);

  return (
    <div
      className={cn(
        "flex max-w-[72%] flex-col gap-1",
        sender ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      <div className={cn("relative group", sender ? "self-end" : "self-start")}>
        {showActions ? (
          <div
            className={cn(
              "absolute -top-10 opacity-0 transition-opacity group-hover:opacity-100",
              sender ? "right-0" : "left-0"
            )}
          >
            <div className="flex items-center gap-1 rounded-full border border-border bg-popover/90 px-1 py-1 shadow-sm backdrop-blur">
              {onAddReaction ? (
                <>
                  {["👍", "❤️", "😂", "🎉"].map((e) => (
                    <button
                      key={e}
                      type="button"
                      className="h-8 w-8 rounded-full text-base transition-colors hover:bg-accent"
                      onClick={() => onAddReaction(e)}
                    >
                      {e}
                    </button>
                  ))}
                  <EmojiPicker onSelect={onAddReaction} />
                </>
              ) : null}
              {onDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                  onClick={onDelete}
                  aria-label="Delete message"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 shadow-sm",
            sender
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "bg-card border border-border rounded-tl-md",
            deleted ? "bg-muted/40 border-dashed" : "",
            status === "failed" ? "border border-destructive/40" : ""
          )}
        >
          {deleted ? (
            <p className="text-sm italic text-muted-foreground">This message was deleted</p>
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{body}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-1">
        <span className="text-xs text-muted-foreground">{timestamp}</span>
        {!deleted && status === "sending" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : null}
        {!deleted && status === "failed" ? (
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
        ) : null}
        {sender && !deleted && status === "sent" ? (
          read ? (
            <CheckCheck className="h-3.5 w-3.5 text-[--color-success]" />
          ) : (
            <Check className="h-3.5 w-3.5 text-muted-foreground" />
          )
        ) : null}
      </div>

      {status === "failed" && onRetry && !deleted ? (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "px-1 text-xs text-destructive hover:underline",
            sender ? "text-right" : "text-left"
          )}
        >
          Failed to send. Retry
        </button>
      ) : null}

      {reactions && reactions.length ? (
        <div className={cn("mt-1 flex gap-1", sender ? "justify-end" : "justify-start")}>
          {reactions.map((e, i) => (
            <span key={`${e}-${i}`} className="rounded-full bg-muted px-2 py-0.5 text-sm">
              {e}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

