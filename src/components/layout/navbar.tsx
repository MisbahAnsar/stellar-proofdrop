import Link from "next/link";

import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/wallet/wallet-controls";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  return (
    <header
      className={cn(
        "border-border bg-background sticky top-0 z-50 border-b",
        className,
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/"
            className="text-foreground shrink-0 text-sm font-semibold tracking-tight"
          >
            {siteConfig.name}
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {siteConfig.nav.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                render={<Link href={item.href} />}
              >
                {item.title}
              </Button>
            ))}
          </nav>
        </div>

        <WalletButton />
      </div>

      <nav className="border-border flex gap-1 overflow-x-auto border-t px-4 py-2 md:hidden">
        {siteConfig.nav.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            size="sm"
            render={<Link href={item.href} />}
          >
            {item.title}
          </Button>
        ))}
      </nav>
    </header>
  );
}
