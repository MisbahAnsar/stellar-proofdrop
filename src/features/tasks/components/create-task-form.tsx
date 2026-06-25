"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
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
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TaskList } from "@/features/tasks/components/task-list";
import { TransactionStatus } from "@/features/tasks/components/transaction-status";
import { useCreateTask } from "@/features/tasks/hooks/use-create-task";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import {
  createTaskSchema,
  type CreateTaskFormValues,
} from "@/features/tasks/schemas/create-task";
import { useWallet } from "@/hooks/use-wallet";
import { getProveItContractId } from "@/config/stellar";

export function CreateTaskForm() {
  const { address, isConnected, isReady, connect, isConnecting } = useWallet();
  const { data: tasks = [], isLoading: isTasksLoading } = useTasks();
  const { mutateAsync, isPending, flowState, resetFlow } = useCreateTask();

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

    resetFlow();

    try {
      await mutateAsync({
        ...values,
        creator: address,
      });
      form.reset();
    } catch {
      // Errors are handled via flowState and toasts.
    }
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="border-border w-full max-w-2xl ring-0">
        <CardHeader className="border-border border-b">
          <CardTitle className="text-base" role="heading" aria-level={2}>
            Task details
          </CardTitle>
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

            <TransactionStatus
              flowState={
                flowState.status === "success"
                  ? {
                      status: "success",
                      title: "Task created successfully",
                      description: `Task #${flowState.taskId} is live on-chain. Transaction ${flowState.transactionHash} confirmed.`,
                    }
                  : flowState
              }
            />

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Verify GitHub contribution"
                aria-invalid={Boolean(form.formState.errors.title)}
                aria-describedby={
                  form.formState.errors.title ? "title-error" : undefined
                }
                disabled={isPending}
                {...form.register("title")}
              />
              <FieldError
                id="title-error"
                message={form.formState.errors.title?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what proof the worker must provide."
                rows={5}
                aria-invalid={Boolean(form.formState.errors.description)}
                aria-describedby={
                  form.formState.errors.description
                    ? "description-error"
                    : undefined
                }
                disabled={isPending}
                {...form.register("description")}
              />
              <FieldError
                id="description-error"
                message={form.formState.errors.description?.message}
              />
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
                  aria-describedby={
                    form.formState.errors.reward
                      ? "reward-error"
                      : "reward-hint"
                  }
                  disabled={isPending}
                  {...form.register("reward")}
                />
                <FieldError
                  id="reward-error"
                  message={form.formState.errors.reward?.message}
                />
                {!form.formState.errors.reward ? (
                  <p id="reward-hint" className="text-muted-foreground text-xs">
                    Funds are locked in the smart contract on submit.
                  </p>
                ) : null}
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
                  aria-describedby={
                    form.formState.errors.deadline
                      ? "deadline-error"
                      : "deadline-hint"
                  }
                  disabled={isPending}
                  {...form.register("deadline")}
                />
                <FieldError
                  id="deadline-error"
                  message={form.formState.errors.deadline?.message}
                />
                {!form.formState.errors.deadline ? (
                  <p
                    id="deadline-hint"
                    className="text-muted-foreground text-xs"
                  >
                    Stored off-chain for now.
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-border flex flex-col gap-3 border-t sm:flex-row sm:justify-between">
            <p className="text-muted-foreground text-xs">
              Tasks refresh automatically after on-chain confirmation.
            </p>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                render={<Link href="/" />}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !contractConfigured || !isConnected || !address || isPending
                }
              >
                {isPending ? (
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

      <TaskList
        tasks={tasks}
        isLoading={isTasksLoading}
        emptyTitle="No tasks created yet"
        emptyDescription="Your funded tasks will appear here immediately after confirmation."
      />
    </div>
  );
}
