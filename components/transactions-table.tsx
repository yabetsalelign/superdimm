"use client";

import * as React from "react";
import type { Prisma } from "@prisma/client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCaseLabel } from "@/lib/case-utils";

type TransactionWithIncludes = Prisma.TransactionGetPayload<{ include: { customer: true; user: { select: { name: true } } } }>;

function formatTransactionType(type: string) {
  const map: Record<string, string> = {
    subscription: "Subscription",
    payment: "Payment",
    adjustment: "Credit Adjustment",
    hardware: "Hardware / Setup",
    income: "Credit / Income",
    expense: "Charge / Expense",
  };
  return map[type.toLowerCase()] ?? formatCaseLabel(type);
}

export function TransactionsTable({ transactions }: { transactions: TransactionWithIncludes[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (t) =>
        (t.description ?? "").toLowerCase().includes(q) ||
        (t.customer?.name ?? "").toLowerCase().includes(q) ||
        (t.type ?? "").toLowerCase().includes(q)
    );
  }, [transactions, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          className="min-w-0 flex-1"
          placeholder="Search ledger by description, subscriber name, or billing type"
          value={query}
          onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
        />
        <div className="whitespace-nowrap text-xs text-muted-foreground">
          {filtered.length} / {transactions.length} entries
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subscriber Account</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Billing Type</TableHead>
            <TableHead>Record Date</TableHead>
            <TableHead>Processed by</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No billing transactions found.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((t) => {
              const isCredit = t.type === "payment" || t.type === "adjustment" || t.type === "income";
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">
                    {t.customer ? (
                      <Link href={`/customers/${t.customer.id}`} className="font-semibold text-primary hover:underline">
                        {t.customer.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-64 font-medium text-foreground"><span className="block truncate" title={t.description}>{t.description}</span></TableCell>
                  <TableCell className={`text-right font-semibold tabular-nums ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(t.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isCredit ? "success" : "default"}>
                      {formatTransactionType(t.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.user?.name ?? "—"}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
