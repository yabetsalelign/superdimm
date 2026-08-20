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
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="font-medium text-emerald-900">
          Request submitted successfully
        </p>

        <p className="mt-1 text-sm text-emerald-800">
          Your reference number is{" "}
          <strong>{reference}</strong>. Our support team will review the
          problem and update its status.
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
          className="w-full sm:w-auto"
          onClick={() => setIsOpen(true)}
        >
          Report a problem
        </Button>
      )}

      {/* Report a Problem Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Report a problem
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Tell us what is happening with your telecom service.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ml-4 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-600"
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
                  defaultValue="network"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="network">Network / Internet</option>
                  <option value="billing">Billing</option>
                  <option value="sim">SIM / Mobile</option>
                  <option value="account">Account access</option>
                  <option value="plan">Plan or package</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="portal-request-title">
                  Subject
                </Label>

                <Input
                  id="portal-request-title"
                  name="title"
                  placeholder="For example, home internet disconnected"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="portal-request-details">
                  More details
                </Label>

                <textarea
                  id="portal-request-details"
                  name="description"
                  rows={4}
                  placeholder="Tell us what is happening and how we can help."
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>

                <Button type="submit">
                  Submit complaint
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}