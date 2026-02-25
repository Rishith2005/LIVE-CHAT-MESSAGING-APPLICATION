import { cn } from "@/components/ui/utils";

export function Card(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props;
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground shadow-[var(--shadow-card)]",
        className
      )}
      {...rest}
    />
  );
}

