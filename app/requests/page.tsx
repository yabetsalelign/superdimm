import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/rbac";
import { RequestForm } from "@/components/request-form";
import { RequestsTable } from "@/components/requests-table";
import { CollapsibleFormPanel } from "@/components/collapsible-form-panel";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  try {
    await requireStaff(["admin", "manager", "support"]);
  } catch (err) {
    const e = err as { code?: string };
    if (e?.code === "FORBIDDEN") redirect("/portal");
    redirect("/operations/login");
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
