import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/feedback/loading-region";

type CardListSkeletonProps = {
  rows?: number;
  label?: string;
};

export function CardListSkeleton({
  rows = 3,
  label = "Loading list",
}: CardListSkeletonProps) {
  return (
    <LoadingRegion label={label}>
      <ul className="divide-border divide-y" aria-hidden="true">
        {Array.from({ length: rows }).map((_, index) => (
          <li key={index} className="space-y-2 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-4 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-3 w-full max-w-md" />
            <Skeleton className="h-3 w-32" />
          </li>
        ))}
      </ul>
    </LoadingRegion>
  );
}
