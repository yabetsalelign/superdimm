"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LandingActions() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await signOut({ redirect: false });
        window.location.replace("/");
      }}
    >
      Sign out
    </Button>
  );
}