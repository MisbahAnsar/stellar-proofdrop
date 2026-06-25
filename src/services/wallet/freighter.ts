import { getAddress, isConnected, requestAccess } from "@stellar/freighter-api";

import { WalletError } from "@/lib/stellar/errors";

export async function checkFreighterInstalled(): Promise<boolean> {
  const result = await isConnected();
  if (result.error) {
    throw new WalletError(result.error.message, "UNKNOWN");
  }

  return result.isConnected;
}

export async function connectFreighter(): Promise<string> {
  const installed = await checkFreighterInstalled();
  if (!installed) {
    throw new WalletError(
      "Freighter wallet is not installed. Install the browser extension to continue.",
      "NOT_INSTALLED",
    );
  }

  const access = await requestAccess();
  if (access.error) {
    throw new WalletError(access.error.message, "ACCESS_DENIED");
  }

  return access.address;
}

export async function getFreighterAddress(): Promise<string | null> {
  const installed = await checkFreighterInstalled();
  if (!installed) {
    return null;
  }

  const result = await getAddress();
  if (result.error) {
    return null;
  }

  return result.address;
}
