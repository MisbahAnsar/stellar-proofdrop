import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/feedback/loading-region";

type StatsGridSkeletonProps = {
  count?: number;
};

export function StatsGridSkeleton({ count = 4 }: StatsGridSkeletonProps) {
  return (
    <LoadingRegion label="Loading stats">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-hidden="true">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="border-border rounded-lg border px-4 py-3"
          >
            <Skeleton className="mb-2 h-3 w-16" />
            <Skeleton className="h-8 w-10" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}
