"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RequestForm() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    async function loadCustomers() {
      const response = await fetch("/api/customers");
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setCustomers(data ?? []);
      if (data?.[0]?.id) setCustomerId(data[0].id);
    }

    loadCustomers();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, title, description, status, priority }),
    });

    setPending(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data?.error ?? "Unable to create service request.");
      return;
    }

    setTitle("");
    setDescription("");
    setStatus("open");
    setPriority("medium");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="request-customer">Customer</Label>
        <select
          id="request-customer"
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          {customers.length === 0 ? <option value="">No customers available</option> : customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.name}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="request-title">Title</Label>
        <Input id="request-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="request-description">Description</Label>
        <textarea
          id="request-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <Label htmlFor="request-status">Status</Label>
          <select
            id="request-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <Label htmlFor="request-priority">Priority</Label>
          <select
            id="request-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating..." : "Create request"}
      </Button>
    </form>
  );
}
