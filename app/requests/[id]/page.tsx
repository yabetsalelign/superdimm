import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseActions } from "@/components/case-actions";
import {
  formatCaseLabel,
  formatCategoryLabel,
  getCaseReference,
  getSuggestedTeam,
} from "@/lib/case-utils";

export const dynamic = "force-dynamic";

function getStatusBadgeVariant(status: string) {
  if (status === "closed" || status === "resolved") return "success" as const;
  if (status === "open") return "accent" as const;
  if (status === "escalated") return "danger" as const;
  return "warning" as const;
}

function getPriorityBadgeVariant(priority: string) {
  if (priority === "critical" || priority === "high") return "danger" as const;
  if (priority === "low") return "muted" as const;
  return "default" as const;
}

function formatTransactionType(type: string) {
  const map: Record<string, string> = {
    subscription: "Subscription",
    payment: "Payment",
    adjustment: "Adjustment",
    hardware: "Hardware",
    income: "Credit / Income",
    expense: "Charge / Expense",
  };
  return map[type.toLowerCase()] ?? formatCaseLabel(type);
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "manager", "support"]);
  } catch {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold">Access Restricted</h1>
        <p className="mt-2 text-muted-foreground">You must be an authorized support agent or manager to view case details.</p>
      </div>
    );
  }

  const { id } = await params;

  const [request, users] = await Promise.all([
    prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        customer: true,
        assignedUser: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ["admin", "manager", "support"] } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!request) notFound();

  // Fetch the customer's other cases and recent billing records in parallel
  const [customerOtherCases, customerTransactions] = await Promise.all([
    prisma.serviceRequest.findMany({
      where: { customerId: request.customerId, id: { not: request.id } },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.transaction.findMany({
      where: { customerId: request.customerId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const activeOtherCases = customerOtherCases.filter((c) => !["closed", "resolved"].includes(c.status));
  const resolvedOtherCases = customerOtherCases.filter((c) => ["closed", "resolved"].includes(c.status));

  const reference = getCaseReference(request.id);
  const category = request.category || "network";
  const suggestedTeam = getSuggestedTeam(category);

  return (
    <div className="space-y-6">
      {/* CASE HEADER */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Button asChild variant="link" className="h-auto p-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
              <Link href="/requests">← Back to Cases Queue</Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="font-mono text-xs font-bold text-primary">{reference}</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {request.title}
          </h1>

          <p className="text-sm text-muted-foreground">
            Reported by{" "}
            <Link href={`/customers/${request.customer.id}`} className="font-medium text-foreground hover:underline">
              {request.customer.name}
            </Link>
            {" · "}
            Created on {new Date(request.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            {request.createdBy?.name ? ` by ${request.createdBy.name}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
          <Badge variant={getStatusBadgeVariant(request.status)}>
            {formatCaseLabel(request.status)}
          </Badge>
          <Badge variant={getPriorityBadgeVariant(request.priority)}>
            {formatCaseLabel(request.priority)} Priority
          </Badge>
          <Badge variant="default">
            {formatCategoryLabel(category)}
          </Badge>
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE */}
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] xl:grid-cols-[1.3fr_0.7fr]">
        {/* MAIN WORK CANVAS */}
        <div className="space-y-6">
          {/* 1. PROBLEM STATEMENT */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Problem Statement</CardTitle>
                  <CardDescription className="text-xs">Verbatim issue reported for telecom operations review</CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Routing Queue</span>
                  <p className="text-xs font-semibold text-primary">{suggestedTeam}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {request.description || "No additional detailed description was recorded for this issue."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground pt-1 border-t border-border/40 sm:grid-cols-4">
                <div>
                  <span className="block font-medium text-foreground">Category</span>
                  <span>{formatCategoryLabel(category)}</span>
                </div>
                <div>
                  <span className="block font-medium text-foreground">Assigned Agent</span>
                  <span>{request.assignedUser?.name ?? "Unassigned"}</span>
                </div>
                <div>
                  <span className="block font-medium text-foreground">Created</span>
                  <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block font-medium text-foreground">Last Activity</span>
                  <span>{new Date(request.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. CUSTOMER CASE HISTORY (Same Account Context) */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Customer Case History</CardTitle>
                  <CardDescription className="text-xs">
                    Other cases recorded for {request.customer.name} (detect duplicates or recurring faults)
                  </CardDescription>
                </div>
                <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
                  <Link href={`/customers/${request.customer.id}`}>View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {customerOtherCases.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No other cases on record for this customer account.
                </p>
              ) : (
                <div className="space-y-3">
                  {activeOtherCases.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">
                        Active Issues ({activeOtherCases.length})
                      </p>
                      <div className="space-y-2">
                        {activeOtherCases.map((c) => (
                          <Link
                            key={c.id}
                            href={`/requests/${c.id}`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 text-sm transition hover:border-primary/50 hover:bg-muted/40"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-primary">
                                  {getCaseReference(c.id)}
                                </span>
                                <span className="truncate font-medium text-foreground">{c.title}</span>
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {formatCategoryLabel(c.category)} · Updated {new Date(c.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant={getPriorityBadgeVariant(c.priority)}>{formatCaseLabel(c.priority)}</Badge>
                              <Badge variant={getStatusBadgeVariant(c.status)}>{formatCaseLabel(c.status)}</Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {resolvedOtherCases.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Recently Resolved ({resolvedOtherCases.length})
                      </p>
                      <div className="space-y-2">
                        {resolvedOtherCases.map((c) => (
                          <Link
                            key={c.id}
                            href={`/requests/${c.id}`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-2.5 text-xs transition hover:bg-muted/30"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium text-muted-foreground">
                                  {getCaseReference(c.id)}
                                </span>
                                <span className="truncate font-medium text-foreground">{c.title}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-muted-foreground">{new Date(c.updatedAt).toLocaleDateString()}</span>
                              <Badge variant="success">{formatCaseLabel(c.status)}</Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. BILLING CONTEXT (Recent Transactions) */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Billing Context</CardTitle>
                  <CardDescription className="text-xs">
                    Recent subscriber billing records to verify account standing during support conversations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {customerTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No billing records on file for this account.
                </p>
              ) : (
                <div className="divide-y divide-border/60">
                  {customerTransactions.map((txn) => {
                    const isCredit = txn.type === "payment" || txn.type === "adjustment" || txn.type === "income";
                    return (
                      <div key={txn.id} className="flex items-center justify-between py-2.5 text-sm">
                        <div className="min-w-0 pr-4">
                          <p className="font-medium text-foreground truncate">{txn.description}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span>{new Date(txn.createdAt).toLocaleDateString()}</span>
                            <span>·</span>
                            <span className="capitalize">{formatTransactionType(txn.type)}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`font-semibold ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(txn.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PERSISTENT SIDEBAR */}
        <div className="space-y-6">
          {/* ACTION CONTROLS */}
          <Card className="border-primary/30 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-semibold">Case Actions</CardTitle>
              <CardDescription className="text-xs">Update lifecycle status, priority, or reassign</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <CaseActions
                requestId={request.id}
                status={request.status}
                priority={request.priority}
                category={category}
                assignedUserId={request.assignedUserId}
                users={users}
              />
            </CardContent>
          </Card>

          {/* CUSTOMER IDENTITY & ACCOUNT STANDING */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-semibold">Customer Profile</CardTitle>
              <CardDescription className="text-xs">Account and contact information</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div>
                <p className="text-lg font-bold text-foreground">{request.customer.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={request.customer.status === "active" ? "success" : "warning"}>
                    ● {formatCaseLabel(request.customer.status)} Account
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-muted-foreground uppercase tracking-wider block">Service Plan</span>
                  <span className="font-medium text-foreground text-sm">{request.customer.plan || "Standard Telecom Service"}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground uppercase tracking-wider block">Account Reference</span>
                  <span className="font-mono text-foreground">{request.customer.id}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium text-muted-foreground block">Phone Contact</span>
                  {request.customer.phone ? (
                    <a href={`tel:${request.customer.phone}`} className="font-semibold text-primary hover:underline">
                      {request.customer.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                <div>
                  <span className="font-medium text-muted-foreground block">Email Address</span>
                  {request.customer.email ? (
                    <a href={`mailto:${request.customer.email}`} className="font-semibold text-primary hover:underline truncate block">
                      {request.customer.email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/customers/${request.customer.id}`}>
                    Open Full Customer 360 Profile →
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}