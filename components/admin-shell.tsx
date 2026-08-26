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

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={
            (sidebarOpen ? "translate-x-0" : "-translate-x-full") +
            " fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card p-4 transition-transform lg:static lg:translate-x-0"
          }
        >
          <div className="flex h-full flex-col">
            {/* Sidebar Logo */}
            <div className="mb-6 flex items-center justify-between gap-3 px-2">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">S</span>
                <div className="min-w-0">
                  <span className="text-sm font-bold tracking-tight text-foreground block truncate">SuperDimm</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block -mt-1 font-semibold">Operations CRM</span>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                ✕
              </Button>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon as React.ComponentType<React.SVGProps<SVGSVGElement> & { className?: string }>;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors " +
                      (isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:bg-slate-100 hover:text-foreground")
                    }
                  >
                    <Icon className={"h-4 w-4 shrink-0 " + (isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile Block */}
            <div className="mt-auto rounded-lg border border-border bg-slate-50/50 p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {(session?.user?.name ?? session?.user?.email ?? "U")[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs text-foreground truncate">
                  {session?.user?.name ?? session?.user?.email?.split('@')[0] ?? "Operations Staff"}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize font-medium">
                  {session?.user?.role ?? "agent"}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Area */}
        <div className="flex-1 min-w-0"> 
          <header className="sticky top-0 z-20 border-b border-border bg-card px-4 py-3 sm:px-6">
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
                <div className="sr-only">Portal navigation</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-50 border border-border rounded-lg sm:flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>CRM Session Active</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await signOut({ redirect: false });
                    window.location.replace("/operations/login");
                  }}
                >
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
