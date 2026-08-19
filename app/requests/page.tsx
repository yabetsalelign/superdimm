import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestForm } from "@/components/request-form";
import { RequestsTable } from "@/components/requests-table";
import { CollapsibleFormPanel } from "@/components/collapsible-form-panel";

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Customer service operations</p>
          <h1 className="text-3xl font-semibold">Customer Cases</h1>
          <p className="mt-1 text-sm text-muted-foreground">Triage complaints, assign work, and move customer issues toward resolution.</p>
        </div>
        <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
          <div>Total: {requests.length}</div>
          <CollapsibleFormPanel label="Log a Case">
            <Card>
              <CardHeader><CardTitle>Log a case</CardTitle></CardHeader>
              <CardContent><RequestForm /></CardContent>
            </Card>
          </CollapsibleFormPanel>
        </div>
      </div>

      <div>
        <RequestsTable requests={requests} />
      </div>
    </div>
  );
}
