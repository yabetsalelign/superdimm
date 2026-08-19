import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseActions } from "@/components/case-actions";
import { formatCaseLabel, getCaseCategory, getCaseReference, getSuggestedTeam } from "@/lib/case-utils";

export const dynamic = "force-dynamic";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "manager", "support"]);
  } catch {
    return <div className="rounded-xl border border-border bg-card p-6"><h1 className="text-2xl font-semibold">Case detail</h1><p className="mt-2 text-muted-foreground">You do not have access to this section.</p></div>;
  }

  const { id } = await params;
  const [request, users] = await Promise.all([
    prisma.serviceRequest.findUnique({ where: { id }, include: { customer: true, assignedUser: { select: { id: true, name: true, email: true } } } }),
    prisma.user.findMany({ where: { role: { in: ["admin", "manager", "support"] } }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);

  if (!request) notFound();

  const category = getCaseCategory(request.title, request.description);
  const reference = getCaseReference(request.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="link" className="h-auto px-0 text-muted-foreground"><Link href="/requests">Back to cases</Link></Button>
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-muted-foreground">{reference}</p>
          <h1 className="mt-1 text-3xl font-semibold">{request.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Created {new Date(request.createdAt).toLocaleDateString()}</p>
        </div>
        <Badge variant={request.status === "closed" || request.status === "resolved" ? "success" : request.priority === "critical" || request.priority === "high" ? "danger" : "warning"}>{formatCaseLabel(request.status)}</Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Issue</CardTitle><CardDescription>What the customer needs help with.</CardDescription></CardHeader><CardContent><p className="whitespace-pre-wrap text-sm leading-6">{request.description || "No additional description was provided."}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Case workflow</CardTitle><CardDescription>Update the work item as support progresses.</CardDescription></CardHeader><CardContent><CaseActions requestId={request.id} status={request.status} priority={request.priority} assignedUserId={request.assignedUserId} users={users} /></CardContent></Card>
          <Card><CardHeader><CardTitle>Activity</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex gap-3 text-sm"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" /><div><p className="font-medium">Case created</p><p className="text-muted-foreground">{new Date(request.createdAt).toLocaleString()}</p></div></div><div className="flex gap-3 text-sm"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-muted-foreground" /><div><p className="font-medium">Last updated</p><p className="text-muted-foreground">{new Date(request.updatedAt).toLocaleString()}</p></div></div></CardContent></Card>
        </div>
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Customer</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><p className="font-medium">{request.customer.name}</p><p className="text-muted-foreground">{request.customer.email ?? "No email"}</p></div><p className="text-muted-foreground">{request.customer.phone ?? "No phone number"}</p><p><span className="text-muted-foreground">Account status: </span><span className="font-medium capitalize">{request.customer.status}</span></p><Link className="text-primary hover:underline" href={`/customers/${request.customer.id}`}>View customer history</Link></CardContent></Card>
          <Card><CardHeader><CardTitle>Case context</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p><span className="text-muted-foreground">Category: </span><span className="font-medium">{category}</span></p><p><span className="text-muted-foreground">Priority: </span><span className="font-medium capitalize">{request.priority}</span></p><p><span className="text-muted-foreground">Assigned to: </span><span className="font-medium">{request.assignedUser?.name ?? "Unassigned"}</span></p><p><span className="text-muted-foreground">Customer reference: </span><span className="font-medium">{request.customer.id}</span></p></CardContent></Card>
                  <Card><CardHeader><CardTitle>Case context</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p><span className="text-muted-foreground">Category: </span><span className="font-medium">{category}</span></p><p><span className="text-muted-foreground">Suggested queue: </span><span className="font-medium">{getSuggestedTeam(category)}</span></p><p><span className="text-muted-foreground">Priority: </span><span className="font-medium capitalize">{request.priority}</span></p><p><span className="text-muted-foreground">Assigned to: </span><span className="font-medium">{request.assignedUser?.name ?? "Unassigned"}</span></p><p><span className="text-muted-foreground">Customer reference: </span><span className="font-medium">{request.customer.id}</span></p></CardContent></Card>
        </div>
      </div>
    </div>
  );
}