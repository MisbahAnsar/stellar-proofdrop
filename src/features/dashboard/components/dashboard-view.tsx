"use client";

import { Loader2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatsGridSkeleton } from "@/components/skeletons/stats-grid-skeleton";
import { WalletStatus } from "@/components/wallet/wallet-controls";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/feedback/loading-region";
import { DashboardSection } from "@/features/dashboard/components/dashboard-section";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { useDashboardTasks } from "@/features/dashboard/hooks/use-dashboard-tasks";
import { useRecentActivity } from "@/features/dashboard/hooks/use-recent-activity";
import { useWallet } from "@/hooks/use-wallet";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border rounded-lg border px-4 py-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-foreground text-2xl font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}

export function DashboardView() {
  const { isConnected, isReady, isConnecting, connect } = useWallet();
  const {
    myTasks,
    openTasks,
    completedTasks,
    pendingReviews,
    counts,
    isLoading,
  } = useDashboardTasks();
  const { data: activity = [], isLoading: isActivityLoading } =
    useRecentActivity();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Tasks and activity update automatically via event subscriptions."
      />

      <Card className="border-border ring-0">
        <CardHeader className="border-border border-b py-4">
          <CardTitle className="text-base">Wallet</CardTitle>
          <CardDescription>Freighter connection</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {!isReady ? (
            <LoadingRegion label="Loading wallet">
              <div className="flex items-center gap-3" aria-hidden="true">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-28" />
              </div>
            </LoadingRegion>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <WalletStatus className="items-start!" />
              {!isConnected ? (
                <Button
                  size="sm"
                  disabled={isConnecting}
                  onClick={() => void connect()}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Connecting
                    </>
                  ) : (
                    "Connect wallet"
                  )}
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <StatsGridSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="My tasks" value={counts.myTasks} />
          <StatCard label="Open" value={counts.openTasks} />
          <StatCard label="Completed" value={counts.completedTasks} />
          <StatCard label="Pending review" value={counts.pendingReviews} />
        </div>
      )}

      <RecentActivity entries={activity} isLoading={isActivityLoading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardSection
          title="My tasks"
          description="Tasks you created"
          tasks={myTasks}
          isLoading={isLoading}
          emptyTitle="No tasks created"
          emptyDescription="Fund a task to see it here."
          actionHref="/create"
          actionLabel="Create task"
        />
        <DashboardSection
          title="Open tasks"
          description="Available for proof submission"
          tasks={openTasks}
          isLoading={isLoading}
          emptyTitle="No open tasks"
          emptyDescription="Open tasks appear here when funded."
        />
        <DashboardSection
          title="Pending reviews"
          description="Submissions awaiting your decision"
          tasks={pendingReviews}
          isLoading={isLoading}
          emptyTitle="No pending reviews"
          emptyDescription={
            isConnected
              ? "Proof submissions you need to review appear here."
              : "Connect your wallet to see pending reviews."
          }
        />
        <DashboardSection
          title="Completed tasks"
          description="Approved and paid out"
          tasks={completedTasks}
          isLoading={isLoading}
          emptyTitle="No completed tasks"
          emptyDescription="Approved tasks appear here after review."
        />
      </div>
    </div>
  );
}
