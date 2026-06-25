const STROOPS_PER_XLM = BigInt(10_000_000);

export function xlmToStroops(xlm: number): bigint {
  if (!Number.isFinite(xlm) || xlm <= 0) {
    throw new Error("Invalid XLM amount");
  }

  const [wholePart = "0", fractionPart = ""] = xlm.toFixed(7).split(".");
  const fraction = fractionPart.padEnd(7, "0").slice(0, 7);

  return BigInt(wholePart) * STROOPS_PER_XLM + BigInt(fraction);
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
