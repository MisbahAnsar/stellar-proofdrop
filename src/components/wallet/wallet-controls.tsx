"use client";

import { Loader2 } from "lucide-react";

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
    isConnected,
    isConnecting,
    isReady,
    isFreighterInstalled,
    connect,
    disconnect,
  } = useWallet();

  if (!isReady) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        <span>Loading</span>
      </Button>
    );
  }

  if (isConnected) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <WalletStatus className="hidden items-end sm:flex" />
        <Button variant="outline" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      disabled={isConnecting}
      onClick={() => void connect()}
    >
      {isConnecting ? (
        <>
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          Connecting
        </>
      ) : isFreighterInstalled ? (
        "Connect Wallet"
      ) : (
        "Install Freighter"
      )}
    </Button>
  );
}
