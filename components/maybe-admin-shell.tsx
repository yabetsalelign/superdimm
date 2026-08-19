"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";

export function MaybeAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Paths that should use the standalone auth layout (no AdminShell)
  const standalonePaths = ["/", "/signin", "/register", "/portal"];

  // If the current path is an auth route, render children directly
  if (standalonePaths.includes(pathname ?? "")) {
    return <>{children}</>;
  }

  // Otherwise use the AdminShell as before
  return <AdminShell>{children}</AdminShell>;
}
