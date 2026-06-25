"use client";

import type { StoredProof } from "@/types/proof";
import { cn } from "@/lib/utils";

type ProofPreviewProps = {
  proof: StoredProof;
  className?: string;
};

export function ProofPreview({ proof, className }: ProofPreviewProps) {
  if (proof.mimeType.startsWith("image/")) {
    return (
      <div className={cn("border-border overflow-hidden rounded-lg border", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={proof.dataUrl}
          alt={proof.fileName}
          className="max-h-80 w-full object-contain bg-white sm:max-h-96"
        />
      </div>
    );
  }

  if (proof.mimeType === "application/pdf") {
    return (
      <div className={cn("border-border overflow-hidden rounded-lg border", className)}>
        <iframe
          src={proof.dataUrl}
          title={proof.fileName}
          className="h-80 w-full bg-white sm:h-96"
        />
      </div>
    );
  }

  if (proof.mimeType === "text/plain") {
    const text = decodeTextDataUrl(proof.dataUrl);
    return (
      <pre
        aria-label={`Text preview of ${proof.fileName}`}
        className={cn(
          "border-border max-h-80 overflow-auto rounded-lg border bg-white p-4 text-xs whitespace-pre-wrap sm:max-h-96",
          className,
        )}
      >
        {text}
      </pre>
    );
  }

  return (
    <p className={cn("text-muted-foreground text-sm", className)}>
      Preview unavailable for {proof.fileName}.
    </p>
  );
}

function decodeTextDataUrl(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) {
    return "";
  }

  const payload = dataUrl.slice(commaIndex + 1);
  try {
    return atob(payload);
  } catch {
    return "";
  }
}
