"use client";

import { Loader2, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/feedback/loading-region";
import { useWallet } from "@/hooks/use-wallet";
import { truncateAddress } from "@/lib/stellar/format";
import { cn } from "@/lib/utils";

type WalletStatusProps = {
  className?: string;
};

export function WalletStatus({ className }: WalletStatusProps) {
  const { address, isConnected, isReady, networkLabel, error } = useWallet();

  if (!isReady) {
    return (
      <LoadingRegion label="Checking wallet">
        <Skeleton className="h-4 w-36" aria-hidden="true" />
      </LoadingRegion>
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      {!isConnected || !address ? (
        <span className="text-muted-foreground text-xs">
          Not connected · {networkLabel}
        </span>
      ) : (
        <>
          <span className="text-foreground max-w-full truncate font-mono text-xs sm:max-w-none">
            {truncateAddress(address, 6)}
          </span>
          <span className="text-muted-foreground text-xs">{networkLabel}</span>
        </>
      )}
      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type WalletButtonProps = {
  className?: string;
};

export function WalletButton({ className }: WalletButtonProps) {
  const {
    address,
    isConnected,
    isConnecting,
    isReady,
    isFreighterInstalled,
    networkLabel,
    connect,
    disconnect,
  } = useWallet();

  if (!isReady) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={cn("rounded-full", className)}
      >
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        <span>Loading</span>
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div
        className={cn(
          "border-border bg-card/90 flex max-w-full items-center gap-2 rounded-full border py-1 pr-1 pl-3 shadow-sm",
          className,
        )}
      >
        <div className="hidden min-w-0 sm:block">
          <p className="text-foreground truncate font-mono text-xs font-medium">
            {truncateAddress(address, 4)}
          </p>
          <p className="text-muted-foreground text-[10px] leading-tight">
            {networkLabel}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 shrink-0 rounded-full px-3 text-xs"
          onClick={disconnect}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      className={cn("rounded-full px-4", className)}
      disabled={isConnecting}
      onClick={() => void connect()}
    >
      {isConnecting ? (
        <>
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          Connecting
        </>
      ) : (
        <>
          <Wallet className="size-3.5" aria-hidden="true" />
          {isFreighterInstalled ? "Connect" : "Install Freighter"}
        </>
      )}
    </Button>
  );
}
