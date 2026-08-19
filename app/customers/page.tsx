import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerForm } from "@/components/customer-form";
import { CustomersTable } from "@/components/customers-table";
import { CollapsibleFormPanel } from "@/components/collapsible-form-panel";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  try {
    await requireRole(["admin", "manager", "support"]);
  } catch {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="mt-2 text-muted-foreground">You do not have access to this section.</p>
      </div>
    );
  }

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Customer context</p>
          <h1 className="text-3xl font-semibold">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Find a customer and understand what is happening with their service.</p>
        </div>
        <div className="text-sm text-muted-foreground">Total: {customers.length}</div>
      </div>

      <div className="flex justify-end">
        <CollapsibleFormPanel label="Create Customer">
          <Card>
            <CardHeader><CardTitle>Create customer</CardTitle></CardHeader>
            <CardContent><CustomerForm /></CardContent>
          </Card>
        </CollapsibleFormPanel>
      </div>

      <div>
        {/* customers table (client-side search + table) */}
        <CustomersTable customers={customers} />
      </div>
    </div>
  );
}
