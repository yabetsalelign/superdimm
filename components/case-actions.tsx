"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  caseCategories,
  casePriorities,
  caseStatuses,
  formatCaseLabel,
  formatCategoryLabel,
} from "@/lib/case-utils";

type CaseActionsProps = {
  requestId: string;
  status: string;
  priority: string;
  category?: string;
  assignedUserId: string | null;
  users: Array<{ id: string; name: string | null; email: string }>;
};

export function CaseActions({
  requestId,
  status,
  priority,
  category = "network",
  assignedUserId,
  users,
}: CaseActionsProps) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(status);
  const [nextPriority, setNextPriority] = useState(priority);
  const [nextCategory, setNextCategory] = useState(category);
  const [nextAssignee, setNextAssignee] = useState(assignedUserId ?? "");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function executeUpdate(customStatus?: string) {
    setPending(true);
    setMessage(null);
    const targetStatus = customStatus ?? nextStatus;

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          priority: nextPriority,
          category: nextCategory,
          assignedUserId: nextAssignee || null,
        }),
      });

      setPending(false);

      if (!response.ok) {
        setMessage({ type: "error", text: "The case could not be updated." });
        return;
      }

      if (customStatus) {
        setNextStatus(customStatus);
      }
      setMessage({ type: "success", text: "Case updated successfully." });
      router.refresh();
    } catch {
      setPending(false);
      setMessage({ type: "error", text: "Network error occurred." });
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="grid gap-1.5">
          <Label htmlFor="case-status" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Lifecycle Status
          </Label>
          <select
            id="case-status"
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            {caseStatuses.map((item) => (
              <option key={item} value={item}>
                {formatCaseLabel(item)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="case-priority" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Priority Level
          </Label>
          <select
            id="case-priority"
            value={nextPriority}
            onChange={(e) => setNextPriority(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            {casePriorities.map((item) => (
              <option key={item} value={item}>
                {formatCaseLabel(item)} Priority
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="case-category" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Case Category
          </Label>
          <select
            id="case-category"
            value={nextCategory}
            onChange={(e) => setNextCategory(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            {caseCategories.map((cat) => (
              <option key={cat} value={cat}>
                {formatCategoryLabel(cat)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="case-assignee" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Assigned Agent
          </Label>
          <select
            id="case-assignee"
            value={nextAssignee}
            onChange={(e) => setNextAssignee(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            <option value="">— Unassigned (Queue) —</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name ?? user.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-1 space-y-2">
        <Button
          type="button"
          className="w-full font-medium"
          onClick={() => executeUpdate()}
          disabled={pending}
        >
          {pending ? "Saving..." : "Save Case Changes"}
        </Button>

        {nextStatus !== "resolved" && nextStatus !== "closed" ? (
          <Button
            type="button"
            variant="outline"
            className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            onClick={() => executeUpdate("resolved")}
            disabled={pending}
          >
            ✓ Mark as Resolved
          </Button>
        ) : null}
      </div>

      {message ? (
        <div
          className={`rounded-lg px-3 py-2 text-xs font-medium ${
            message.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      ) : null}
    </div>
  );
}