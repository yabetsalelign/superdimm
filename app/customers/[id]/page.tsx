import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CollapsibleFormPanel } from "@/components/collapsible-form-panel";
import { RequestForm } from "@/components/request-form";
import {
  formatCaseLabel,
  formatCategoryLabel,
  getCaseReference,
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

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "manager", "support"]);
  } catch {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold">Access Restricted</h1>
        <p className="mt-2 text-muted-foreground">You do not have access to view customer profiles.</p>
      </div>
    );
  }

  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      serviceRequests: {
        orderBy: { updatedAt: "desc" },
        include: { assignedUser: { select: { id: true, name: true, email: true } } },
      },
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!customer) notFound();

  const activeCases = customer.serviceRequests.filter(
    (request) => !["closed", "resolved"].includes(request.status)
  );
  const resolvedCases = customer.serviceRequests.filter(
    (request) => ["closed", "resolved"].includes(request.status)
  );

  const latestTransaction = customer.transactions[0];
  const totalBilled = customer.transactions.reduce((sum, txn) => sum + txn.amount, 0);

  return (
    <div className="space-y-6">
      {/* CUSTOMER HEADER */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Button asChild variant="link" className="h-auto p-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
              <Link href="/customers">← Back to Customers Directory</Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="font-mono text-xs font-bold text-muted-foreground">{customer.id}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {customer.name}
            </h1>
            <Badge variant={customer.status === "active" ? "success" : "warning"}>
              ● {formatCaseLabel(customer.status)} Account
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {customer.email ? (
              <a href={`mailto:${customer.email}`} className="hover:text-primary hover:underline">
                {customer.email}
              </a>
            ) : null}
            {customer.email && customer.phone ? <span>·</span> : null}
            {customer.phone ? (
              <a href={`tel:${customer.phone}`} className="hover:text-primary hover:underline font-mono">
                {customer.phone}
              </a>
            ) : null}
            <span>·</span>
            <span className="font-medium text-foreground">{customer.plan || "Standard Telecom Service"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
          <CollapsibleFormPanel label="Log Case for Customer" maxWidth="lg">
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Logging a new service case pre-associated with <strong>{customer.name}</strong> ({customer.id}).
              </p>
              <RequestForm initialCustomerId={customer.id} />
            </div>
          </CollapsibleFormPanel>
        </div>
      </div>

      {/* SUMMARY METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider">Service Plan</CardDescription>
            <CardTitle className="text-lg truncate font-bold text-foreground" title={customer.plan || "Standard Plan"}>
              {customer.plan || "Standard Plan"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Primary telecom package</p>
          </CardContent>
        </Card>

        <Card className={activeCases.length > 0 ? "border-amber-300 dark:border-amber-700/60" : ""}>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider">Active Cases</CardDescription>
            <CardTitle className="text-3xl font-bold text-amber-700 dark:text-amber-400">
              {activeCases.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {activeCases.length === 0 ? "No active issues" : "Requiring agent action"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider">Lifetime Cases</CardDescription>
            <CardTitle className="text-3xl font-bold text-foreground">
              {customer.serviceRequests.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {resolvedCases.length} resolved / closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider">Latest Billing</CardDescription>
            <CardTitle className="text-xl font-bold text-foreground truncate">
              {latestTransaction
                ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(latestTransaction.amount)
                : "No Records"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {latestTransaction
                ? `${new Date(latestTransaction.createdAt).toLocaleDateString()} · ${latestTransaction.description}`
                : "No transaction history"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MAIN TWO-COLUMN SPLIT */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] xl:grid-cols-[1.3fr_0.7fr]">
        {/* CASE WORKLOAD HISTORY */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Service Cases</CardTitle>
                  <CardDescription className="text-xs">
                    Complete case history and live operational queue for this subscriber
                  </CardDescription>
                </div>
                <Badge variant="default">{customer.serviceRequests.length} Total</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              {customer.serviceRequests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">No service cases recorded for this customer yet.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Use the button above to log a new case.</p>
                </div>
              ) : (
                <>
                  {/* ACTIVE CASES */}
                  {activeCases.length > 0 ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                          Active & Open Cases ({activeCases.length})
                        </h2>
                      </div>
                      <div className="space-y-2">
                        {activeCases.map((request) => (
                          <Link
                            key={request.id}
                            href={`/requests/${request.id}`}
                            className="flex flex-col gap-2 rounded-xl border border-amber-200/80 bg-amber-50/20 p-3.5 transition hover:border-amber-400 hover:bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-primary">
                                  {getCaseReference(request.id)}
                                </span>
                                <span className="font-medium text-foreground truncate">{request.title}</span>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatCategoryLabel(request.category)} · Assigned to {request.assignedUser?.name ?? "Unassigned"} · Updated {new Date(request.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant={getPriorityBadgeVariant(request.priority)}>
                                {formatCaseLabel(request.priority)}
                              </Badge>
                              <Badge variant={getStatusBadgeVariant(request.status)}>
                                {formatCaseLabel(request.status)}
                              </Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* RESOLVED / HISTORICAL CASES */}
                  {resolvedCases.length > 0 ? (
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Resolved & Closed History ({resolvedCases.length})
                      </h2>
                      <div className="space-y-2">
                        {resolvedCases.map((request) => (
                          <Link
                            key={request.id}
                            href={`/requests/${request.id}`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border/70 p-3 text-sm transition hover:bg-muted/40"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-muted-foreground">
                                  {getCaseReference(request.id)}
                                </span>
                                <span className="font-medium text-foreground truncate">{request.title}</span>
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {formatCategoryLabel(request.category)} · Resolved on {new Date(request.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="success">{formatCaseLabel(request.status)}</Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* BILLING CONTEXT & LEDGER */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Account Billing Context</CardTitle>
                  <CardDescription className="text-xs">
                    Subscriber ledger records for billing disputes and operational context
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {customer.transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No billing transactions recorded for this account.
                </p>
              ) : (
                <>
                  <div className="divide-y divide-border/60">
                    {customer.transactions.map((txn) => {
                      const isCredit = txn.type === "payment" || txn.type === "adjustment" || txn.type === "income";
                      return (
                        <div key={txn.id} className="flex items-center justify-between py-2.5 text-sm">
                          <div className="min-w-0 pr-3">
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

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>Recent Volume ({customer.transactions.length} entries)</span>
                    <span className="font-semibold text-foreground">
                      Net: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalBilled)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}