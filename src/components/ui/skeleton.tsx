import { cn } from "@/components/ui/utils";

export function Skeleton(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props;
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-xl bg-muted/60", className)}
      {...rest}
    />
  );
}

