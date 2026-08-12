import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionsTable } from "@/components/transactions-table";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  try {
    await requireRole(["admin", "manager", "support", "user"]);
  } catch {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <p className="mt-2 text-muted-foreground">You do not have access to this section.</p>
      </div>
    );
  }

  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as { id?: string } | undefined)?.id;
  const currentRole = (session?.user as { role?: string } | undefined)?.role ?? "user";

  const transactions = await prisma.transaction.findMany({
    where:
      currentRole === "admin" || currentRole === "manager"
        ? {}
        : { userId: currentUserId ?? "" },
    include: {
      customer: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Financial operations</p>
          <h1 className="text-3xl font-semibold">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ledger view for operational transactions.</p>
        </div>
        <div className="text-sm text-muted-foreground">Total: {transactions.length}</div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <TransactionsTable transactions={transactions} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
