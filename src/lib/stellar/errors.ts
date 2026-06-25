export class WalletError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NOT_INSTALLED"
      | "ACCESS_DENIED"
      | "UNKNOWN" = "UNKNOWN",
  ) {
    super(message);
    this.name = "WalletError";
  }
}

export class ContractError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NOT_CONFIGURED"
      | "TRANSACTION_FAILED"
      | "UNKNOWN" = "UNKNOWN",
  ) {
    super(message);
    this.name = "ContractError";
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
