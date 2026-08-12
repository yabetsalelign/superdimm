"use client";

import * as React from "react";

export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "danger" | "muted" | "accent" | "warning" }) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
  const variants: Record<string, string> = {
    default: "bg-muted/50 text-muted-foreground border border-border",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-100",
    danger: "bg-red-50 text-red-800 border border-red-100",
    muted: "bg-muted/20 text-muted-foreground border border-border",
    accent: "bg-primary/10 text-primary px-2 py-0.5 border border-primary/20",
    warning: "bg-amber-50 text-amber-800 border border-amber-100",
  };
  return <span className={`${base} ${variants[variant || "default"]}`}>{children}</span>;
}
