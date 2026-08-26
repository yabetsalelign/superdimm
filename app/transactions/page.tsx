import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/rbac";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionsTable } from "@/components/transactions-table";
import { CollapsibleFormPanel } from "@/components/collapsible-form-panel";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  try {
    await requireStaff(["admin", "manager", "support"]);
  } catch (err) {
    const e = err as { code?: string };
    if (e?.code === "FORBIDDEN") redirect("/portal");
    redirect("/signin");
  }

  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as { id?: string } | undefined)?.id;
  const currentRole = (session?.user as { role?: string } | undefined)?.role ?? "user";

  const transactions = await prisma.transaction.findMany({
    where: currentRole === "admin" || currentRole === "manager" ? {} : { userId: currentUserId ?? "" },
    include: {
      customer: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Financial operations</p>
          <h1 className="text-3xl font-semibold">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ledger view for operational transactions.</p>
        </div>
        <CollapsibleFormPanel label="Add Transaction">
          <TransactionForm />
        </CollapsibleFormPanel>
      </div>

      <div className="whitespace-nowrap text-sm text-muted-foreground">Total: {transactions.length}</div>

      <div>
        <TransactionsTable transactions={transactions} />
      </div>
    </div>
  );
}
