import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { DashboardWorkload } from "@/components/dashboard-workload";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let access: "admin" | "forbidden" | "unauthenticated" = "admin";
  try { await requireRole(["admin", "manager", "support"]); } catch { try { await requireUser(); access = "forbidden"; } catch { access = "unauthenticated"; } }
  if (access === "unauthenticated") return <main className="mx-auto max-w-5xl p-8"><section className="rounded-3xl border border-border bg-card p-8 shadow-sm"><p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">SuperDimm</p><h1 className="mt-4 text-4xl font-semibold tracking-tight">Customer service operations</h1><p className="mt-4 max-w-2xl text-base text-muted-foreground">Sign in to triage telecom customer cases, review account context, and move issues toward resolution.</p><div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link href="/signin">Sign in</Link></Button><Button asChild variant="outline"><Link href="/portal">Open customer portal</Link></Button></div></section></main>;
  // Authenticated customers (role=user) belong in the portal, not the internal CRM
  if (access === "forbidden") redirect("/portal");

  const requests = await prisma.serviceRequest.findMany({ take: 30, orderBy: { updatedAt: "desc" }, include: { customer: true } });
  const transactions = await prisma.transaction.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { customer: true } });
  const [customerCount, open, highPriority, unassigned, inProgress, escalated] = await Promise.all([
    prisma.customer.count(),
    prisma.serviceRequest.count({ where: { status: { notIn: ["closed", "resolved"] } } }),
    prisma.serviceRequest.count({ where: { priority: { in: ["high", "critical"] }, status: { notIn: ["closed", "resolved"] } } }),
    prisma.serviceRequest.count({ where: { assignedUserId: null, status: { notIn: ["closed", "resolved"] } } }),
    prisma.serviceRequest.count({ where: { status: "in_progress" } }),
    prisma.serviceRequest.count({ where: { status: "escalated" } }),
  ]);

  return <DashboardWorkload requests={requests} transactions={transactions} metrics={{ customerCount, open, highPriority, unassigned, inProgress, escalated }} />;
}
