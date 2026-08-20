"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatCaseLabel,
  formatCategoryLabel,
  getCaseReference,
} from "@/lib/case-utils";

type DashboardRequest = {
  id: string;
  title: string;
  category?: string;
  status: string;
  priority: string;
  customer: { name: string; id?: string };
  updatedAt: Date;
};

type DashboardTransaction = {
  id: string;
  description: string;
  amount: number;
  customer: { name: string; id?: string } | null;
  type: string;
  createdAt?: Date;
};

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

export function DashboardWorkload({
  requests,
  transactions,
  metrics,
}: {
  requests: DashboardRequest[];
  transactions: DashboardTransaction[];
  metrics: {
    customerCount: number;
    open: number;
    highPriority: number;
    unassigned: number;
    inProgress: number;
    escalated: number;
  };
}) {
  const [visible, setVisible] = useState({ overview: true, priority: true, recent: true, transactions: false });
  const [customizing, setCustomizing] = useState(false);
  const toggle = (key: keyof typeof visible) => setVisible((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Telecom Operations Desk</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Support Workload</h1>
          <p className="mt-1 text-sm text-muted-foreground">Triage incoming subscriber issues, monitor urgency, and move cases to resolution.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/requests">View All Cases</Link>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setCustomizing((v) => !v)}>
            {customizing ? "Close Customize" : "Customize View"}
          </Button>
        </div>
      </div>

      {customizing ? (
        <Card className="border-primary/20 bg-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Dashboard Workload Sections</CardTitle>
            <CardDescription className="text-xs">Toggle the information cards you need for your daily shift.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 pt-0">
            {(["overview", "priority", "recent", "transactions"] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input type="checkbox" checked={visible[key]} onChange={() => toggle(key)} className="rounded" />
                {key === "overview" ? "Triage Metrics" : key === "priority" ? "Priority Queue" : key === "recent" ? "Recent Queue" : "Billing Context"}
              </label>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {visible.overview ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">Open Queue</CardDescription>
              <CardTitle className="text-3xl font-bold text-foreground">{metrics.open}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Cases awaiting action</p>
            </CardContent>
          </Card>

          <Card className={metrics.highPriority > 0 ? "border-red-300 dark:border-red-800/60" : ""}>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">High / Critical</CardDescription>
              <CardTitle className="text-3xl font-bold text-red-700 dark:text-red-400">{metrics.highPriority}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">SLA critical issues</p>
            </CardContent>
          </Card>

          <Card className={metrics.unassigned > 0 ? "border-amber-300 dark:border-amber-800/60" : ""}>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">Unassigned</CardDescription>
              <CardTitle className="text-3xl font-bold text-amber-700 dark:text-amber-400">{metrics.unassigned}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Needs an agent owner</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">In Progress</CardDescription>
              <CardTitle className="text-3xl font-bold text-foreground">{metrics.inProgress}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Currently being worked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">Escalated</CardDescription>
              <CardTitle className="text-3xl font-bold text-foreground">{metrics.escalated}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Supervision required</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {visible.priority ? (
        <Card className="border-border">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Priority Triage Queue</CardTitle>
                <CardDescription className="text-xs">Critical and High-priority issues requiring immediate operational attention</CardDescription>
              </div>
              <Badge variant="danger">
                {requests.filter((r) => r.priority === "critical" || r.priority === "high").length} Urgent
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            {requests.filter((r) => r.priority === "critical" || r.priority === "high").slice(0, 5).map((request) => (
              <Link
                key={request.id}
                href={`/requests/${request.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 transition hover:border-primary/50 hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{getCaseReference(request.id)}</span>
                    <p className="font-medium text-foreground truncate">{request.title}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {request.customer.name} · {formatCategoryLabel(request.category)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={getPriorityBadgeVariant(request.priority)}>{formatCaseLabel(request.priority)}</Badge>
                  <Badge variant={getStatusBadgeVariant(request.status)}>{formatCaseLabel(request.status)}</Badge>
                </div>
              </Link>
            ))}
            {requests.filter((r) => r.priority === "critical" || r.priority === "high").length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No high or critical priority cases in the queue.</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {visible.recent ? (
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Recent Case Activity</CardTitle>
                  <CardDescription className="text-xs">Latest subscriber issues moving through the queue</CardDescription>
                </div>
                <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
                  <Link href="/requests">View All →</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {requests.slice(0, 6).map((request) => (
                <Link
                  key={request.id}
                  href={`/requests/${request.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-2.5 text-xs transition hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-muted-foreground">{getCaseReference(request.id)}</span>
                      <p className="font-medium text-foreground truncate">{request.title}</p>
                    </div>
                    <p className="mt-0.5 text-muted-foreground">{request.customer.name} · {formatCategoryLabel(request.category)}</p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <span className="text-muted-foreground">{new Date(request.updatedAt).toLocaleDateString()}</span>
                    <Badge variant={getStatusBadgeVariant(request.status)}>{formatCaseLabel(request.status)}</Badge>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {visible.transactions ? (
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-semibold">Subscriber Billing Activity</CardTitle>
              <CardDescription className="text-xs">Recent account transactions for context during customer triage</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {transactions.slice(0, 6).map((txn) => {
                const isCredit = txn.type === "payment" || txn.type === "adjustment" || txn.type === "income";
                return (
                  <div key={txn.id} className="flex items-center justify-between gap-3 border-b border-border/60 py-2 last:border-0 text-xs">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{txn.description}</p>
                      <p className="text-muted-foreground">{txn.customer?.name ?? "Subscriber"}</p>
                    </div>
                    <p className={`font-semibold shrink-0 ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(txn.amount)}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}