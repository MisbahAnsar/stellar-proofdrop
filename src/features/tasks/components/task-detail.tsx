"use client";

import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProofPreview } from "@/features/tasks/components/proof-preview";
import { ProofVerificationCard } from "@/features/tasks/components/proof-verification";
import { SubmitProofForm } from "@/features/tasks/components/submit-proof-form";
import { useProof, useTask } from "@/features/tasks/hooks/use-task";
import { useSubmitProof } from "@/features/tasks/hooks/use-submit-proof";
import { formatXlm, stroopsToXlm } from "@/lib/stellar/amount";
import { useWallet } from "@/hooks/use-wallet";

type TaskDetailProps = {
  taskId: string;
};

export function TaskDetail({ taskId }: TaskDetailProps) {
  const { address } = useWallet();
  const { data: task, isLoading } = useTask(taskId);
  const { data: proof } = useProof(taskId);
  const { mutateAsync, isPending, flowState, resetFlow } = useSubmitProof();

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading task…</p>;
  }

  if (!task) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Task not found</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>This task is not available in local storage.</span>
          <Button size="sm" variant="outline" render={<Link href="/" />}>
            Back to tasks
          </Button>
        </AlertDescription>
      </Alert>
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
      <Card className="border-border ring-0">
        <CardHeader className="border-border border-b">
          <CardTitle>{task.title}</CardTitle>
          <CardDescription>Task #{task.taskId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          <p className="text-muted-foreground text-sm">{task.description}</p>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Reward:</span>{" "}
              {formatXlm(stroopsToXlm(BigInt(task.rewardStroops)))} XLM
            </p>
            <p>
              <span className="text-muted-foreground">Status:</span>{" "}
              {task.status ?? "open"}
            </p>
            {task.deadline ? (
              <p>
                <span className="text-muted-foreground">Deadline:</span>{" "}
                {new Date(task.deadline).toLocaleString()}
              </p>
            ) : null}
            {task.proofHash ? (
              <p className="font-mono text-xs break-all sm:col-span-2">
                On-chain hash: {task.proofHash}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {!isCreator ? (
        <SubmitProofForm
          task={task}
          flowState={flowState}
          isPending={isPending}
          onResetFlow={resetFlow}
          onSubmit={async (file) => {
            if (!address) {
              return;
            }

            await mutateAsync({ taskId, file, worker: address });
          }}
        />
      ) : (
        <Alert>
          <AlertTitle>Creator view</AlertTitle>
          <AlertDescription>
            You created this task. Review the submitted proof and verify the
            on-chain hash below.
          </AlertDescription>
        </Alert>
      )}

      {proof ? (
        <Card className="border-border ring-0">
          <CardHeader className="border-border border-b">
            <CardTitle>Proof preview</CardTitle>
            <CardDescription>
              {proof.fileName} · stored locally for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <ProofPreview proof={proof} />
            <p className="font-mono text-xs break-all">SHA-256: {proof.sha256}</p>
            {verification ? (
              <ProofVerificationCard verification={verification} />
            ) : null}
          </CardContent>
        </Card>
      ) : task.proofHash ? (
        <Alert>
          <AlertTitle>Proof hash on-chain</AlertTitle>
          <AlertDescription className="font-mono text-xs break-all">
            {task.proofHash}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
