import { z } from "zod";

function emptyToUndefined(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.preprocess(
    emptyToUndefined,
    z.url().default("https://proofdrop-stellar.vercel.app"),
  ),
  NEXT_PUBLIC_STELLAR_NETWORK: z.preprocess(
    emptyToUndefined,
    z.enum(["testnet", "mainnet"]).default("testnet"),
  ),
  NEXT_PUBLIC_SOROBAN_RPC_URL: z.preprocess(
    emptyToUndefined,
    z.url().optional(),
  ),
  NEXT_PUBLIC_PROOFDROP_CONTRACT_ID: z.preprocess(
    emptyToUndefined,
    z.string().min(1).optional(),
  ),
});

function createEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
    NEXT_PUBLIC_SOROBAN_RPC_URL: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL,
    NEXT_PUBLIC_PROOFDROP_CONTRACT_ID:
      process.env.NEXT_PUBLIC_PROOFDROP_CONTRACT_ID,
  });

  if (!parsed.success) {
    console.error(
      "Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = createEnv();
