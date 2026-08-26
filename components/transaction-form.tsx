"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TransactionFormProps = {
  initialCustomerId?: string;
  onSuccess?: () => void;
};

export function TransactionForm({ initialCustomerId, onSuccess }: TransactionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [customerId, setCustomerId] = useState(initialCustomerId ?? "");
  const [amount, setAmount] = useState<number | string>("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("subscription");
  const [error, setError] = useState<string | null>(null);

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

    const numericAmount = Number(amount);
    if (!description.trim()) {
      setError("Please add a description.");
      return;
    }

    if (!amount || Number.isNaN(numericAmount)) {
      setError("Please enter a valid amount.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: customerId || null,
          description,
          amount: numericAmount,
          type,
        }),
      });

      if (!response.ok) {
        const body = await response.json();
        setError(body?.error ?? "Failed to record transaction.");
        return;
      }

      setDescription("");
      setAmount("");
      setType("subscription");
      if (onSuccess) {
        onSuccess();
      }
      router.refresh();
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {!initialCustomerId ? (
        <div className="grid gap-1.5">
          <Label htmlFor="txn-customer" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Subscriber Account
          </Label>
          <select
            id="txn-customer"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            {customers.length === 0 ? (
              <option value="">Loading accounts...</option>
            ) : (
              customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))
            )}
          </select>
        </div>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Description / Charge Item
        </Label>
        <Input
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="e.g. Monthly Managed Fiber Package"
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Amount (USD)
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="1250.00"
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="type" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Billing Type
          </Label>
          <select
            id="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm cursor-pointer hover:bg-slate-50/80 transition-colors"
          >
            <option value="subscription">Monthly Subscription</option>
            <option value="payment">Account Payment</option>
            <option value="adjustment">Credit Adjustment / Waiver</option>
            <option value="hardware">Hardware / Installation</option>
          </select>
        </div>
      </div>

      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}

      <Button type="submit" disabled={isPending} className="w-full font-medium">
        {isPending ? "Recording..." : "Record Billing Entry"}
      </Button>
    </form>
  );
}
