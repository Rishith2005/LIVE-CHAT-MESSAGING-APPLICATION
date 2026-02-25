"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusIndicator } from "@/components/chat/status-indicator";
import { EmptyState } from "@/components/system/empty-state";
import { demoCurrentUser, demoUsers } from "@/lib/mock";
import { Search, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { isClerkConfigured, isConvexConfigured } from "@/lib/env";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

type DiscoverUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: "online" | "offline" | "away";
  bio?: string;
};

export default function DiscoverPage() {
  if (isConvexConfigured()) return <DiscoverConvex />;
  return <DiscoverDemo />;
}

function DiscoverConvex() {
  if (isClerkConfigured()) return <DiscoverConvexClerk />;
  return <DiscoverConvexInner viewerId={demoCurrentUser.id} />;
}

function DiscoverConvexClerk() {
  const { isLoaded, user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  if (!isLoaded) return null;
  if (!user) return null;
  if (!isAuthenticated) return null;
  return <DiscoverConvexInner />;
}

function DiscoverConvexInner(props?: { viewerId?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const viewerId = props?.viewerId;

  const results = useQuery(api.users.search, {
    query,
    viewerId,
  });

  const createDm = useMutation(api.conversations.createDm);

  type SearchUserRow = {
    userId: string;
    name?: string;
    imageUrl?: string;
    status?: "online" | "away" | "offline";
  };

  const mapped: DiscoverUser[] = useMemo(() => {
    return ((results ?? []) as unknown as SearchUserRow[]).map((u) => {
      const status = u.status === "online" || u.status === "away" ? u.status : "offline";
      return {
        id: String(u.userId),
        name: String(u.name ?? ""),
        email: "",
        avatarUrl: u.imageUrl ? String(u.imageUrl) : undefined,
        status,
      };
    });
  }, [results]);

  return (
    <div className="h-full">
      <div className="border-b border-border bg-card/50 p-4 backdrop-blur">
        <p className="text-sm font-semibold">Discover</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Search people and start a conversation.
        </p>
        <div className="mt-3 relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pl-10"
            placeholder="Search by name, email, bio…"
            aria-label="Search people"
            autoFocus
          />
        </div>
      </div>

      <div className="mx-auto max-w-5xl p-4">
        {(mapped.length ?? 0) === 0 ? (
          <div className="h-[60vh]">
            <EmptyState
              type="no-results"
              title="No users found"
              description="Try a different query."
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {mapped.map((u) => (
              <Card key={u.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={u.avatarUrl} alt={u.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {u.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 rounded-full bg-background p-1">
                      <StatusIndicator status={u.status} size="sm" ping={u.status === "online"} />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{u.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                    {u.bio ? (
                      <p className="mt-2 text-sm text-foreground/80">{u.bio}</p>
                    ) : null}
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        className="rounded-full"
                        onClick={() =>
                          void createDm({
                            otherUserId: u.id,
                            viewerId,
                          })
                            .then((r) => router.push(`/chat/${String(r.conversationId)}`))
                            .catch((e: unknown) =>
                              toast.error("Unable to start chat", {
                                description: e instanceof Error ? e.message : "Try again.",
                              })
                            )
                        }
                      >
                        <MessageSquare className="h-4 w-4" />
                        Start chat
                      </Button>
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href="/dashboard">Go to inbox</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DiscoverDemo() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return demoUsers.filter((u) => u.id !== "u5");
    return demoUsers.filter((u) => {
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.bio || "").toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <div className="h-full">
      <div className="border-b border-border bg-card/50 p-4 backdrop-blur">
        <p className="text-sm font-semibold">Discover</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Search people and start a conversation.
        </p>
        <div className="mt-3 relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pl-10"
            placeholder="Search by name, email, bio…"
            aria-label="Search people"
            autoFocus
          />
        </div>
      </div>

      <div className="mx-auto max-w-5xl p-4">
        {results.length === 0 ? (
          <div className="h-[60vh]">
            <EmptyState
              type="no-results"
              title="No users found"
              description="Try a different query."
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((u) => (
              <Card key={u.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={u.avatarUrl} alt={u.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {u.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 rounded-full bg-background p-1">
                      <StatusIndicator status={u.status} size="sm" ping={u.status === "online"} />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{u.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                    {u.bio ? (
                      <p className="mt-2 text-sm text-foreground/80">{u.bio}</p>
                    ) : null}
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        className="rounded-full"
                        onClick={() => toast.success("Conversation created", { description: "Demo action" })}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Start chat
                      </Button>
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href="/dashboard">Go to inbox</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
