"use client";

import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";

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
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TransactionStatus } from "@/features/tasks/components/transaction-status";
import type { SubmitProofFlowState } from "@/features/tasks/hooks/use-submit-proof";
import { validateProofFile } from "@/lib/proof/validation";
import { useWallet } from "@/hooks/use-wallet";
import type { TaskMetadata } from "@/types/task";

type SubmitProofFormProps = {
  task: TaskMetadata;
  flowState: SubmitProofFlowState;
  isPending: boolean;
  onSubmit: (file: File) => Promise<void>;
  onResetFlow: () => void;
};

export function SubmitProofForm({
  task,
  flowState,
  isPending,
  onSubmit,
  onResetFlow,
}: SubmitProofFormProps) {
  const { isConnected, connect, isConnecting, address } = useWallet();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isSubmitted = task.status === "proof_submitted";

  function handleFileChange(file: File | null) {
    onResetFlow();
    setSelectedFile(null);
    setValidationError(null);

    if (!file) {
      return;
    }

    const error = validateProofFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    setSelectedFile(file);
  }

  async function handleSubmit() {
    if (!selectedFile) {
      setValidationError("Select a proof file to upload.");
      return;
    }

    await onSubmit(selectedFile);
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  if (isSubmitted) {
    return (
      <Alert>
        <AlertTitle>Proof already submitted</AlertTitle>
        <AlertDescription>
          This task already has an on-chain proof hash. Creators can verify it
          below.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-border ring-0">
      <CardHeader className="border-border border-b">
        <CardTitle>Submit proof</CardTitle>
        <CardDescription>
          Upload proof off-chain. Only the SHA-256 hash is stored on Soroban.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {!isConnected ? (
          <Alert>
            <AlertTitle>Wallet required</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>Connect Freighter to submit proof for this task.</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isConnecting}
                onClick={() => void connect()}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Connecting
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {flowState.status === "hashing" ? (
          <Alert>
            <Loader2 className="size-4 animate-spin" />
            <AlertTitle>Hashing proof</AlertTitle>
            <AlertDescription>Generating SHA-256 hash…</AlertDescription>
          </Alert>
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
                        title: "Proof submitted successfully",
                        description: `Hash ${flowState.proofHash.slice(0, 12)}… confirmed in ${flowState.transactionHash}`,
                      }
                    : { status: "error", message: flowState.message }
              }
            />
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="proof-file">Proof file</Label>
          <Input
            id="proof-file"
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf,text/plain"
            disabled={isPending || !isConnected}
            aria-invalid={Boolean(validationError)}
            aria-describedby={
              validationError ? "proof-file-error" : "proof-file-hint"
            }
            onChange={(event) =>
              handleFileChange(event.target.files?.[0] ?? null)
            }
          />
          <p id="proof-file-hint" className="text-muted-foreground text-xs">
            JPEG, PNG, WebP, PDF, or plain text up to 5 MB.
          </p>
          {selectedFile ? (
            <p className="text-foreground text-xs">
              Selected: {selectedFile.name} (
              {(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          ) : null}
          <FieldError id="proof-file-error" message={validationError ?? undefined} />
        </div>
      </CardContent>

      <CardFooter className="border-border border-t">
        <Button
          type="button"
          disabled={
            !isConnected ||
            !address ||
            !selectedFile ||
            isPending ||
            Boolean(validationError)
          }
          onClick={() => void handleSubmit()}
        >
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit Proof"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
