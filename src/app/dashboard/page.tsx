"use client";

import Link from "next/link";

import { WalletStatus } from "@/components/wallet/wallet-controls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";
import { getTaskMetadataList } from "@/services/tasks/metadata-store";
import { formatXlm, stroopsToXlm } from "@/lib/stellar/amount";
import { useMemo } from "react";

export default function DashboardPage() {
  const { isConnected, isReady } = useWallet();

  const tasks = useMemo(() => {
    if (typeof window === "undefined") {
      return [];
    }

    return getTaskMetadataList();
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Wallet status and locally stored tasks from this browser.
        </p>
      </div>

      <Card className="border-border ring-0">
        <CardHeader className="border-border border-b">
          <CardTitle>Wallet</CardTitle>
          <CardDescription>Freighter connection status</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isReady ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <WalletStatus className="items-start!" />
              {!isConnected ? (
                <Button size="sm" render={<Link href="/create" />}>
                  Connect on Create page
                </Button>
              ) : null}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Loading wallet…</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border ring-0">
        <CardHeader className="border-border border-b">
          <CardTitle>Your tasks</CardTitle>
          <CardDescription>
            Off-chain metadata saved after successful on-chain creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {tasks.length === 0 ? (
            <Alert>
              <AlertTitle>No tasks yet</AlertTitle>
              <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>Create your first funded task to see it here.</span>
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href="/create" />}
                >
                  Create Task
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <ul className="divide-border border-border divide-y rounded-lg border">
              {tasks.map((task) => (
                <li key={task.taskId} className="space-y-1 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-foreground font-medium">{task.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {formatXlm(stroopsToXlm(BigInt(task.rewardStroops)))} XLM
                    </p>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {task.description}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Task #{task.taskId}
                    {task.deadline
                      ? ` · Deadline ${new Date(task.deadline).toLocaleString()}`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
