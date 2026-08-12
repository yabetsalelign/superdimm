import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerForm } from "@/components/customer-form";
import { CustomersTable } from "@/components/customers-table";

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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Customer management</p>
          <h1 className="text-3xl font-semibold">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage customer records, contact details, and status.</p>
        </div>
        <div className="text-sm text-muted-foreground">Total: {customers.length}</div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          {/* customers table (client-side search + table) */}
          <CustomersTable customers={customers} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create customer</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
