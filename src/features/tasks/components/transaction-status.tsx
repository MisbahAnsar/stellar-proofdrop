import { Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TRANSACTION_MESSAGES } from "@/services/stellar/transaction-types";
import type { TransactionPhase } from "@/services/stellar/transaction-types";
import { cn } from "@/lib/utils";

export type TransactionFlowState =
  | { status: "idle" }
  | { status: "pending"; phase: TransactionPhase }
  | {
      status: "success";
      title: string;
      description: string;
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
        <AlertTitle>{flowState.title}</AlertTitle>
        <AlertDescription>{flowState.description}</AlertDescription>
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
