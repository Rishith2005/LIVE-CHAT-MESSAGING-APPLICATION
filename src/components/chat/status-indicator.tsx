import { cn } from "@/components/ui/utils";
import type { UserStatus } from "@/lib/mock";

export function StatusIndicator(props: {
  status: UserStatus;
  size?: "sm" | "md";
  ping?: boolean;
}) {
  const { status, size = "md", ping } = props;
  const sizes = { sm: "h-2 w-2", md: "h-2.5 w-2.5" };
  const colors: Record<UserStatus, string> = {
    online: "bg-[--success]",
    away: "bg-yellow-500",
    offline: "bg-[--muted-foreground]",
  };
  return (
    <span className="relative inline-flex">
      <span className={cn("rounded-full", sizes[size], colors[status])} />
      {ping && status === "online" ? (
        <span className={cn("absolute inset-0 rounded-full animate-ping opacity-50", colors[status])} />
      ) : null}
    </span>
  );
}
