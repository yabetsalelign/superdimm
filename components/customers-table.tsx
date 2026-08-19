"use client";

import * as React from "react";
import type { Customer } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";
import Link from "next/link";

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => (c.name ?? "").toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q) || (c.phone ?? "").toLowerCase().includes(q));
  }, [customers, query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input placeholder="Search customers by name, email or phone" value={query} onChange={(e) => setQuery((e.target as HTMLInputElement).value)} />
        <div className="text-sm text-muted-foreground">{filtered.length} / {customers.length}</div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                No customers match your search.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium"><Link href={`/customers/${customer.id}`} className="text-primary hover:underline">{customer.name}</Link></TableCell>
                <TableCell>{customer.email ?? "—"}</TableCell>
                <TableCell>{customer.phone ?? "—"}</TableCell>
                <TableCell>
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs capitalize">{customer.status}</span>
                </TableCell>
                <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
