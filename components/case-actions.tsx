"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { casePriorities, caseStatuses, formatCaseLabel } from "@/lib/case-utils";

type CaseActionsProps = {
  requestId: string;
  status: string;
  priority: string;
  assignedUserId: string | null;
  users: Array<{ id: string; name: string | null; email: string }>;
};

export function CaseActions({ requestId, status, priority, assignedUserId, users }: CaseActionsProps) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(status);
  const [nextPriority, setNextPriority] = useState(priority);
  const [nextAssignee, setNextAssignee] = useState(assignedUserId ?? "");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function saveChanges() {
    setPending(true);
    setMessage("");
    const response = await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, priority: nextPriority, assignedUserId: nextAssignee || null }),
    });
    setPending(false);
    if (!response.ok) {
      setMessage("The case could not be updated.");
      return;
    }
    setMessage("Case updated.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="case-status">Status</Label>
          <select id="case-status" value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="rounded-md border border-border bg-input px-3 py-2 text-sm">
            {caseStatuses.map((item) => <option key={item} value={item}>{formatCaseLabel(item)}</option>)}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="case-priority">Priority</Label>
          <select id="case-priority" value={nextPriority} onChange={(event) => setNextPriority(event.target.value)} className="rounded-md border border-border bg-input px-3 py-2 text-sm">
            {casePriorities.map((item) => <option key={item} value={item}>{formatCaseLabel(item)}</option>)}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="case-assignee">Assigned agent</Label>
          <select id="case-assignee" value={nextAssignee} onChange={(event) => setNextAssignee(event.target.value)} className="rounded-md border border-border bg-input px-3 py-2 text-sm">
            <option value="">Unassigned</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.name ?? user.email}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" onClick={saveChanges} disabled={pending}>{pending ? "Saving..." : "Save case changes"}</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </div>
  );
}