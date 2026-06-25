import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ProofVerification } from "@/types/proof";

type ProofVerificationCardProps = {
  verification: ProofVerification;
};

export function ProofVerificationCard({
  verification,
}: ProofVerificationCardProps) {
  return (
    <Alert variant={verification.matches ? "default" : "destructive"}>
      <AlertTitle>
        {verification.matches ? "Proof hash verified" : "Proof hash mismatch"}
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <p className="font-mono text-xs break-all">
          Stored: {verification.storedHash}
        </p>
        {verification.onChainHash ? (
          <p className="font-mono text-xs break-all">
            On-chain: {verification.onChainHash}
          </p>
        ) : (
          <p className="text-sm">On-chain hash not available in local cache.</p>
        )}
        <p className="text-sm">
          {verification.matches
            ? "The locally stored proof matches the hash recorded on-chain."
            : "The stored proof does not match the on-chain hash."}
        </p>
      </AlertDescription>
    </Alert>
  );
}
