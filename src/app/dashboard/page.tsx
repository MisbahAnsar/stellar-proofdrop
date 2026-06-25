"use client";

import Link from "next/link";

import { WalletStatus } from "@/components/wallet/wallet-controls";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskList } from "@/features/tasks/components/task-list";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { useWallet } from "@/hooks/use-wallet";

export default function DashboardPage() {
  const { isConnected, isReady } = useWallet();
  const { data: tasks = [], isLoading } = useTasks();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Wallet status and your funded tasks. Updates automatically via
          on-chain events.
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

      <TaskList tasks={tasks} isLoading={isLoading} />
    </div>
  );
}
