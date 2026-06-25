import { getStellarNetwork } from "@/config/stellar";

const EXPLORER_BASE = {
  testnet: "https://stellar.expert/explorer/testnet",
  mainnet: "https://stellar.expert/explorer/public",
} as const;

export function getStellarExpertTxUrl(transactionHash: string): string {
  const network = getStellarNetwork();
  return `${EXPLORER_BASE[network]}/tx/${transactionHash}`;
}

export function getStellarExpertContractUrl(contractId: string): string {
  const network = getStellarNetwork();
  return `${EXPLORER_BASE[network]}/contract/${contractId}`;
}

export function shortenHash(hash: string, head = 8, tail = 8): string {
  if (hash.length <= head + tail + 1) {
    return hash;
  }

  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}
