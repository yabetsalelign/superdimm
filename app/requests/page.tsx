import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestForm } from "@/components/request-form";
import { RequestsTable } from "@/components/requests-table";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  try {
    await requireRole(["admin", "manager", "support"]);
  } catch {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Service Requests</h1>
        <p className="mt-2 text-muted-foreground">You do not have access to this section.</p>
      </div>
    );
  }

  const requests = await prisma.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      assignedUser: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Service request management</p>
          <h1 className="text-3xl font-semibold">Service Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monitor and triage incoming service requests.</p>
        </div>
        <div className="text-sm text-muted-foreground">Total: {requests.length}</div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <RequestsTable requests={requests} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create request</CardTitle>
          </CardHeader>
          <CardContent>
            <RequestForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
