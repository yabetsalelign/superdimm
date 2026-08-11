import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export type AppRole = "admin" | "manager" | "support" | "user";

export async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireRole(roles: AppRole[]) {
  const session = await requireUser();
  const currentRole = (session.user as { role?: AppRole } | undefined)?.role ?? "user";

  if (!roles.includes(currentRole)) {
    throw new Error("Forbidden");
  }

  return session;
}

export async function checkOwnership(resourceUserId: string | null | undefined) {
  const session = await requireUser();
  const currentUserId = (session.user as { id?: string } | undefined)?.id;
  const currentRole = (session.user as { role?: AppRole } | undefined)?.role ?? "user";

  if (currentRole === "admin" || currentRole === "manager") {
    return true;
  }

  return !!resourceUserId && currentUserId === resourceUserId;
}
