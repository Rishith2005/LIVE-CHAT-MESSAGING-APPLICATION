import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { Inbox, MessageSquare, Search, Users } from "lucide-react";

type EmptyType = "no-conversations" | "no-messages" | "no-results" | "inbox-zero";

const iconMap: Record<EmptyType, typeof Inbox> = {
  "no-conversations": Users,
  "no-messages": MessageSquare,
  "no-results": Search,
  "inbox-zero": Inbox,
};

export function EmptyState(props: {
  type: EmptyType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  badge?: string;
  className?: string;
}) {
  const { type, title, description, actionLabel, onAction, badge, className } =
    props;
  const Icon = iconMap[type];

  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      {badge ? (
        <Badge variant="secondary" className="mb-3">
          {badge}
        </Badge>
      ) : null}
      <div className="mb-4 rounded-full bg-muted/50 p-6">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6 rounded-full" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

