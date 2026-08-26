"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";

export function MaybeAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if current path is a standalone page (landing, auth, or customer portal)
  const isStandalone =
    pathname === "/" ||
    pathname === "/signin" ||
    pathname === "/register" ||
    pathname?.startsWith("/portal");

  // If the current path is standalone, render children directly
  if (isStandalone) {
    return <>{children}</>;
  }

  // Otherwise use the AdminShell as before
  return <AdminShell>{children}</AdminShell>;
}

