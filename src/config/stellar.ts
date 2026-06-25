import { Networks } from "@stellar/stellar-sdk";

import { env } from "@/lib/env";

export type StellarNetwork = "testnet" | "mainnet";

type NetworkConfig = {
  networkPassphrase: string;
  rpcUrl: string;
  horizonUrl: string;
  label: string;
};

const networkConfigs: Record<StellarNetwork, NetworkConfig> = {
  testnet: {
    networkPassphrase: Networks.TESTNET,
    rpcUrl: "https://soroban-testnet.stellar.org",
    horizonUrl: "https://horizon-testnet.stellar.org",
    label: "Testnet",
  },
  mainnet: {
    networkPassphrase: Networks.PUBLIC,
    rpcUrl: "https://soroban-mainnet.stellar.org",
    horizonUrl: "https://horizon.stellar.org",
    label: "Mainnet",
  },
};

export function getStellarNetwork(): StellarNetwork {
  return env.NEXT_PUBLIC_STELLAR_NETWORK;
}

export function getNetworkConfig(
  network: StellarNetwork = getStellarNetwork(),
) {
  const config = networkConfigs[network];
  const rpcUrl = env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? config.rpcUrl;

  return {
    ...config,
    rpcUrl,
    network,
  };
}

export function getProofdropContractId(): string | undefined {
  return env.NEXT_PUBLIC_PROOFDROP_CONTRACT_ID;
}
