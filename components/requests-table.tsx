"use client";

import * as React from "react";
import type { Prisma } from "@prisma/client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  caseCategories,
  casePriorities,
  caseStatuses,
  formatCaseLabel,
  formatCategoryLabel,
  getCaseReference,
} from "@/lib/case-utils";

type RequestWithIncludes = Prisma.ServiceRequestGetPayload<{ include: { customer: true; assignedUser: { select: { name: true } } } }>;

function getStatusBadgeVariant(status: string) {
  if (status === "closed" || status === "resolved") return "success" as const;
  if (status === "open") return "accent" as const;
  if (status === "escalated") return "danger" as const;
  return "warning" as const;
}

function getPriorityBadgeVariant(priority: string) {
  if (priority === "critical" || priority === "high") return "danger" as const;
  if (priority === "low") return "muted" as const;
  return "default" as const;
}

export function RequestsTable({ requests }: { requests: RequestWithIncludes[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
      if (categoryFilter !== "all" && (r.category ?? "network") !== categoryFilter) return false;
      if (!q) return true;
      return (
        (r.title ?? "").toLowerCase().includes(q) ||
        (r.customer?.name ?? "").toLowerCase().includes(q) ||
        getCaseReference(r.id).toLowerCase().includes(q)
      );
    });
  }, [requests, query, statusFilter, priorityFilter, categoryFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          className="min-w-0 flex-1"
          placeholder="Search cases by subject, customer, or reference (e.g. SR-...)"
          value={query}
          onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-10 rounded-lg border border-border bg-input px-2.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-slate-50/80 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/50"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {caseCategories.map((cat) => (
              <option key={cat} value={cat}>
                {formatCategoryLabel(cat)}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-lg border border-border bg-input px-2.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-slate-50/80 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {caseStatuses.map((st) => (
              <option key={st} value={st}>
                {formatCaseLabel(st)}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-lg border border-border bg-input px-2.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-slate-50/80 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/50"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            {casePriorities.map((pr) => (
              <option key={pr} value={pr}>
                {formatCaseLabel(pr)}
              </option>
            ))}
          </select>

          <div className="whitespace-nowrap text-xs text-muted-foreground pl-1">
            {filtered.length} / {requests.length} cases
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Case Ref</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Problem Subject</TableHead>
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
              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                No customer cases match the selected search or filters.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="max-w-28">
                  <Link href={`/requests/${r.id}`} className="block truncate font-mono text-xs font-bold text-primary hover:underline" title={getCaseReference(r.id)}>
                    {getCaseReference(r.id)}
                  </Link>
                </TableCell>
                <TableCell className="max-w-36 font-medium">
                  <Link href={`/customers/${r.customer.id}`} className="block truncate hover:underline" title={r.customer?.name ?? undefined}>
                    {r.customer?.name ?? "—"}
                  </Link>
                </TableCell>
                <TableCell className="max-w-52 font-medium text-foreground">
                  <Link href={`/requests/${r.id}`} className="block truncate hover:underline" title={r.title}>
                    {r.title}
                  </Link>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatCategoryLabel(r.category)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(r.status)}>
                    {formatCaseLabel(r.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityBadgeVariant(r.priority)}>
                    {formatCaseLabel(r.priority)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-28 text-xs text-muted-foreground"><span className="block truncate" title={r.assignedUser?.name ?? "Unassigned"}>{r.assignedUser?.name ?? "Unassigned"}</span></TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(r.updatedAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
