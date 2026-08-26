"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";

export function MaybeAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if current path is a standalone page (landing, auth, customer portal, or operations login)
  const isStandalone =
    pathname === "/" ||
    pathname === "/signin" ||
    pathname === "/register" ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/operations");

  // If the current path is standalone, render children directly
  if (isStandalone) {
    return <>{children}</>;
  }

  // Otherwise use the AdminShell as before
  return <AdminShell>{children}</AdminShell>;
}

