'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-6 py-4 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          SuperDimm Admin
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          <Button asChild variant={pathname === "/" ? "default" : "outline"} size="sm">
            <Link href="/">Dashboard</Link>
          </Button>
          <Button asChild variant={pathname === "/about" ? "default" : "outline"} size="sm">
            <Link href="/about">About</Link>
          </Button>
          <Button asChild variant={pathname === "/profile" ? "default" : "outline"} size="sm">
            <Link href="/profile">Profile</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
