"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Users, FileText, CreditCard, UserCheck, BarChart2, Settings } from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/requests", label: "Cases", icon: FileText },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/users", label: "Users", icon: UserCheck },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
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
            " fixed inset-y-0 left-0 z-40 w-72 border-r border-sidebar-border bg-sidebar p-4 shadow-sm transition-transform lg:static lg:translate-x-0"
          }
        >
          <div className="flex h-full flex-col">
            <div className="mb-8 flex items-center justify-between gap-3 px-2">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">SuperDimm</p>
                <h1 className="text-lg font-semibold text-foreground">Operations</h1>
              </div>
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                Close
              </Button>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon as React.ComponentType<React.SVGProps<SVGSVGElement> & { className?: string }>;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors " +
                      (isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground")
                    }
                  >
                    <Icon className={"h-4 w-4 " + (isActive ? "text-primary" : "text-muted-foreground")} />
                    <span>{item.label}</span>
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
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title === 'Dashboard' ? 'Overview' : title}</p>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Card className="hidden items-center gap-2 px-3 py-2 sm:flex">
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
