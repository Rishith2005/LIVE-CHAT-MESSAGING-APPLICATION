"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConversationItem } from "@/components/chat/conversation-item";
import { ConversationSkeleton } from "@/components/chat/conversation-skeleton";
import { EmptyState } from "@/components/system/empty-state";
import { demoConversations, demoUsers } from "@/lib/mock";
import { formatListTimestamp } from "@/lib/format";
import { Search, UserPlus } from "lucide-react";
import { isClerkConfigured, isConvexConfigured } from "@/lib/env";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { demoCurrentUser } from "@/lib/mock";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  if (isConvexConfigured()) return <DashboardConvex />;
  return <DashboardDemo />;
}

function DashboardConvex() {
  if (isClerkConfigured()) return <DashboardConvexClerk />;
  return <DashboardConvexInner viewerId={demoCurrentUser.id} />;
}

function DashboardConvexClerk() {
  const { isLoaded, user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  if (!isLoaded) return null;
  if (!user) return null;
  if (!isAuthenticated) {
    return (
      <div className="flex h-full">
        <div className="w-full border-r border-border bg-card/50 backdrop-blur md:w-[360px]">
          <div className="border-b border-border p-4">
            <p className="text-sm font-semibold">Conversations</p>
          </div>
          <ScrollArea className="h-[calc(100dvh-64px-144px)]">
            <ConversationSkeleton />
          </ScrollArea>
        </div>
      </div>
    );
  }

  return <DashboardConvexInner />;
}

function DashboardConvexInner(props?: { viewerId?: string }) {
  const [query, setQuery] = useState("");
  const viewerId = props?.viewerId;
  const conversations = useQuery(api.conversations.listForViewer, { viewerId });

  type ConversationRow = {
    conversationId: string;
    title: string;
    lastMessage?: string;
    lastMessageAt: number;
    unreadCount: number;
    peer?: {
      userId: string;
      name: string;
      imageUrl?: string;
      status?: "online" | "away" | "offline";
    };
  };

  const loading = conversations === undefined;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = (conversations ?? []) as unknown as ConversationRow[];
    if (!q) return rows;
    return rows.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, query]);

  return (
    <div className="flex h-full">
      <div className="w-full border-r border-border bg-card/50 backdrop-blur md:w-[360px]">
        <div className="border-b border-border p-4">
          <p className="text-sm font-semibold">Conversations</p>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              placeholder="Search conversations…"
              aria-label="Search conversations"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100dvh-64px-144px)]">
          {loading ? (
            <ConversationSkeleton />
          ) : (conversations?.length ?? 0) === 0 ? (
            <div className="h-[60vh]">
              <EmptyState
                type="no-conversations"
                title="No conversations yet"
                description="Start a new chat to see it appear here."
                actionLabel="Discover people"
                onAction={() => (window.location.href = "/discover")}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-[60vh]">
              <EmptyState
                type="no-results"
                title="No matches"
                description="Try searching by name."
              />
            </div>
          ) : (
            <div className="p-2">
              {filtered.map((c) => {
                const peer = c.peer
                  ? {
                      id: c.peer.userId,
                      name: c.peer.name,
                      email: "",
                      avatarUrl: c.peer.imageUrl,
                      status: c.peer.status ?? "offline",
                    }
                  : undefined;
                return (
                  <ConversationItem
                    key={String(c.conversationId)}
                    conversationId={String(c.conversationId)}
                    title={c.title}
                    lastMessage={c.lastMessage ?? ""}
                    timestamp={formatListTimestamp(new Date(c.lastMessageAt))}
                    unreadCount={c.unreadCount}
                    peer={peer}
                  />
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border p-4">
          <Button asChild className="w-full rounded-xl">
            <Link href="/discover">
              <UserPlus className="h-4 w-4" />
              New conversation
            </Link>
          </Button>
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center md:flex">
        <EmptyState
          type="inbox-zero"
          title="Choose a conversation"
          description="Select a chat from the left to start messaging."
        />
      </div>
    </div>
  );
}

function DashboardDemo() {
  const [query, setQuery] = useState("");
  const [loading] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return demoConversations;
    return demoConversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="flex h-full">
      <div className="w-full border-r border-border bg-card/50 backdrop-blur md:w-[360px]">
        <div className="border-b border-border p-4">
          <p className="text-sm font-semibold">Conversations</p>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              placeholder="Search conversations…"
              aria-label="Search conversations"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100dvh-64px-144px)]">
          {loading ? (
            <ConversationSkeleton />
          ) : demoConversations.length === 0 ? (
            <div className="h-[60vh]">
              <EmptyState
                type="no-conversations"
                title="No conversations yet"
                description="Start a new chat to see it appear here."
                actionLabel="Discover people"
                onAction={() => (window.location.href = "/discover")}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-[60vh]">
              <EmptyState
                type="no-results"
                title="No matches"
                description="Try searching by name."
              />
            </div>
          ) : (
            <div className="p-2">
              {filtered.map((c) => {
                const peer = demoUsers.find((u) => u.name === c.title);
                return (
                  <ConversationItem
                    key={c.id}
                    conversationId={c.id}
                    title={c.title}
                    lastMessage={c.lastMessage}
                    timestamp={formatListTimestamp(c.lastMessageAt)}
                    unreadCount={c.unreadCount}
                    peer={peer}
                  />
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border p-4">
          <Button asChild className="w-full rounded-xl">
            <Link href="/discover">
              <UserPlus className="h-4 w-4" />
              New conversation
            </Link>
          </Button>
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center md:flex">
        <EmptyState
          type="inbox-zero"
          title="Choose a conversation"
          description="Select a chat from the left to start messaging."
          badge="Demo"
        />
      </div>
    </div>
  );
}
