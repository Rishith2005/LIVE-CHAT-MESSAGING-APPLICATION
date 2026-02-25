"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { demoCurrentUser } from "@/lib/mock";
import { Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { isClerkConfigured } from "@/lib/env";
import { useClerk, useUser } from "@clerk/nextjs";

export function TopNav() {
  if (isClerkConfigured()) return <TopNavClerk />;
  return <TopNavDemo />;
}

function TopNavDemo() {
  return (
    <TopNavBase
      name={demoCurrentUser.name}
      avatarUrl={demoCurrentUser.avatarUrl}
      onSignOut={() => {
        toast.message("Signed out", { description: "Demo action" });
      }}
    />
  );
}

function TopNavClerk() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const name =
    user?.fullName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "User";

  return (
    <TopNavBase
      name={name}
      avatarUrl={user?.imageUrl}
      onSignOut={async () => {
        await signOut();
        router.push("/sign-in");
      }}
    />
  );
}

function TopNavBase({
  name,
  avatarUrl,
  onSignOut,
}: {
  name: string;
  avatarUrl?: string;
  onSignOut: () => void | Promise<void>;
}) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/60 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" className="rounded-full md:hidden">
          <Link href="/dashboard">Back</Link>
        </Button>
        <p className="text-sm font-semibold">Workspace</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="rounded-full px-2" aria-label="Open user menu">
            <Avatar className="h-9 w-9">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {name
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => router.push("/profile")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light" : "Dark"} mode
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => void onSignOut()}
            className="text-destructive"
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

