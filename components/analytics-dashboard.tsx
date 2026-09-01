"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCaseLabel, formatCategoryLabel, getCaseReference } from "@/lib/case-utils";

export interface AnalyticsRequest {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  customerName?: string | null;
  assignedUserName?: string | null;
}

type TimePeriod = "all" | "today" | "7d" | "30d" | "month";

const statusOrder = ["open", "assigned", "in_progress", "pending_customer", "escalated", "resolved", "closed"];

function statusVariant(status: string) {
  if (status === "resolved" || status === "closed") return "success" as const;
  if (status === "open") return "accent" as const;
  if (status === "escalated") return "danger" as const;
  return "warning" as const;
}

export function AnalyticsDashboard({ requests }: { requests: AnalyticsRequest[] }) {
  const [period, setPeriod] = useState<TimePeriod>("all");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  // Filter requests by time period
  const periodFilteredRequests = useMemo(() => {
    if (period === "all") return requests;

    const now = new Date();
    let cutoff: Date;

    if (period === "today") {
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "7d") {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "30d") {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      return requests;
    }

    return requests.filter((req) => new Date(req.createdAt) >= cutoff);
  }, [requests, period]);

  // Apply drill-down filters
  const filteredRequests = useMemo(() => {
    return periodFilteredRequests.filter((req) => {
      if (selectedStatus && req.status !== selectedStatus) return false;
      if (selectedCategory && req.category !== selectedCategory) return false;
      if (selectedPriority && req.priority !== selectedPriority) return false;
      return true;
    });
  }, [periodFilteredRequests, selectedStatus, selectedCategory, selectedPriority]);

  // Overall counts for summary cards
  const totalCount = filteredRequests.length;
  const openCount = filteredRequests.filter((r) => r.status === "open").length;
  const inProgressCount = filteredRequests.filter((r) => ["in_progress", "assigned", "pending_customer"].includes(r.status)).length;
  const resolvedCount = filteredRequests.filter((r) => ["resolved", "closed"].includes(r.status)).length;
  const priorityCount = filteredRequests.filter((r) => ["high", "critical"].includes(r.priority)).length;

  // Status distribution
  const statuses = useMemo(() => {
    return statusOrder
      .map((status) => ({
        status,
        count: periodFilteredRequests.filter((r) => {
          if (selectedCategory && r.category !== selectedCategory) return false;
          if (selectedPriority && r.priority !== selectedPriority) return false;
          return r.status === status;
        }).length,
      }))
      .filter((item) => item.count > 0);
  }, [periodFilteredRequests, selectedCategory, selectedPriority]);

  // Category distribution
  const categories = useMemo(() => {
    const unique = [...new Set(periodFilteredRequests.map((r) => r.category))];
    return unique
      .map((category) => ({
        category,
        count: periodFilteredRequests.filter((r) => {
          if (selectedStatus && r.status !== selectedStatus) return false;
          if (selectedPriority && r.priority !== selectedPriority) return false;
          return r.category === category;
        }).length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [periodFilteredRequests, selectedStatus, selectedPriority]);

  // Priority distribution
  const priorities = useMemo(() => {
    return ["low", "medium", "high", "critical"]
      .map((priority) => ({
        priority,
        count: periodFilteredRequests.filter((r) => {
          if (selectedStatus && r.status !== selectedStatus) return false;
          if (selectedCategory && r.category !== selectedCategory) return false;
          return r.priority === priority;
        }).length,
      }))
      .filter((item) => item.count > 0);
  }, [periodFilteredRequests, selectedStatus, selectedCategory]);

  // Queue ownership (workload by assignee)
  const workloadEntries = useMemo(() => {
    const workload = new Map<string, number>();
    filteredRequests
      .filter((r) => !["resolved", "closed"].includes(r.status))
      .forEach((r) => {
        const name = r.assignedUserName || "Unassigned";
        workload.set(name, (workload.get(name) ?? 0) + 1);
      });
    return [...workload.entries()].sort((a, b) => b[1] - a[1]);
  }, [filteredRequests]);

  // Volume Trend: Group by date based strictly on actual createdAt values
  const volumeTrend = useMemo(() => {
    const dateMap = new Map<string, { dateLabel: string; count: number; dateObj: Date }>();

    filteredRequests.forEach((req) => {
      const d = new Date(req.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const existing = dateMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        dateMap.set(key, { dateLabel: label, count: 1, dateObj: d });
      }
    });

    return [...dateMap.entries()]
      .sort((a, b) => a[1].dateObj.getTime() - b[1].dateObj.getTime())
      .map(([, v]) => v);
  }, [filteredRequests]);

  const maxTrendCount = useMemo(() => {
    return Math.max(...volumeTrend.map((v) => v.count), 1);
  }, [volumeTrend]);

  const barWidth = (count: number, entries: Array<{ count: number }>) =>
    `${(count / Math.max(...entries.map((item) => item.count), 1)) * 100}%`;

  const hasActiveFilters = selectedStatus !== null || selectedCategory !== null || selectedPriority !== null || period !== "all";

  const clearAllFilters = () => {
    setPeriod("all");
    setSelectedStatus(null);
    setSelectedCategory(null);
    setSelectedPriority(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Time Period Filter */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Operations Analytics</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Support Performance</h1>
          <p className="mt-1 text-sm text-muted-foreground">A live view of real case activity and operations workload.</p>
        </div>

        {/* Time Period Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card p-1">
          {(
            [
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "7d", label: "Last 7 Days" },
              { id: "30d", label: "Last 30 Days" },
              { id: "month", label: "This Month" },
            ] as const
          ).map((p) => (
            <Button
              key={p.id}
              type="button"
              variant={period === p.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setPeriod(p.id)}
              className="text-xs font-medium"
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
          <span className="font-semibold text-primary">Active Filters:</span>
          {period !== "all" && (
            <Badge variant="default">
              Period: {period === "today" ? "Today" : period === "7d" ? "Last 7 Days" : period === "30d" ? "Last 30 Days" : "This Month"}
              <button type="button" onClick={() => setPeriod("all")} className="ml-1.5 hover:text-destructive">✕</button>
            </Badge>
          )}
          {selectedStatus && (
            <Badge variant="default">
              Status: {formatCaseLabel(selectedStatus)}
              <button type="button" onClick={() => setSelectedStatus(null)} className="ml-1.5 hover:text-destructive">✕</button>
            </Badge>
          )}
          {selectedCategory && (
            <Badge variant="default">
              Category: {formatCategoryLabel(selectedCategory)}
              <button type="button" onClick={() => setSelectedCategory(null)} className="ml-1.5 hover:text-destructive">✕</button>
            </Badge>
          )}
          {selectedPriority && (
            <Badge variant="default">
              Priority: {formatCaseLabel(selectedPriority)}
              <button type="button" onClick={() => setSelectedPriority(null)} className="ml-1.5 hover:text-destructive">✕</button>
            </Badge>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Total Cases", totalCount, "Matching active criteria"],
          ["Open Cases", openCount, "Status: Open only"],
          ["In Progress", inProgressCount, "Active support workload"],
          ["Resolved", resolvedCount, "Resolved or closed cases"],
          ["High / Critical", priorityCount, "High & critical severity"],
        ].map(([label, value, detail]) => (
          <Card key={label as string}>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wide">{label}</CardDescription>
              <CardTitle className="text-3xl font-bold tabular-nums">{value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Case Volume Trend Chart (Real createdAt data) */}
      <Card>
        <CardHeader className="border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Case Volume Trend</CardTitle>
              <CardDescription>Daily case creation frequency based on actual database records.</CardDescription>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {volumeTrend.length} active day{volumeTrend.length === 1 ? "" : "s"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {volumeTrend.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No case creation events recorded for this timeframe.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex h-36 items-end gap-2 overflow-x-auto pb-2 pt-4">
                {volumeTrend.map((item, idx) => {
                  const heightPercent = Math.max((item.count / maxTrendCount) * 100, 10);
                  return (
                    <div key={idx} className="flex min-w-[2.5rem] flex-1 flex-col items-center gap-1.5">
                      <span className="text-[11px] font-bold tabular-nums text-foreground">{item.count}</span>
                      <div className="relative w-full rounded-t bg-muted/60 transition hover:bg-primary/80" style={{ height: `${heightPercent}%` }}>
                        <div className="h-full w-full rounded-t bg-primary" style={{ opacity: 0.85 }} />
                      </div>
                      <span className="truncate text-[10px] text-muted-foreground" title={item.dateLabel}>
                        {item.dateLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution Grids with Click-to-Filter Drill-Down */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Cases by Status */}
        <Card>
          <CardHeader className="border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cases by Status</CardTitle>
                <CardDescription>Click a status to drill down.</CardDescription>
              </div>
              {selectedStatus && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedStatus(null)} className="h-7 text-xs">
                  Reset
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            {statuses.length ? (
              statuses.map(({ status, count }) => {
                const isSelected = selectedStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(isSelected ? null : status)}
                    className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg p-2 text-left transition ${
                      isSelected ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-muted/40"
                    }`}
                  >
                    <Badge variant={statusVariant(status)}>{formatCaseLabel(status)}</Badge>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary/75" style={{ width: barWidth(count, statuses) }} />
                    </div>
                    <span className="w-6 text-right text-sm font-semibold tabular-nums">{count}</span>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No case data available for this filter.</p>
            )}
          </CardContent>
        </Card>

        {/* Cases by Category */}
        <Card>
          <CardHeader className="border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cases by Category</CardTitle>
                <CardDescription>Click a category to drill down.</CardDescription>
              </div>
              {selectedCategory && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedCategory(null)} className="h-7 text-xs">
                  Reset
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            {categories.length ? (
              categories.map(({ category, count }) => {
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(isSelected ? null : category)}
                    className={`grid w-full grid-cols-[minmax(7rem,10rem)_1fr_auto] items-center gap-3 rounded-lg p-2 text-left transition ${
                      isSelected ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-muted/40"
                    }`}
                  >
                    <span className="truncate text-sm font-medium" title={formatCategoryLabel(category)}>
                      {formatCategoryLabel(category)}
                    </span>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-blue-500/70" style={{ width: barWidth(count, categories) }} />
                    </div>
                    <span className="w-6 text-right text-sm font-semibold tabular-nums">{count}</span>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No case data available for this filter.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Priority Distribution & Queue Ownership */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Priority Distribution */}
        <Card>
          <CardHeader className="border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Priority Distribution</CardTitle>
                <CardDescription>Click a priority level to filter.</CardDescription>
              </div>
              {selectedPriority && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedPriority(null)} className="h-7 text-xs">
                  Reset
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 pt-5 sm:grid-cols-2">
            {priorities.length ? (
              priorities.map(({ priority, count }) => {
                const isSelected = selectedPriority === priority;
                return (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setSelectedPriority(isSelected ? null : priority)}
                    className={`rounded-lg border p-3 text-left transition ${
                      isSelected ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border/70 bg-muted/20 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant={priority === "high" || priority === "critical" ? "danger" : priority === "low" ? "muted" : "default"}>
                        {formatCaseLabel(priority)}
                      </Badge>
                      <span className="text-xl font-bold tabular-nums">{count}</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={priority === "high" || priority === "critical" ? "h-full bg-red-500/75" : "h-full bg-primary/75"}
                        style={{ width: barWidth(count, priorities) }}
                      />
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No priority data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Queue Ownership */}
        <Card>
          <CardHeader className="border-b border-border/60">
            <CardTitle>Queue Ownership</CardTitle>
            <CardDescription>Open cases grouped by current technician assignment.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-5 sm:grid-cols-2">
            {workloadEntries.length ? (
              workloadEntries.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-3">
                  <span className="min-w-0 truncate text-sm font-medium" title={name}>
                    {name}
                  </span>
                  <span className="rounded-md bg-background px-2 py-1 text-xs font-semibold tabular-nums text-muted-foreground">
                    {count} open
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No open cases currently assigned.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Drill-down Filtered Cases List */}
      <Card>
        <CardHeader className="border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Matching Cases ({filteredRequests.length})</CardTitle>
              <CardDescription>Direct breakdown of support requests matching current period and drill-down filters.</CardDescription>
            </div>
            {hasActiveFilters && (
              <Button type="button" variant="outline" size="sm" onClick={clearAllFilters} className="text-xs">
                Reset All Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {filteredRequests.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No cases found matching the selected filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="pb-3 pr-4 font-medium">Ref</th>
                    <th className="pb-3 pr-4 font-medium">Issue</th>
                    <th className="pb-3 pr-4 font-medium">Customer</th>
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 font-medium">Priority</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRequests.slice(0, 20).map((req) => (
                    <tr key={req.id} className="hover:bg-muted/10">
                      <td className="py-3 pr-4 font-mono text-xs font-semibold text-primary">
                        <Link href={`/requests/${req.id}`} className="hover:underline">
                          {getCaseReference(req.id)}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 font-medium max-w-[200px] truncate">
                        <Link href={`/requests/${req.id}`} className="hover:underline text-foreground">
                          {req.title}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground truncate max-w-[120px]">
                        {req.customerName || "Customer"}
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">
                        {formatCategoryLabel(req.category)}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={req.priority === "high" || req.priority === "critical" ? "danger" : req.priority === "low" ? "muted" : "default"}>
                          {formatCaseLabel(req.priority)}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusVariant(req.status)}>
                          {formatCaseLabel(req.status)}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap py-3 text-right text-xs text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRequests.length > 20 && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Showing top 20 of {filteredRequests.length} matching cases. Visit the Cases tab for full pagination and search.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
