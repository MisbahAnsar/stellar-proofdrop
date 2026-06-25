"use client";

import { QueryProvider } from "@/providers/query-provider";
import { WalletProvider } from "@/providers/wallet-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <WalletProvider>{children}</WalletProvider>
    </QueryProvider>
  );
}
