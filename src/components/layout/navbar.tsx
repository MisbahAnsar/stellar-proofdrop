"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/wallet/wallet-controls";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type NavbarProps = {
  className?: string;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  title,
  pathname,
}: {
  href: string;
  title: string;
  pathname: string;
}) {
  const isActive = isActivePath(pathname, href);

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      aria-current={isActive ? "page" : undefined}
      render={<Link href={href} />}
    >
      {title}
    </Button>
  );
}

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "border-border bg-background sticky top-0 z-50 border-b",
        className,
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="text-foreground focus-visible:ring-ring shrink-0 rounded-sm text-sm font-semibold tracking-tight focus-visible:ring-2 focus-visible:outline-none"
          >
            {siteConfig.name}
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {siteConfig.nav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                title={item.title}
                pathname={pathname}
              />
            ))}
          </nav>
        </div>

        <WalletButton />
      </div>

      <nav
        aria-label="Main mobile"
        className="border-border flex gap-1 overflow-x-auto border-t px-4 py-2 md:hidden"
      >
        {siteConfig.nav.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            title={item.title}
            pathname={pathname}
          />
        ))}
      </nav>
    </header>
  );
}
