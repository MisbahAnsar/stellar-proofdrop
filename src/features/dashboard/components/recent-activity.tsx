import Link from "next/link";

import { ActivityListSkeleton } from "@/components/skeletons/activity-list-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ActivityEntry } from "@/types/activity";

function formatActivityTime(timestamp: string) {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function activityLabel(type: ActivityEntry["type"]) {
  switch (type) {
    case "task_created":
      return "Created";
    case "proof_submitted":
      return "Proof";
    case "task_approved":
      return "Approved";
    case "task_rejected":
      return "Rejected";
    default:
      return "Event";
  }
}

type RecentActivityProps = {
  entries: ActivityEntry[];
  isLoading?: boolean;
};

export function RecentActivity({
  entries,
  isLoading = false,
}: RecentActivityProps) {
  return (
    <Card className="border-border ring-0">
      <CardHeader className="border-border border-b py-4">
        <CardTitle className="text-base">Recent activity</CardTitle>
        <CardDescription>
          Live feed from task and on-chain events
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <ActivityListSkeleton />
        ) : entries.length === 0 ? (
          <EmptyState
            className="mt-4"
            title="No activity yet"
            description="Create a task or submit proof to see updates here automatically."
          />
        ) : (
          <ul className="divide-border divide-y" aria-label="Recent activity">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground rounded border border-border px-2 py-0.5 text-xs">
                      {activityLabel(entry.type)}
                    </span>
                    <Link
                      href={`/tasks/${entry.taskId}`}
                      className="text-foreground rounded-sm text-sm hover:underline focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {entry.message}
                    </Link>
                  </div>
                  {entry.transactionHash ? (
                    <p className="text-muted-foreground font-mono text-xs break-all">
                      {entry.transactionHash.slice(0, 12)}…
                    </p>
                  ) : null}
                </div>
                <time
                  dateTime={entry.timestamp}
                  className="text-muted-foreground shrink-0 text-xs"
                >
                  {formatActivityTime(entry.timestamp)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
