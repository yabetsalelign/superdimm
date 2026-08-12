"use client";

import * as React from "react";
import type { Prisma } from "@prisma/client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type RequestWithIncludes = Prisma.ServiceRequestGetPayload<{ include: { customer: true; assignedUser: { select: { name: true } } } }>;

export function RequestsTable({ requests }: { requests: RequestWithIncludes[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (r.title ?? "").toLowerCase().includes(q) || (r.customer?.name ?? "").toLowerCase().includes(q);
    });
  }, [requests, query, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input placeholder="Search requests by title or customer" value={query} onChange={(e) => setQuery((e.target as HTMLInputElement).value)} />
        <div className="flex items-center gap-2">
          <select className="rounded-md border border-border bg-background px-2 py-1 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="pending">Pending</option>
          </select>
          <div className="text-sm text-muted-foreground">{filtered.length} / {requests.length}</div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                No service requests found.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((r) => (
              <TableRow key={r.id}>
              <TableCell className="font-medium">{r.customer?.name ?? "—"}</TableCell>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell>
                <Badge variant={r.status === "closed" ? "muted" : r.status === "open" ? "accent" : "warning"}>{r.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={r.priority === "high" ? "danger" : r.priority === "low" ? "muted" : "default"}>{r.priority}</Badge>
                </TableCell>
              <TableCell className="text-sm text-muted-foreground">{r.assignedUser?.name ?? "Unassigned"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{new Date(r.updatedAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
