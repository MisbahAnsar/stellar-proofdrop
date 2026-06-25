"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/feedback/error-fallback";
import { PageHeader } from "@/components/layout/page-header";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Error"
        description="Proofdrop encountered a problem."
      />
      <ErrorFallback error={error} onRetry={reset} />
    </div>
  );
}
