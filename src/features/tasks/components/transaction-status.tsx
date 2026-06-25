import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

import { TransactionExplorerLink } from "@/components/stellar/transaction-explorer-link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TRANSACTION_MESSAGES } from "@/services/stellar/transaction-types";
import type { TransactionPhase } from "@/services/stellar/transaction-types";
import { cn } from "@/lib/utils";

export type TransactionFlowState =
  | { status: "idle" }
  | { status: "pending"; phase: TransactionPhase }
  | {
      status: "success";
      title: string;
      description?: string;
      transactionHash?: string;
      taskId?: string;
    }
  | { status: "error"; message: string };

type TransactionStatusProps = {
  flowState: TransactionFlowState;
  className?: string;
};

export function TransactionStatus({
  flowState,
  className,
}: TransactionStatusProps) {
  if (flowState.status === "idle") {
    return null;
  }

  if (flowState.status === "pending") {
    return (
      <Alert
        variant="pending"
        className={cn(className)}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-4 animate-spin" />
        <AlertTitle>Transaction pending</AlertTitle>
        <AlertDescription>
          {TRANSACTION_MESSAGES[flowState.phase]}
        </AlertDescription>
      </Alert>
    );
  }

  if (flowState.status === "success") {
    return (
      <Alert variant="success" className={cn(className)}>
        <CheckCircle2 className="size-4" />
        <AlertTitle>{flowState.title}</AlertTitle>
        <AlertDescription className="space-y-3">
          {flowState.description ? <p>{flowState.description}</p> : null}
          {flowState.transactionHash ? (
            <TransactionExplorerLink
              transactionHash={flowState.transactionHash}
            />
          ) : null}
          {flowState.taskId ? (
            <div>
              <Button
                size="sm"
                variant="outline"
                className="bg-background/80"
                render={<Link href={`/tasks/${flowState.taskId}`} />}
              >
                Open task #{flowState.taskId}
              </Button>
            </div>
          ) : null}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className={className}>
      <XCircle className="size-4" />
      <AlertTitle>Transaction failed</AlertTitle>
      <AlertDescription>{flowState.message}</AlertDescription>
    </Alert>
  );
}
