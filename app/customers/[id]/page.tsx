import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCaseLabel, getCaseCategory, getCaseReference } from "@/lib/case-utils";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try { await requireRole(["admin", "manager", "support"]); } catch { return <div className="rounded-xl border border-border bg-card p-6"><h1 className="text-2xl font-semibold">Customer detail</h1><p className="mt-2 text-muted-foreground">You do not have access to this section.</p></div>; }
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id }, include: { serviceRequests: { orderBy: { updatedAt: "desc" }, include: { assignedUser: { select: { name: true } } } }, transactions: { orderBy: { createdAt: "desc" }, take: 5 } } });
  if (!customer) notFound();
  const openCases = customer.serviceRequests.filter((request) => !["closed", "resolved"].includes(request.status));

  return (
    <div className="space-y-6">
      <div><Button asChild variant="link" className="h-auto px-0 text-muted-foreground"><Link href="/customers">Back to customers</Link></Button><p className="mt-3 text-sm uppercase tracking-[0.2em] text-muted-foreground">Customer profile</p><h1 className="mt-1 text-3xl font-semibold">{customer.name}</h1><p className="mt-1 text-sm text-muted-foreground">{customer.email ?? "No email"} · {customer.phone ?? "No phone"}</p></div>
      <div className="grid gap-4 md:grid-cols-3"><Card><CardHeader><CardDescription>Account status</CardDescription><CardTitle className="capitalize">{customer.status}</CardTitle></CardHeader><CardContent><Badge variant={customer.status === "active" ? "success" : "warning"}>{customer.status}</Badge></CardContent></Card><Card><CardHeader><CardDescription>Open cases</CardDescription><CardTitle className="text-3xl">{openCases.length}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Issues needing attention</p></CardContent></Card><Card><CardHeader><CardDescription>Customer ID</CardDescription><CardTitle className="text-lg">{customer.id}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Account reference</p></CardContent></Card></div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card><CardHeader><CardTitle>Case history</CardTitle><CardDescription>What is happening with this customer.</CardDescription></CardHeader><CardContent className="space-y-3">{customer.serviceRequests.length === 0 ? <p className="text-sm text-muted-foreground">No cases recorded.</p> : customer.serviceRequests.map((request) => <Link key={request.id} href={`/requests/${request.id}`} className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 hover:bg-muted/50"><div className="min-w-0"><p className="font-medium">{request.title}</p><p className="mt-1 text-xs text-muted-foreground">{getCaseReference(request.id)} · {getCaseCategory(request.title, request.description)} · {request.assignedUser?.name ?? "Unassigned"}</p></div><Badge variant={request.status === "closed" || request.status === "resolved" ? "success" : request.priority === "high" || request.priority === "critical" ? "danger" : "warning"}>{formatCaseLabel(request.status)}</Badge></Link>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Billing context</CardTitle><CardDescription>Recent transactions relevant to support conversations.</CardDescription></CardHeader><CardContent className="space-y-3">{customer.transactions.length === 0 ? <p className="text-sm text-muted-foreground">No transactions recorded.</p> : customer.transactions.map((transaction) => <div key={transaction.id} className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0"><div><p className="font-medium">{transaction.description}</p><p className="text-xs text-muted-foreground">{new Date(transaction.createdAt).toLocaleDateString()}</p></div><p className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(transaction.amount)}</p></div>)}</CardContent></Card>
      </div>
    </div>
  );
}