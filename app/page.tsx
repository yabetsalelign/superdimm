import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/rbac";
import type { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Require admin role. If not authenticated, show the standalone sign-in prompt.
  // Determine access level for this page (admin required)
  let access: "admin" | "forbidden" | "unauthenticated" = "admin";

  try {
    await requireRole(["admin"]);
    access = "admin";
  } catch {
    try {
      await requireUser();
      access = "forbidden";
    } catch {
      access = "unauthenticated";
    }
  }

  if (access === "unauthenticated") {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">SuperDimm</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Operations dashboard</h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Sign in to view customer activity, service requests, transactions, and team operations.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  if (access === "forbidden") {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">SuperDimm</p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">You do not have access</h1>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
            Your account does not have permission to view the Operations Dashboard.
          </p>
        </section>
      </main>
    );
  }

  const [customerCount, openRequests, transactionCount, totalRevenue, recentRequests, recentTransactions] = await Promise.all([
    prisma.customer.count(),
    prisma.serviceRequest.count({ where: { status: { not: "closed" } } }),
    prisma.transaction.count(),
    prisma.transaction.aggregate({ _sum: { amount: true } }),
    prisma.serviceRequest.findMany({
      take: 4,
      orderBy: { updatedAt: "desc" },
      include: { customer: true },
    }),
    prisma.transaction.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
  ]);

  const revenue = totalRevenue._sum.amount ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Overview</p>
          <h1 className="text-3xl font-semibold tracking-tight">Operations Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/customers">Create customer</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/requests">New request</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7h18M3 12h18M3 17h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <CardTitle>Total customers</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold leading-tight">{customerCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">Active customers in the system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 10l5 5 5-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <CardTitle>Open service requests</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold leading-tight">{openRequests}</p>
            <p className="mt-1 text-sm text-muted-foreground">Requests awaiting attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 1v22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <CardTitle>Transactions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold leading-tight">{transactionCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">Total recorded transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 8v8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 12h8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <CardTitle>Revenue</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold leading-tight">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(revenue)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Recorded transaction amounts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent service requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRequests.map((request: Prisma.ServiceRequestGetPayload<{ include: { customer: true } }>) => (
              <div key={request.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="font-medium">{request.title}</p>
                  <p className="text-sm text-muted-foreground">{request.customer.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm capitalize text-muted-foreground">{request.status}</p>
                  <p className="text-xs text-muted-foreground">{new Date(request.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/customers">Add customer</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/requests">Create service request</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/transactions">Review transactions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentTransactions.map((transaction: Prisma.TransactionGetPayload<{ include: { customer: true } }>) => (
            <div key={transaction.id} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">{transaction.customer?.name ?? "Customer"}</p>
              </div>
              <p className={transaction.type === "income" ? "text-emerald-600" : "text-red-600"}>
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(transaction.amount)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
