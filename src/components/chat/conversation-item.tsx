"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";
import { StatusIndicator } from "@/components/chat/status-indicator";
import type { User } from "@/lib/mock";

export function ConversationItem(props: {
  conversationId: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  peer?: User;
  active?: boolean;
}) {
  const { conversationId, title, lastMessage, timestamp, unreadCount, peer, active } = props;
  const initials = title
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/chat/${conversationId}`}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-accent/50",
        active ? "bg-accent" : "",
        unreadCount > 0 && !active ? "bg-accent/30" : ""
      )}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={peer?.avatarUrl} alt={title} />
          <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1">
            <Badge className="min-w-5 justify-center rounded-full px-1.5">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          </span>
        ) : null}
        {peer ? (
          <span className="absolute bottom-0 right-0 rounded-full bg-background p-0.5">
            <StatusIndicator status={peer.status} size="sm" />
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">{title}</p>
          <span className={cn("shrink-0 text-xs", unreadCount > 0 ? "text-foreground" : "text-muted-foreground")}>
            {timestamp}
          </span>
        </div>
        <p className={cn("truncate text-sm", unreadCount > 0 ? "text-foreground" : "text-muted-foreground")}>
          {lastMessage}
        </p>
      </div>
    </Link>
  );
}
