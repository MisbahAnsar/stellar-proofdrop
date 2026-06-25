import { Navbar } from "@/components/layout/navbar";
import { SkipLink } from "@/components/layout/skip-link";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      <SkipLink />
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
