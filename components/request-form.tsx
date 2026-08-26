"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  caseCategories,
  casePriorities,
  caseStatuses,
  formatCaseLabel,
  formatCategoryLabel,
} from "@/lib/case-utils";

type RequestFormProps = {
  initialCustomerId?: string;
  onSuccess?: () => void;
};

export function RequestForm({ initialCustomerId, onSuccess }: RequestFormProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [customerId, setCustomerId] = useState(initialCustomerId ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("network");
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (initialCustomerId) {
      setCustomerId(initialCustomerId);
      return;
    }

    async function loadCustomers() {
      const response = await fetch("/api/customers");
      if (!response.ok) return;
      const data = await response.json();
      setCustomers(data ?? []);
      if (data?.[0]?.id) setCustomerId(data[0].id);
    }

    loadCustomers();
  }, [initialCustomerId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        title,
        description,
        category,
        status,
        priority,
      }),
    });

    setPending(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data?.error ?? "Unable to log case.");
      return;
    }

    setTitle("");
    setDescription("");
    setCategory("network");
    setStatus("open");
    setPriority("medium");
    if (onSuccess) {
      onSuccess();
    }
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {!initialCustomerId ? (
        <div className="grid gap-1.5">
          <Label htmlFor="request-customer" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Customer Account
          </Label>
          <select
            id="request-customer"
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm cursor-pointer hover:bg-slate-50/80 transition-colors"
            required
          >
            {customers.length === 0 ? (
              <option value="">Loading customers...</option>
            ) : (
              customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))
            )}
          </select>
        </div>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="request-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Subject / Problem Title
        </Label>
        <Input
          id="request-title"
          placeholder="e.g. Fiber latency spike on gateway"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="request-category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Category
        </Label>
        <select
          id="request-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm cursor-pointer hover:bg-slate-50/80 transition-colors"
        >
          {caseCategories.map((cat) => (
            <option key={cat} value={cat}>
              {formatCategoryLabel(cat)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="request-description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Detailed Description
        </Label>
        <textarea
          id="request-description"
          placeholder="Describe symptoms, affected services, error codes, and customer remarks..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="request-priority" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Initial Priority
          </Label>
          <select
            id="request-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            {casePriorities.map((item) => (
              <option key={item} value={item}>
                {formatCaseLabel(item)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="request-status" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Initial Status
          </Label>
          <select
            id="request-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            {caseStatuses.map((item) => (
              <option key={item} value={item}>
                {formatCaseLabel(item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}

      <Button type="submit" disabled={pending} className="w-full font-medium">
        {pending ? "Logging Case..." : "Submit & Log Case"}
      </Button>
    </form>
  );
}
