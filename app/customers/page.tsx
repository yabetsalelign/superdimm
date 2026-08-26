import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/rbac";
import { CustomerForm } from "@/components/customer-form";
import { CustomersTable } from "@/components/customers-table";
import { CollapsibleFormPanel } from "@/components/collapsible-form-panel";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  try {
    await requireStaff(["admin", "manager", "support"]);
  } catch (err) {
    const e = err as { code?: string };
    if (e?.code === "FORBIDDEN") redirect("/portal");
    redirect("/operations/login");
  }

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Customer context</p>
          <h1 className="text-3xl font-semibold">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Find a customer and understand what is happening with their service.</p>
        </div>
        <CollapsibleFormPanel label="Create Customer">
          <CustomerForm />
        </CollapsibleFormPanel>
      </div>

      <div className="whitespace-nowrap text-sm text-muted-foreground">Total: {customers.length}</div>

      <div>
        {/* customers table (client-side search + table) */}
        <CustomersTable customers={customers} />
      </div>
    </div>
  );
}
