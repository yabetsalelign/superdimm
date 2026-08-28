"use client";

import * as React from "react";

export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "danger" | "muted" | "accent" | "warning" }) {
  const base = "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold leading-4 whitespace-nowrap";
  const variants: Record<string, string> = {
    default: "border-border bg-muted/70 text-muted-foreground",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    danger: "border-red-200 bg-red-50 text-red-800",
    muted: "border-border bg-muted/40 text-muted-foreground",
    accent: "border-blue-200 bg-blue-50 text-blue-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  };
  return <span className={`${base} ${variants[variant || "default"]}`}>{children}</span>;
}
