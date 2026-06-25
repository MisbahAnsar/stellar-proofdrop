"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getNetworkConfig } from "@/config/stellar";
import { getErrorMessage, WalletError } from "@/lib/stellar/errors";
import {
  checkFreighterInstalled,
  connectFreighter,
  getFreighterAddress,
} from "@/services/wallet/freighter";

type WalletContextValue = {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isReady: boolean;
  isFreighterInstalled: boolean;
  networkLabel: string;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

type WalletProviderProps = {
  children: React.ReactNode;
};

export function WalletProvider({ children }: WalletProviderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const networkLabel = getNetworkConfig().label;

  useEffect(() => {
    let cancelled = false;

    async function hydrateWallet() {
      try {
        const installed = await checkFreighterInstalled();
        if (cancelled) {
          return;
        }

        setIsFreighterInstalled(installed);

        if (!installed) {
          return;
        }

        const existingAddress = await getFreighterAddress();
        if (!cancelled && existingAddress) {
          setAddress(existingAddress);
        }
      } catch (hydrateError) {
        if (!cancelled) {
          setError(getErrorMessage(hydrateError));
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    void hydrateWallet();

    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const connectedAddress = await connectFreighter();
      setAddress(connectedAddress);
      setIsFreighterInstalled(true);
    } catch (connectError) {
      setAddress(null);

      if (connectError instanceof WalletError) {
        setError(connectError.message);
        setIsFreighterInstalled(
          connectError.code !== "NOT_INSTALLED" && isFreighterInstalled,
        );
      } else {
        setError(getErrorMessage(connectError));
      }
    } finally {
      setIsConnecting(false);
    }
  }, [isFreighterInstalled]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      isConnected: Boolean(address),
      isConnecting,
      isReady,
      isFreighterInstalled,
      networkLabel,
      error,
      connect,
      disconnect,
      clearError,
    }),
    [
      address,
      isConnecting,
      isReady,
      isFreighterInstalled,
      networkLabel,
      error,
      connect,
      disconnect,
      clearError,
    ],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }

  return context;
}
