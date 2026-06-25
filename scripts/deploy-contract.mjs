/**
 * Deploy Proofdrop Soroban contract to Stellar testnet.
 * Usage: bun run scripts/deploy-contract.mjs
 *
 * Optional env:
 *   DEPLOYER_SECRET_KEY — reuse an existing funded testnet account
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  Address,
  Asset,
  BASE_FEE,
  Contract,
  Keypair,
  Networks,
  Operation,
  rpc,
  scValToNative,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

const ROOT = resolve(import.meta.dirname, "..");
const WASM_PATH = resolve(
  ROOT,
  "contracts/target/wasm32v1-none/release/proveit.wasm",
);
const OUTPUT_PATH = resolve(ROOT, "docs/deployment.testnet.json");

const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;
const FRIENDBOT_URL = "https://friendbot.stellar.org";

async function fundAccount(publicKey) {
  const response = await fetch(
    `${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`,
  );

  if (!response.ok) {
    throw new Error(`Friendbot failed: ${await response.text()}`);
  }

  const body = await response.json();
  return body.hash;
}

async function waitForTransaction(server, hash) {
  let attempt = 0;

  while (attempt < 60) {
    const tx = await server.getTransaction(hash);
    if (tx.status !== "NOT_FOUND") {
      if (tx.status !== "SUCCESS") {
        throw new Error(`Transaction ${hash} failed with status ${tx.status}`);
      }
      return tx;
    }

    attempt += 1;
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 1000));
  }

  throw new Error(`Transaction ${hash} timed out`);
}

async function submitOperation(server, keypair, build) {
  const account = await server.getAccount(keypair.publicKey());
  let transaction = build(account);
  transaction = await server.prepareTransaction(transaction);
  transaction.sign(keypair);

  const pending = await server.sendTransaction(transaction);
  if (pending.status !== "PENDING") {
    throw new Error(`Submit failed: ${pending.status}`);
  }

  const confirmed = await waitForTransaction(server, pending.hash);
  return { hash: pending.hash, confirmed };
}

function bytesFromReturnValue(returnValue) {
  const native = scValToNative(returnValue);
  if (native instanceof Uint8Array) {
    return Buffer.from(native);
  }
  if (Buffer.isBuffer(native)) {
    return native;
  }
  throw new Error("Unexpected return value from contract operation");
}

async function main() {
  const wasm = readFileSync(WASM_PATH);
  const server = new rpc.Server(RPC_URL, { allowHttp: true });

  const deployer = process.env.DEPLOYER_SECRET_KEY
    ? Keypair.fromSecret(process.env.DEPLOYER_SECRET_KEY)
    : Keypair.random();

  console.log(`Deployer: ${deployer.publicKey()}`);

  const friendbotHash = await fundAccount(deployer.publicKey());
  console.log(`Funded via friendbot: ${friendbotHash}`);

  const upload = await submitOperation(server, deployer, (account) =>
    new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(Operation.uploadContractWasm({ wasm }))
      .setTimeout(180)
      .build(),
  );

  if (!upload.confirmed.returnValue) {
    throw new Error("Upload did not return WASM hash");
  }

  const wasmHash = bytesFromReturnValue(upload.confirmed.returnValue);
  console.log(`WASM uploaded: ${upload.hash}`);

  const deployerAddress = new Address(deployer.publicKey());
  const deploy = await submitOperation(server, deployer, (account) =>
    new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.createCustomContract({
          address: deployerAddress,
          wasmHash,
        }),
      )
      .setTimeout(180)
      .build(),
  );

  if (!deploy.confirmed.returnValue) {
    throw new Error("Deploy did not return contract address");
  }

  const contractId = Address.fromScVal(deploy.confirmed.returnValue).toString();
  console.log(`Contract deployed: ${contractId}`);
  console.log(`Deploy tx: ${deploy.hash}`);

  const xlmSac = Asset.native().contractId(NETWORK_PASSPHRASE);
  const contract = new Contract(contractId);

  const init = await submitOperation(server, deployer, (account) =>
    new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call("initialize", Address.fromString(xlmSac).toScVal()),
      )
      .setTimeout(180)
      .build(),
  );

  console.log(`Initialized with XLM SAC ${xlmSac}`);
  console.log(`Initialize tx: ${init.hash}`);

  const deployment = {
    network: "testnet",
    rpcUrl: RPC_URL,
    contractId,
    xlmSac,
    deployer: deployer.publicKey(),
    wasmPath: "contracts/target/wasm32v1-none/release/proveit.wasm",
    transactions: {
      friendbotFunding: friendbotHash,
      wasmUpload: upload.hash,
      contractDeploy: deploy.hash,
      initialize: init.hash,
    },
    deployedAt: new Date().toISOString(),
    vercelEnv: {
      NEXT_PUBLIC_APP_URL: "https://proofdrop-stellar.vercel.app",
      NEXT_PUBLIC_STELLAR_NETWORK: "testnet",
      NEXT_PUBLIC_PROOFDROP_CONTRACT_ID: contractId,
    },
  };

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(deployment, null, 2)}\n`);
  console.log(`\nWrote ${OUTPUT_PATH}`);
  console.log("\nVercel env:");
  console.log(JSON.stringify(deployment.vercelEnv, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
