"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/utils";
import { LayoutGrid, MessageSquare, UserPlus } from "lucide-react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { isClerkConfigured, isConvexConfigured } from "@/lib/env";
import { demoCurrentUser } from "@/lib/mock";

const items = [
  { href: "/dashboard", label: "Chats", icon: LayoutGrid },
  { href: "/discover", label: "Add friends", icon: UserPlus },
];

export function SideNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useConvexAuth();

  const viewerId = isClerkConfigured() ? undefined : demoCurrentUser.id;
  const conversations = useQuery(
    api.conversations.listForViewer,
    isConvexConfigured() && (!isClerkConfigured() || isAuthenticated) ? { viewerId } : "skip"
  );

  const totalUnread = ((conversations ?? []) as unknown as Array<{ unreadCount?: number }>).reduce(
    (sum, c) => sum + (c.unreadCount ?? 0),
    0
  );

  return (
    <aside className="hidden h-full w-64 shrink-0 border-r border-border bg-[--color-sidebar]/70 backdrop-blur md:flex md:flex-col">
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-4">Nebula Chat</p>
          <p className="text-xs text-muted-foreground">UI scaffold</p>
        </div>
      </div>
      <nav className="px-2">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-[--color-sidebar-accent] text-[--color-sidebar-accent-foreground]"
                  : "text-muted-foreground hover:bg-[--color-sidebar-accent]/60 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate">{it.label}</span>
              {it.href === "/dashboard" && totalUnread > 0 ? (
                <Badge className="min-w-5 justify-center rounded-full px-1.5">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
