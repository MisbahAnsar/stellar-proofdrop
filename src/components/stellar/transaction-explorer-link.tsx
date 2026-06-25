import { ExternalLink } from "lucide-react";

import { getStellarExpertTxUrl, shortenHash } from "@/lib/stellar/explorer";
import { cn } from "@/lib/utils";

type TransactionExplorerLinkProps = {
  transactionHash: string;
  className?: string;
  label?: string;
  showHash?: boolean;
};

export function TransactionExplorerLink({
  transactionHash,
  className,
  label = "View on Stellar Expert",
  showHash = true,
}: TransactionExplorerLinkProps) {
  const href = getStellarExpertTxUrl(transactionHash);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-primary hover:text-primary/80 inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline",
        className,
      )}
    >
      <span>{label}</span>
      {showHash ? (
        <span className="text-muted-foreground font-mono text-xs font-normal">
          ({shortenHash(transactionHash)})
        </span>
      ) : null}
      <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">(opens in new tab)</span>
    </a>
  );
}
