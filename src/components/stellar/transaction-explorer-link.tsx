import { ExternalLink } from "lucide-react";

import { getStellarExpertTxUrl } from "@/lib/stellar/explorer";
import { cn } from "@/lib/utils";

type TransactionExplorerLinkProps = {
  transactionHash: string;
  className?: string;
  label?: string;
};

export function TransactionExplorerLink({
  transactionHash,
  className,
  label = "View on Stellar Expert",
}: TransactionExplorerLinkProps) {
  const href = getStellarExpertTxUrl(transactionHash);

  return (
    <div className={cn("space-y-2", className)}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
      >
        <span>{label}</span>
        <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="sr-only">(opens in new tab)</span>
      </a>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary bg-muted/50 block rounded-md border px-3 py-2 font-mono text-xs break-all transition-colors hover:underline"
      >
        {href}
      </a>
    </div>
  );
}
