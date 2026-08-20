"use client";

import * as React from "react";
import type { Customer } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import Link from "next/link";
import { formatCaseLabel } from "@/lib/case-utils";

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        (c.name ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        (c.plan ?? "").toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [customers, query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          className="min-w-0 flex-1"
          placeholder="Search subscribers by name, email, phone, plan, or account ID"
          value={query}
          onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
        />
        <div className="whitespace-nowrap text-xs text-muted-foreground">
          {filtered.length} / {customers.length} subscribers
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subscriber Name</TableHead>
            <TableHead>Service Plan</TableHead>
            <TableHead>Account Status</TableHead>
            <TableHead>Contact Email</TableHead>
            <TableHead>Contact Phone</TableHead>
            <TableHead>Account ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No customer accounts match your search.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <Link href={`/customers/${customer.id}`} className="font-semibold text-primary hover:underline">
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell className="text-xs font-medium text-foreground">
                  {customer.plan || "Standard Telecom Service"}
                </TableCell>
                <TableCell>
                  <Badge variant={customer.status === "active" ? "success" : "warning"}>
                    {formatCaseLabel(customer.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{customer.email ?? "—"}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{customer.phone ?? "—"}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{customer.id}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
