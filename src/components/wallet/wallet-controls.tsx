"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { truncateAddress } from "@/lib/stellar/format";
import { cn } from "@/lib/utils";

type WalletStatusProps = {
  className?: string;
};

export function WalletStatus({ className }: WalletStatusProps) {
  const { address, isConnected, isReady, networkLabel } = useWallet();

  if (!isReady) {
    return (
      <span className={cn("text-muted-foreground text-xs", className)}>
        Checking wallet…
      </span>
    );
  }

  if (!isConnected || !address) {
    return (
      <span className={cn("text-muted-foreground text-xs", className)}>
        Not connected · {networkLabel}
      </span>
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-col items-end gap-0.5", className)}>
      <span className="text-foreground max-w-[10rem] truncate font-mono text-xs sm:max-w-none">
        {truncateAddress(address, 6)}
      </span>
      <span className="text-muted-foreground text-xs">{networkLabel}</span>
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
        <Loader2 className="size-3.5 animate-spin" />
        Loading
      </Button>
    );
  }

  if (isConnected) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <WalletStatus className="hidden sm:flex" />
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
          <Loader2 className="size-3.5 animate-spin" />
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
