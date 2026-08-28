import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCaseLabel, formatCategoryLabel } from "@/lib/case-utils";

export const dynamic = "force-dynamic";
const statusOrder = ["open", "in_progress", "pending", "resolved", "closed", "escalated"];

function statusVariant(status: string) {
  if (status === "resolved" || status === "closed") return "success" as const;
  if (status === "open") return "accent" as const;
  if (status === "escalated") return "danger" as const;
  return "warning" as const;
}

export default async function AnalyticsPage() {
  try { await requireStaff(["admin", "manager", "support"]); } catch (err) { const e = err as { code?: string }; if (e?.code === "FORBIDDEN") redirect("/portal"); redirect("/operations/login"); }
  const requests = await prisma.serviceRequest.findMany({ select: { status: true, category: true, priority: true, assignedUser: { select: { name: true } } } });
  const statuses = statusOrder.map((status) => ({ status, count: requests.filter((request) => request.status === status).length })).filter((item) => item.count > 0);
  const categories = [...new Set(requests.map((request) => request.category))].map((category) => ({ category, count: requests.filter((request) => request.category === category).length })).sort((a, b) => b.count - a.count);
  const priorities = ["low", "medium", "high", "critical"].map((priority) => ({ priority, count: requests.filter((request) => request.priority === priority).length })).filter((item) => item.count > 0);
  const workload = new Map<string, number>();
  requests.filter((request) => !["resolved", "closed"].includes(request.status)).forEach((request) => { const name = request.assignedUser?.name ?? "Unassigned"; workload.set(name, (workload.get(name) ?? 0) + 1); });
  const workloadEntries = [...workload.entries()].sort((a, b) => b[1] - a[1]);
  const openCount = requests.filter((request) => request.status === "open").length;
  const inProgressCount = requests.filter((request) => request.status === "in_progress").length;
  const resolvedCount = requests.filter((request) => ["resolved", "closed"].includes(request.status)).length;
  const priorityCount = requests.filter((request) => ["high", "critical"].includes(request.priority)).length;
  const barWidth = (count: number, entries: Array<{ count: number }>) => `${(count / Math.max(...entries.map((item) => item.count), 1)) * 100}%`;

  return <div className="space-y-6">
    <div className="border-b border-border pb-6"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Operations Analytics</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Support Performance</h1><p className="mt-1 text-sm text-muted-foreground">A live view of the existing case queue and current ownership.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[["Total Cases", requests.length, "All recorded cases"], ["Open Cases", openCount, "Status: Open only"], ["In Progress", inProgressCount, "Actively being worked"], ["Resolved", resolvedCount, "Resolved or closed cases"], ["High / Critical", priorityCount, "All high or critical cases"]].map(([label, value, detail]) => <Card key={label as string}><CardHeader className="pb-2"><CardDescription className="text-xs font-semibold uppercase tracking-wide">{label}</CardDescription><CardTitle className="text-3xl font-bold tabular-nums">{value}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">{detail}</p></CardContent></Card>)}</div>
    <div className="grid gap-6 xl:grid-cols-2">
      <Card><CardHeader className="border-b border-border/60"><CardTitle>Cases by Status</CardTitle><CardDescription>Current distribution across the support lifecycle.</CardDescription></CardHeader><CardContent className="space-y-4 pt-5">{statuses.length ? statuses.map(({ status, count }) => <div key={status} className="grid grid-cols-[auto_1fr_auto] items-center gap-3"><Badge variant={statusVariant(status)}>{formatCaseLabel(status)}</Badge><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary/75" style={{ width: barWidth(count, statuses) }} /></div><span className="w-6 text-right text-sm font-semibold tabular-nums">{count}</span></div>) : <p className="text-sm text-muted-foreground">No case data is available yet.</p>}</CardContent></Card>
      <Card><CardHeader className="border-b border-border/60"><CardTitle>Cases by Category</CardTitle><CardDescription>Where the current workload is concentrated.</CardDescription></CardHeader><CardContent className="space-y-4 pt-5">{categories.length ? categories.map(({ category, count }) => <div key={category} className="grid grid-cols-[minmax(7rem,9rem)_1fr_auto] items-center gap-3"><span className="truncate text-sm font-medium" title={formatCategoryLabel(category)}>{formatCategoryLabel(category)}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-blue-500/70" style={{ width: barWidth(count, categories) }} /></div><span className="w-6 text-right text-sm font-semibold tabular-nums">{count}</span></div>) : <p className="text-sm text-muted-foreground">No case data is available yet.</p>}</CardContent></Card>
    </div>
    <Card><CardHeader className="border-b border-border/60"><CardTitle>Priority Distribution</CardTitle><CardDescription>All recorded cases, grouped by their current priority level.</CardDescription></CardHeader><CardContent className="grid gap-4 pt-5 sm:grid-cols-2 xl:grid-cols-4">{priorities.length ? priorities.map(({ priority, count }) => <div key={priority} className="rounded-lg border border-border/70 bg-muted/20 p-3"><div className="flex items-center justify-between gap-3"><Badge variant={priority === "high" || priority === "critical" ? "danger" : priority === "low" ? "muted" : "default"}>{formatCaseLabel(priority)}</Badge><span className="text-xl font-bold tabular-nums">{count}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className={priority === "high" || priority === "critical" ? "h-full bg-red-500/75" : "h-full bg-primary/75"} style={{ width: barWidth(count, priorities) }} /></div></div>) : <p className="text-sm text-muted-foreground">No priority data is available yet.</p>}</CardContent></Card>
    <Card><CardHeader className="border-b border-border/60"><CardTitle>Queue Ownership</CardTitle><CardDescription>Open cases grouped by their current assignee.</CardDescription></CardHeader><CardContent className="grid gap-3 pt-5 sm:grid-cols-2 xl:grid-cols-3">{workloadEntries.length ? workloadEntries.map(([name, count]) => <div key={name} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-3"><span className="min-w-0 truncate text-sm font-medium" title={name}>{name}</span><span className="rounded-md bg-background px-2 py-1 text-xs font-semibold tabular-nums text-muted-foreground">{count} open</span></div>) : <p className="text-sm text-muted-foreground">No open cases are currently assigned.</p>}</CardContent></Card>
  </div>;
}
