"use client";

import Link from "next/link";

import { TaskDetailSkeleton } from "@/components/skeletons/task-detail-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { CreatorReviewForm } from "@/features/tasks/components/creator-review-form";
import { ProofPreview } from "@/features/tasks/components/proof-preview";
import { ProofVerificationCard } from "@/features/tasks/components/proof-verification";
import { SubmitProofForm } from "@/features/tasks/components/submit-proof-form";
import { useProof, useTask } from "@/features/tasks/hooks/use-task";
import { useReviewTask } from "@/features/tasks/hooks/use-review-task";
import { useSubmitProof } from "@/features/tasks/hooks/use-submit-proof";
import { TransactionExplorerLink } from "@/components/stellar/transaction-explorer-link";
import { TaskStatusBadge } from "@/components/ui/task-status-badge";
import { formatXlm, stroopsToXlm } from "@/lib/stellar/amount";
import { useWallet } from "@/hooks/use-wallet";

type TaskDetailProps = {
  taskId: string;
};

export function TaskDetail({ taskId }: TaskDetailProps) {
  const { address } = useWallet();
  const { data: task, isLoading } = useTask(taskId);
  const { data: proof } = useProof(taskId);
  const {
    mutateAsync: submitProof,
    isPending: isSubmitPending,
    flowState: submitFlowState,
    resetFlow: resetSubmitFlow,
  } = useSubmitProof();
  const {
    approve,
    reject,
    isPending: isReviewPending,
    flowState: reviewFlowState,
    resetFlow: resetReviewFlow,
  } = useReviewTask();

  if (isLoading) {
    return <TaskDetailSkeleton />;
  }

  if (!task) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Task not found"
          description="This task is not available in local storage."
        />
        <EmptyState
          title="Task unavailable"
          description="It may not exist yet or was created in another browser."
          action={
            <Button size="sm" variant="outline" render={<Link href="/" />}>
              Back to tasks
            </Button>
          }
          className="max-w-lg"
        />
      </div>
    );
  }

  const isCreator = address === task.creator;
  const verification =
    proof && task.proofHash
      ? {
          storedHash: proof.sha256,
          onChainHash: task.proofHash,
          matches: proof.sha256 === task.proofHash,
        }
      : null;

  return (
    <div className="space-y-6">
      <PageHeader title={task.title} description={`Task #${task.taskId}`} />

      <Card className="surface-card">
        <CardHeader className="border-border border-b">
          <CardTitle className="text-base">Details</CardTitle>
          <CardDescription>
            <TaskStatusBadge status={task.status} />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {task.description}
          </p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="bg-muted/40 rounded-lg border p-3">
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Reward
              </dt>
              <dd className="text-primary mt-1 text-lg font-semibold">
                {formatXlm(stroopsToXlm(BigInt(task.rewardStroops)))} XLM
              </dd>
            </div>
            {task.deadline ? (
              <div className="bg-muted/40 rounded-lg border p-3">
                <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Deadline
                </dt>
                <dd className="mt-1 font-medium">
                  {new Date(task.deadline).toLocaleString()}
                </dd>
              </div>
            ) : null}
            {task.transactionHash ? (
              <div className="bg-muted/40 rounded-lg border p-3 sm:col-span-2">
                <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Creation transaction
                </dt>
                <dd className="mt-2">
                  <TransactionExplorerLink
                    transactionHash={task.transactionHash}
                    label="Create task on Stellar Expert"
                  />
                </dd>
              </div>
            ) : null}
            {task.proofTransactionHash ? (
              <div className="bg-muted/40 rounded-lg border p-3 sm:col-span-2">
                <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Proof submission transaction
                </dt>
                <dd className="mt-2">
                  <TransactionExplorerLink
                    transactionHash={task.proofTransactionHash}
                    label="Submit proof on Stellar Expert"
                  />
                </dd>
              </div>
            ) : null}
            {task.reviewTransactionHash ? (
              <div className="bg-muted/40 rounded-lg border p-3 sm:col-span-2">
                <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Review transaction
                </dt>
                <dd className="mt-2">
                  <TransactionExplorerLink
                    transactionHash={task.reviewTransactionHash}
                    label="Review on Stellar Expert"
                  />
                </dd>
              </div>
            ) : null}
            {task.proofHash ? (
              <div className="bg-muted/40 rounded-lg border p-3 sm:col-span-2">
                <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  On-chain hash
                </dt>
                <dd className="mt-1 font-mono text-xs break-all">
                  {task.proofHash}
                </dd>
              </div>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      {isCreator ? (
        <CreatorReviewForm
          task={task}
          flowState={reviewFlowState}
          isPending={isReviewPending}
          onResetFlow={resetReviewFlow}
          onApprove={async () => {
            if (!address) {
              return;
            }
            await approve.mutateAsync({ taskId, creator: address });
          }}
          onReject={async () => {
            if (!address) {
              return;
            }
            await reject.mutateAsync({ taskId, creator: address });
          }}
        />
      ) : (
        <SubmitProofForm
          task={task}
          flowState={submitFlowState}
          isPending={isSubmitPending}
          onResetFlow={resetSubmitFlow}
          onSubmit={async (file) => {
            if (!address) {
              return;
            }
            await submitProof({ taskId, file, worker: address });
          }}
        />
      )}

      {proof ? (
        <Card className="surface-card">
          <CardHeader className="border-border border-b">
            <CardTitle className="text-base">Proof preview</CardTitle>
            <CardDescription>
              {proof.fileName} · stored locally for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <ProofPreview proof={proof} />
            <p className="font-mono text-xs break-all">
              SHA-256: {proof.sha256}
            </p>
            {verification ? (
              <ProofVerificationCard verification={verification} />
            ) : null}
          </CardContent>
        </Card>
      ) : task.proofHash ? (
        <EmptyState
          title="Proof hash on-chain"
          description={task.proofHash}
          className="font-mono text-xs break-all"
        />
      ) : null}
    </div>
  );
}
