"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/chat/status-indicator";
import type { User } from "@/lib/mock";

export function ProfileDrawer(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}) {
  const { open, onOpenChange, user } = props;
  if (!user) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-auto right-3 top-3 max-w-sm translate-x-0 translate-y-0 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 rounded-full bg-background p-1">
              <StatusIndicator status={user.status} size="sm" ping />
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        {user.bio ? (
          <p className="mt-4 text-sm text-foreground/80">{user.bio}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">
            {user.status}
          </Badge>
        </div>
        <div className="mt-5 grid gap-2">
          <Button variant="outline" className="justify-start">
            Mute notifications
          </Button>
          <Button
            variant="outline"
            className="justify-start text-destructive hover:text-destructive"
          >
            Block user
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

