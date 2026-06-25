const STROOPS_PER_XLM = BigInt(10_000_000);

export function xlmToStroops(xlm: number): bigint {
  if (!Number.isFinite(xlm) || xlm <= 0) {
    throw new Error("Invalid XLM amount");
  }

  const stroops = Math.round(xlm * Number(STROOPS_PER_XLM));
  return BigInt(stroops);
}

export function stroopsToXlm(stroops: bigint): number {
  return Number(stroops) / Number(STROOPS_PER_XLM);
}

export function formatXlm(xlm: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 7,
  }).format(xlm);
}
