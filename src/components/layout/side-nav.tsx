"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/utils";
import { LayoutGrid, MessageSquare, UserPlus } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Chats", icon: LayoutGrid },
  { href: "/discover", label: "Add friends", icon: UserPlus },
];

export function SideNav() {
  const pathname = usePathname();

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
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

