"use client";

import { Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionStatus } from "@/features/tasks/components/transaction-status";
import type { ReviewFlowState } from "@/features/tasks/hooks/use-review-task";
import { formatXlm, stroopsToXlm } from "@/lib/stellar/amount";
import type { TaskMetadata } from "@/types/task";

type CreatorReviewFormProps = {
  task: TaskMetadata;
  flowState: ReviewFlowState;
  isPending: boolean;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  onResetFlow: () => void;
};

export function CreatorReviewForm({
  task,
  flowState,
  isPending,
  onApprove,
  onReject,
  onResetFlow,
}: CreatorReviewFormProps) {
  if (task.status === "approved") {
    return (
      <Alert>
        <AlertTitle>Task approved</AlertTitle>
        <AlertDescription>
          Payment was released to the worker. This task is complete.
        </AlertDescription>
      </Alert>
    );
  }

  if (task.status !== "proof_submitted") {
    return null;
  }

  const pendingAction =
    flowState.status === "pending" ? flowState.action : null;

  return (
    <Card className="border-border ring-0">
      <CardHeader className="border-border border-b">
        <CardTitle>Review submission</CardTitle>
        <CardDescription>
          Approve to release{" "}
          {formatXlm(stroopsToXlm(BigInt(task.rewardStroops)))} XLM to the
          worker, or reject to reopen the task for a new proof.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {task.proofSubmittedBy ? (
          <p className="text-muted-foreground text-sm">
            Submitted by{" "}
            <span className="font-mono text-xs">{task.proofSubmittedBy}</span>
            {task.proofSubmittedAt
              ? ` · ${new Date(task.proofSubmittedAt).toLocaleString()}`
              : ""}
          </p>
        ) : null}

        {flowState.status === "pending" ||
        flowState.status === "success" ||
        flowState.status === "error" ? (
          <TransactionStatus
            flowState={
              flowState.status === "pending"
                ? { status: "pending", phase: flowState.phase }
                : flowState.status === "success"
                  ? {
                      status: "success",
                      title:
                        flowState.action === "approve"
                          ? "Task approved"
                          : "Proof rejected",
                      description:
                        flowState.action === "approve"
                          ? `Payment released. Transaction ${flowState.transactionHash} confirmed.`
                          : `Task reopened for resubmission. Transaction ${flowState.transactionHash} confirmed.`,
                    }
                  : { status: "error", message: flowState.message }
            }
          />
        ) : null}
      </CardContent>

      <CardFooter className="border-border flex flex-wrap gap-2 border-t">
        <Button
          type="button"
          disabled={isPending}
          onClick={() => {
            onResetFlow();
            void onApprove();
          }}
        >
          {pendingAction === "approve" ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Approving…
            </>
          ) : (
            "Approve"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => {
            onResetFlow();
            void onReject();
          }}
        >
          {pendingAction === "reject" ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Rejecting…
            </>
          ) : (
            "Reject"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
