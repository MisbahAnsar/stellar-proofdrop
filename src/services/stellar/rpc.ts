import { rpc } from "@stellar/stellar-sdk";

import { getNetworkConfig } from "@/config/stellar";

let server: rpc.Server | null = null;

export function getRpcServer(): rpc.Server {
  if (!server) {
    const { rpcUrl } = getNetworkConfig();
    server = new rpc.Server(rpcUrl);
  }

  return server;
}
