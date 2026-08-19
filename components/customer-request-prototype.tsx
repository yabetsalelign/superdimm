"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerRequestPrototype() {
  const [isOpen, setIsOpen] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReference("SR-10482");
  }

  if (reference) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="font-medium text-emerald-900">Request submitted successfully</p>
        <p className="mt-1 text-sm text-emerald-800">
          Your reference number is <strong>{reference}</strong>. A support agent would now review and assign this case.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-100"
          onClick={() => {
            setReference(null);
            setIsOpen(false);
          }}
        >
          Submit another request
        </Button>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <Button type="button" className="w-full sm:w-auto" onClick={() => setIsOpen(true)}>
        Submit Service Request
      </Button>
    );
  }

  return (
    <form className="space-y-4 rounded-lg border border-border bg-muted/30 p-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="portal-request-category">What is this about?</Label>
        <select id="portal-request-category" name="category" className="rounded-md border border-border bg-input px-3 py-2 text-sm" defaultValue="network">
          <option value="network">Network / Internet</option><option value="billing">Billing</option><option value="sim">SIM / Mobile</option><option value="account">Account access</option><option value="plan">Plan or package</option><option value="other">Other</option>
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="portal-request-title">Subject</Label>
        <Input id="portal-request-title" name="title" placeholder="For example, home internet disconnected" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="portal-request-details">More details</Label>
        <textarea
          id="portal-request-details"
          name="description"
          rows={4}
          placeholder="Tell us what is happening and how we can help."
          className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Send request</Button>
        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Prototype only. This form demonstrates the workflow but does not save to the database.</p>
    </form>
  );
}