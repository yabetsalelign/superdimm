"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/requests", label: "Service Requests" },
  { href: "/transactions", label: "Transactions" },
  { href: "/users", label: "Users" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

function getPageTitle(pathname: string) {
  const match = navigation.find((item) => item.href === pathname);
  return match?.label ?? "Overview";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
      <div className="flex min-h-screen">
        <aside
          className={
            (sidebarOpen ? "translate-x-0" : "-translate-x-full") +
            " fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-background p-4 shadow-sm transition-transform lg:static lg:translate-x-0"
          }
        >
          <div className="flex h-full flex-col">
            <div className="mb-8 flex items-center justify-between gap-3 px-2">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">SuperDimm</p>
                <h1 className="text-lg font-semibold">Operations</h1>
              </div>
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                Close
              </Button>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={
                      "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors " +
                      (isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Signed in</p>
              <p className="mt-2 font-medium">{session?.user?.name ?? session?.user?.email ?? "User"}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.role ?? "user"}</p>
            </div>
          </div>
        </aside>

        <div className="flex-1"> 
          <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-4 py-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen((value) => !value)}
                >
                  Menu
                </Button>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
                  <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Card className="hidden items-center gap-2 px-3 py-2 sm:flex">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">User</span>
                  <span className="text-sm font-medium">{session?.user?.name ?? session?.user?.email ?? "Guest"}</span>
                </Card>
                <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/signin" })}>
                  Sign out
                </Button>
              </div>
            </div>
          </header>
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
