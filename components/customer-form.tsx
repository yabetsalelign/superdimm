"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const response = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, status }),
    });

    setPending(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data?.error ?? "Unable to create customer.");
      return;
    }

    setName("");
    setEmail("");
    setPhone("");
    setStatus("active");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="customer-name">Customer name</Label>
        <Input id="customer-name" value={name} onChange={(event) => setName(event.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="customer-email">Email</Label>
        <Input id="customer-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="customer-phone">Phone</Label>
        <Input id="customer-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="customer-status">Status</Label>
        <select
          id="customer-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating..." : "Create customer"}
      </Button>
    </form>
  );
}
