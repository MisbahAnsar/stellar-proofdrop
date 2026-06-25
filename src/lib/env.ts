import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_STELLAR_NETWORK: z
    .enum(["testnet", "mainnet"])
    .default("testnet"),
  NEXT_PUBLIC_SOROBAN_RPC_URL: z.url().optional(),
  NEXT_PUBLIC_PROVEIT_CONTRACT_ID: z.string().trim().min(1).optional(),
});

function createEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
    NEXT_PUBLIC_SOROBAN_RPC_URL: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL,
    NEXT_PUBLIC_PROVEIT_CONTRACT_ID:
      process.env.NEXT_PUBLIC_PROVEIT_CONTRACT_ID,
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
