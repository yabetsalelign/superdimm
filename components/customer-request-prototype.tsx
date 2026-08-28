"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerRequestPrototype() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("network");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFollowUp = /previous\s+issue|not\s+fixed|still\s+(not\s+)?working/i.test(title);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Unable to submit support ticket.");
      }

      const item = await response.json();
      const ref = `SR-${item.id.slice(-5).toUpperCase()}`;
      setReference(ref);
      
      // Clear fields
      setTitle("");
      setDescription("");
      setCategory("network");
      
      // Refresh the portal list page
      router.refresh();
    } catch (err: any) {
      setError(err.message || "A network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="font-semibold text-emerald-950 text-sm">
          Ticket Submitted Successfully
        </p>

        <p className="mt-2 text-xs leading-relaxed text-emerald-800">
          Your support reference number is{" "}
          <strong className="font-mono text-sm bg-emerald-100 px-1 py-0.5 rounded text-emerald-950">{reference}</strong>.
          Our operations team has queued the issue and will begin working on it shortly.
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 border-emerald-300 bg-white text-emerald-950 hover:bg-emerald-100"
          onClick={() => {
            setReference(null);
            setIsOpen(false);
          }}
        >
          Report another problem
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Report a Problem trigger */}
      {!isOpen && (
        <Button
          type="button"
          className="w-full sm:w-auto font-medium"
          onClick={() => setIsOpen(true)}
        >
          Report a problem
        </Button>
      )}

      {/* Report a Problem Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-border/60 pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Report a problem
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Tell us what is happening with your telecom service.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ml-4 text-sm font-semibold text-muted-foreground cursor-pointer transition-colors hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="portal-request-category">
                  What is this about?
                </Label>

                <select
                  id="portal-request-category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="network">Network / Internet connection</option>
                  <option value="billing">Billing & Invoices</option>
                  <option value="sim">SIM / Mobile service</option>
                  <option value="account">Account access & Login</option>
                  <option value="plan">Plan or package subscription</option>
                  <option value="other">Other issues</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="portal-request-title">
                  Subject
                </Label>

                <Input
                  id="portal-request-title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="For example, fiber internet disconnected"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="portal-request-details">
                  More details {isFollowUp ? <span className="text-destructive">(required for a follow-up)</span> : null}
                </Label>

                <textarea
                  id="portal-request-details"
                  name="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us what is happening and how we can help."
                  required={isFollowUp}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {error ? (
                <p className="text-xs text-destructive font-medium">{error}</p>
              ) : null}

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit ticket"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
