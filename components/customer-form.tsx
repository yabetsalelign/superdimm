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
  const [plan, setPlan] = useState("Managed Enterprise Fiber (100M)");
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
      body: JSON.stringify({ name, email, phone, plan, status }),
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
    setPlan("Managed Enterprise Fiber (100M)");
    setStatus("active");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-1.5">
        <Label htmlFor="customer-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Subscriber / Organization Name
        </Label>
        <Input
          id="customer-name"
          placeholder="e.g. Acme Logistics"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="customer-plan" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Telecom Service Plan
        </Label>
        <Input
          id="customer-plan"
          placeholder="e.g. Managed Enterprise Fiber (100M)"
          value={plan}
          onChange={(event) => setPlan(event.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="customer-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contact Email
          </Label>
          <Input
            id="customer-email"
            type="email"
            placeholder="ops@acme.logistics"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="customer-phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contact Phone
          </Label>
          <Input
            id="customer-phone"
            placeholder="+1 555 0101"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="customer-status" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Account Status
        </Label>
        <select
          id="customer-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm cursor-pointer hover:bg-slate-50/80 transition-colors"
        >
          <option value="active">Active</option>
          <option value="pending">Pending Activation</option>
          <option value="inactive">Suspended / Inactive</option>
        </select>
      </div>

      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}

      <Button type="submit" disabled={pending} className="w-full font-medium">
        {pending ? "Creating Customer..." : "Create Customer Account"}
      </Button>
    </form>
  );
}
