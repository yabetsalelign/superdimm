import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/rbac";
import { AnalyticsDashboard, type AnalyticsRequest } from "@/components/analytics-dashboard";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  try {
    await requireStaff(["admin", "manager", "support"]);
  } catch (err) {
    const e = err as { code?: string };
    if (e?.code === "FORBIDDEN") redirect("/portal");
    redirect("/operations/login");
  }

  const rawRequests = await prisma.serviceRequest.findMany({
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      priority: true,
      createdAt: true,
      customer: { select: { name: true } },
      assignedUser: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const requests: AnalyticsRequest[] = rawRequests.map((req) => ({
    id: req.id,
    title: req.title,
    category: req.category,
    status: req.status,
    priority: req.priority,
    createdAt: req.createdAt.toISOString(),
    customerName: req.customer?.name ?? null,
    assignedUserName: req.assignedUser?.name ?? null,
  }));

  return <AnalyticsDashboard requests={requests} />;
}

