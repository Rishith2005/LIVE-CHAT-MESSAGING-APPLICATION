import { Skeleton } from "@/components/ui/skeleton";

export function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={i % 2 === 0 ? "flex justify-start" : "flex justify-end"}>
          <div className="w-[70%] space-y-2">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

