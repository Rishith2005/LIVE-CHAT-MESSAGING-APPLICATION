import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/ui/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "bg-transparent text-foreground",
        success: "border-transparent bg-[--color-success] text-[--color-success-foreground]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge(
  props: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>
) {
  const { className, variant, ...rest } = props;
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...rest}
    />
  );
}

