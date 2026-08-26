import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/rbac";
import { DashboardWorkload } from "@/components/dashboard-workload";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    await requireStaff(["admin", "manager", "support"]);
  } catch (err) {
    const e = err as { code?: string };
    if (e?.code === "FORBIDDEN") {
      redirect("/portal");
    }
    redirect("/signin");
  }

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
