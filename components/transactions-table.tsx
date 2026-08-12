"use client";

import * as React from "react";
import type { Prisma } from "@prisma/client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type TransactionWithIncludes = Prisma.TransactionGetPayload<{ include: { customer: true; user: { select: { name: true } } } }>;

export function TransactionsTable({ transactions }: { transactions: TransactionWithIncludes[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((t) => (t.description ?? "").toLowerCase().includes(q) || (t.customer?.name ?? "").toLowerCase().includes(q));
  }, [transactions, query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input placeholder="Search by description or customer" value={query} onChange={(e) => setQuery((e.target as HTMLInputElement).value)} />
        <div className="text-sm text-muted-foreground">{filtered.length} / {transactions.length}</div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Created by</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.customer?.name ?? "—"}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell className={t.type === "income" ? "text-emerald-600" : "text-red-600"}>
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(t.amount)}
                </TableCell>
                <TableCell><Badge variant={t.type === "income" ? "success" : "danger"}>{t.type}</Badge></TableCell>
                <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{t.user?.name ?? "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
