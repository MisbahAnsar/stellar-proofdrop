"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTask } from "@/features/tasks/hooks/use-create-task";
import {
  createTaskSchema,
  type CreateTaskFormValues,
} from "@/features/tasks/schemas/create-task";
import { useWallet } from "@/hooks/use-wallet";
import { getProveItContractId } from "@/config/stellar";
import { getErrorMessage } from "@/lib/stellar/errors";

export function CreateTaskForm() {
  const { address, isConnected, isReady, connect, isConnecting } = useWallet();
  const createTask = useCreateTask();
  const [successTaskId, setSuccessTaskId] = useState<string | null>(null);

  const contractConfigured = Boolean(getProveItContractId());

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      reward: "",
      deadline: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!address) {
      return;
    }

    setSuccessTaskId(null);

    try {
      const result = await createTask.mutateAsync({
        ...values,
        creator: address,
      });
      setSuccessTaskId(result.taskId);
      form.reset();
    } catch {
      // Error state is surfaced via createTask.isError
    }
  });

  const submitError =
    createTask.error instanceof Error
      ? createTask.error.message
      : createTask.isError
        ? getErrorMessage(createTask.error)
        : null;

  return (
    <Card className="border-border w-full max-w-2xl ring-0">
      <CardHeader className="border-border border-b">
        <CardTitle>Create Task</CardTitle>
        <CardDescription>
          Lock XLM in the ProveIt contract and publish task details off-chain.
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="space-y-5 pt-6">
          {!contractConfigured ? (
            <Alert variant="destructive">
              <AlertTitle>Contract not configured</AlertTitle>
              <AlertDescription>
                Set <code>NEXT_PUBLIC_PROVEIT_CONTRACT_ID</code> in{" "}
                <code>.env.local</code> before creating tasks on-chain.
              </AlertDescription>
            </Alert>
          ) : null}

          {!isReady ? (
            <Alert>
              <AlertTitle>Loading wallet</AlertTitle>
              <AlertDescription>
                Checking Freighter connection status…
              </AlertDescription>
            </Alert>
          ) : null}

          {isReady && !isConnected ? (
            <Alert>
              <AlertTitle>Wallet required</AlertTitle>
              <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>Connect your Freighter wallet to create a task.</span>
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

          {successTaskId ? (
            <Alert>
              <AlertTitle>Task created</AlertTitle>
              <AlertDescription>
                Task #{successTaskId} was created on-chain. Metadata is stored
                locally until a backend is added.
              </AlertDescription>
            </Alert>
          ) : null}

          {submitError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to create task</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Verify GitHub contribution"
              aria-invalid={Boolean(form.formState.errors.title)}
              disabled={createTask.isPending}
              {...form.register("title")}
            />
            {form.formState.errors.title ? (
              <p className="text-destructive text-xs">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what proof the worker must provide."
              rows={5}
              aria-invalid={Boolean(form.formState.errors.description)}
              disabled={createTask.isPending}
              {...form.register("description")}
            />
            {form.formState.errors.description ? (
              <p className="text-destructive text-xs">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reward">Reward (XLM)</Label>
              <Input
                id="reward"
                type="number"
                min="0.0000001"
                step="0.0000001"
                inputMode="decimal"
                placeholder="10"
                aria-invalid={Boolean(form.formState.errors.reward)}
                disabled={createTask.isPending}
                {...form.register("reward")}
              />
              {form.formState.errors.reward ? (
                <p className="text-destructive text-xs">
                  {form.formState.errors.reward.message}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Funds are locked in the smart contract on submit.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">
                Deadline{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                aria-invalid={Boolean(form.formState.errors.deadline)}
                disabled={createTask.isPending}
                {...form.register("deadline")}
              />
              {form.formState.errors.deadline ? (
                <p className="text-destructive text-xs">
                  {form.formState.errors.deadline.message}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Stored off-chain for now.
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-border flex flex-col gap-3 border-t sm:flex-row sm:justify-between">
          <p className="text-muted-foreground text-xs">
            Proof submission is not available yet.
          </p>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              render={<Link href="/" />}
              disabled={createTask.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !contractConfigured ||
                !isConnected ||
                !address ||
                createTask.isPending
              }
            >
              {createTask.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
