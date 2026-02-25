"use client";

import { useRouter } from "next/navigation";
import { isClerkConfigured } from "@/lib/env";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { demoCurrentUser } from "@/lib/mock";
import { toast } from "sonner";
import { useClerk, useUser } from "@clerk/nextjs";

export default function ProfilePage() {
  if (isClerkConfigured()) return <ProfileClerk />;
  return <ProfileDemo />;
}

function ProfileDemo() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Demo mode</p>

      <Card className="mt-6 border-border bg-card/60 p-6 backdrop-blur">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={demoCurrentUser.avatarUrl} alt={demoCurrentUser.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {demoCurrentUser.name
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-base font-medium">{demoCurrentUser.name}</p>
            <p className="truncate text-sm text-muted-foreground">{demoCurrentUser.email}</p>
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="button"
            className="rounded-xl"
            variant="outline"
            onClick={() => toast.message("Signed out", { description: "Demo action" })}
          >
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ProfileClerk() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  const name =
    user?.fullName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "User";

  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Account details</p>

      <Card className="mt-6 border-border bg-card/60 p-6 backdrop-blur">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user?.imageUrl} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {name
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-base font-medium">{name}</p>
            {email ? (
              <p className="truncate text-sm text-muted-foreground">{email}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="button"
            className="rounded-xl"
            variant="outline"
            onClick={async () => {
              await signOut();
              router.push("/sign-in");
            }}
          >
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}

