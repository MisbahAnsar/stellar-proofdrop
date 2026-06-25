"use client";

import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatXlm, stroopsToXlm } from "@/lib/stellar/amount";
import type { TaskMetadata } from "@/types/task";

type PendingReviewListProps = {
  tasks: TaskMetadata[];
  creatorAddress?: string;
};

export function PendingReviewList({
  tasks,
  creatorAddress,
}: PendingReviewListProps) {
  const pending = tasks.filter(
    (task) =>
      task.creator === creatorAddress && task.status === "proof_submitted",
  );

  if (!creatorAddress) {
    return (
      <Alert>
        <AlertTitle>Connect wallet</AlertTitle>
        <AlertDescription>
          Connect Freighter to see tasks awaiting your review.
        </AlertDescription>
      </Alert>
    );
  }

  if (pending.length === 0) {
    return (
      <Alert>
        <AlertTitle>No pending submissions</AlertTitle>
        <AlertDescription>
          Tasks with submitted proofs will appear here for your review.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-border ring-0">
      <CardHeader className="border-border border-b">
        <CardTitle>Pending review</CardTitle>
        <CardDescription>
          {pending.length} submission{pending.length === 1 ? "" : "s"} awaiting
          your decision
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-border divide-y">
          {pending.map((task) => (
            <li key={task.taskId} className="space-y-2 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/tasks/${task.taskId}`}
                  className="text-foreground font-medium hover:underline"
                >
                  {task.title}
                </Link>
                <p className="text-muted-foreground text-sm">
                  {formatXlm(stroopsToXlm(BigInt(task.rewardStroops)))} XLM
                </p>
              </div>
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {task.description}
              </p>
              <p className="text-muted-foreground text-xs">
                Task #{task.taskId}
                {task.proofSubmittedBy
                  ? ` · Worker ${task.proofSubmittedBy.slice(0, 8)}…`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
