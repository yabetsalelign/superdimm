"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CollapsibleFormPanel({ label, maxWidth = "md", children }: { label: string; maxWidth?: "md" | "lg"; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button type="button" variant={isOpen ? "outline" : "default"} onClick={() => setIsOpen((value) => !value)}>
        {isOpen ? `- ${label}` : `+ ${label}`}
      </Button>
      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className={`w-full ${maxWidth === "lg" ? "max-w-lg" : "max-w-md"} rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl [&_input]:border-slate-300 [&_input]:bg-white [&_input]:text-slate-900 [&_select]:border-slate-300 [&_select]:bg-white [&_select]:text-slate-900 [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:text-slate-900`}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">{label}</h2>
              <Button type="button" variant="ghost" size="icon" aria-label={`Close ${label}`} onClick={() => setIsOpen(false)}>
                ×
              </Button>
            </div>
            {children}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}