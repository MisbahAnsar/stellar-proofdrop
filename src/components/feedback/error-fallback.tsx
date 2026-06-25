"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

type ErrorFallbackProps = {
  title?: string;
  description?: string;
  error?: Error & { digest?: string };
  onRetry?: () => void;
  showHomeLink?: boolean;
};

export function ErrorFallback({
  title = "Something went wrong",
  description = "An unexpected error occurred. You can try again or return home.",
  error,
  onRetry,
  showHomeLink = true,
}: ErrorFallbackProps) {
  return (
    <EmptyState
      title={title}
      description={
        process.env.NODE_ENV === "development" && error?.message
          ? `${description} (${error.message})`
          : description
      }
      action={
        <>
          {onRetry ? (
            <Button type="button" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
          {showHomeLink ? (
            <Button variant="outline" render={<Link href="/" />}>
              Back home
            </Button>
          ) : null}
        </>
      }
      className="max-w-lg"
    />
  );
}
