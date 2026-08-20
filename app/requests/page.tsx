import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
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
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Customer service operations</p>
          <h1 className="text-3xl font-semibold">Customer Cases</h1>
          <p className="mt-1 text-sm text-muted-foreground">Triage complaints, assign work, and move customer issues toward resolution.</p>
        </div>
        <CollapsibleFormPanel label="Log a Case" maxWidth="lg">
          <RequestForm />
        </CollapsibleFormPanel>
      </div>

      <div className="whitespace-nowrap text-sm text-muted-foreground">Total: {requests.length}</div>

      <div>
        <RequestsTable requests={requests} />
      </div>
    </div>
  );
}
