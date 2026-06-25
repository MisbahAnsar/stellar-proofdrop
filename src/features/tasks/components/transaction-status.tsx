import { Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { CreateTaskFlowState } from "@/features/tasks/hooks/use-create-task";
import { TRANSACTION_MESSAGES } from "@/services/stellar/transaction-types";
import { cn } from "@/lib/utils";

type TransactionStatusProps = {
  flowState: CreateTaskFlowState;
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
      <Alert className={cn("border-border", className)}>
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
      <Alert className={cn("border-border", className)}>
        <AlertTitle>Task created successfully</AlertTitle>
        <AlertDescription>
          Task #{flowState.taskId} is live on-chain. Transaction{" "}
          <span className="font-mono">{flowState.transactionHash}</span>{" "}
          confirmed.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertTitle>Transaction failed</AlertTitle>
      <AlertDescription>{flowState.message}</AlertDescription>
    </Alert>
  );
}
