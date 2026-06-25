import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "surface-panel flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6",
        className,
      )}
    >
      <div className="space-y-2">
        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
          Stellar Soroban
        </p>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
