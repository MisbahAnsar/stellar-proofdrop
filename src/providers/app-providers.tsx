"use client";

import { TaskEventSync } from "@/providers/task-event-sync";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";
import { WalletProvider } from "@/providers/wallet-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <WalletProvider>
        <TaskEventSync />
        {children}
        <Toaster theme="light" position="bottom-right" richColors />
      </WalletProvider>
    </QueryProvider>
  );
}
