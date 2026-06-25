import { CardListSkeleton } from "@/components/skeletons/card-list-skeleton";

export function ActivityListSkeleton() {
  return <CardListSkeleton rows={4} label="Loading activity" />;
}
