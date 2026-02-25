import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";

export function ErrorState(props: {
  title: string;
  description: string;
  onRetry?: () => void;
  className?: string;
}) {
  const { title, description, onRetry, className } = props;
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4 rounded-xl"
              onClick={onRetry}
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

