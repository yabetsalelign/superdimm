'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

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
          <Button asChild variant={pathname === "/transactions" ? "default" : "outline"} size="sm">
            <Link href="/transactions">Transactions</Link>
          </Button>
          <Button asChild variant={pathname === "/profile" ? "default" : "outline"} size="sm">
            <Link href="/profile">Profile</Link>
          </Button>
          {session?.user ? (
            <Button size="sm" variant="ghost" onClick={() => signOut({ callbackUrl: "/signin" })}>
              Sign out
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => signIn()}>
              Sign in
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
