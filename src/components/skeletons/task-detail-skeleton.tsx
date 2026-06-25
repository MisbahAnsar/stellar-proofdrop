import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/feedback/loading-region";

export function TaskDetailSkeleton() {
  return (
    <LoadingRegion label="Loading task" className="space-y-6">
      <div className="border-border space-y-4 rounded-xl border p-6" aria-hidden="true">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="border-border space-y-4 rounded-xl border p-6">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-10 w-full max-w-xs" />
      </div>
    </LoadingRegion>
  );
}
