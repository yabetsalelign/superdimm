import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
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
          <CardHeader>
            <CardTitle>Total customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{customerCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open service requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{openRequests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{transactionCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(revenue)}
            </p>
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
