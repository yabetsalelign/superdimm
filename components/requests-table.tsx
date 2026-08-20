"use client";

import * as React from "react";
import type { Prisma } from "@prisma/client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCaseLabel, getCaseCategory, getCaseReference } from "@/lib/case-utils";

type RequestWithIncludes = Prisma.ServiceRequestGetPayload<{ include: { customer: true; assignedUser: { select: { name: true } } } }>;

export function RequestsTable({ requests }: { requests: RequestWithIncludes[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
      if (!q) return true;
      return (r.title ?? "").toLowerCase().includes(q) || (r.customer?.name ?? "").toLowerCase().includes(q);
    });
  }, [requests, query, statusFilter, priorityFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input className="min-w-0 flex-1" placeholder="Search cases by issue or customer" value={query} onChange={(e) => setQuery((e.target as HTMLInputElement).value)} />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <select className="rounded-md border border-border bg-background px-2 py-1 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="open">Open</option><option value="assigned">Assigned</option><option value="in_progress">In progress</option><option value="pending_customer">Pending customer</option><option value="escalated">Escalated</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
          </select>
          <select className="rounded-md border border-border bg-background px-2 py-1 text-sm" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">All priorities</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </select>
          <div className="whitespace-nowrap text-sm text-muted-foreground">{filtered.length} / {requests.length}</div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Case</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Issue</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-muted-foreground">
                No customer cases found.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell><Link href={`/requests/${r.id}`} className="font-medium text-primary hover:underline">{getCaseReference(r.id)}</Link></TableCell>
                <TableCell className="font-medium">{r.customer?.name ?? "—"}</TableCell>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{getCaseCategory(r.title, r.description)}</TableCell>
                <TableCell>
                <Badge variant={r.status === "closed" || r.status === "resolved" ? "success" : r.status === "open" ? "accent" : "warning"}>{formatCaseLabel(r.status)}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={r.priority === "critical" || r.priority === "high" ? "danger" : r.priority === "low" ? "muted" : "default"}>{formatCaseLabel(r.priority)}</Badge>
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
