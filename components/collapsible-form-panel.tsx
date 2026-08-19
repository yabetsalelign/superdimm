"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CollapsibleFormPanel({ label, children }: { label: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex w-full flex-col items-end gap-3 sm:w-auto">
      <Button type="button" variant={isOpen ? "outline" : "default"} onClick={() => setIsOpen((value) => !value)}>
        {isOpen ? `- ${label}` : `+ ${label}`}
      </Button>
      {isOpen ? (
        <div className="w-full min-w-0 sm:min-w-[22rem]">
          {children}
          <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </div>
      ) : null}
    </div>
  );
}