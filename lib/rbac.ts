import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function getCustomerForSession(session: Awaited<ReturnType<typeof requireUser>>) {
  const userId = (session.user as { id?: string } | undefined)?.id;
  const email = session.user?.email?.toLowerCase();

  let customer = await prisma.customer.findFirst({
    where: {
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(email ? [{ email }] : []),
      ],
    },
    include: {
      serviceRequests: {
        orderBy: { createdAt: "desc" },
      },
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  // If this is a regular user and no customer profile was found, auto-link or create one
  if (!customer && userId && email) {
    customer = await prisma.customer.create({
      data: {
        name: session.user.name || "Subscriber Account",
        email,
        userId,
        plan: "Managed Enterprise Fiber (100M)",
        status: "active",
      },
      include: {
        serviceRequests: true,
        transactions: true,
      },
    });
  }

  return customer;
}

export async function verifyCustomerOwnership(
  customerId: string,
  session: Awaited<ReturnType<typeof requireUser>>
) {
  const role = (session.user as { role?: AppRole } | undefined)?.role ?? "user";

  // Internal staff has operational access across all customers
  if (role === "admin" || role === "manager" || role === "support") {
    return true;
  }

  const userCustomer = await getCustomerForSession(session);
  return userCustomer?.id === customerId;
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

/**
 * Returns true if the given role is an internal staff role.
 * Customers have role "user" and must not access internal CRM routes.
 */
export function isStaffRole(role: string | undefined | null): boolean {
  return role === "admin" || role === "manager" || role === "support";
}

/**
 * Requires an authenticated staff session (admin | manager | support).
 * - Throws { code: "UNAUTHENTICATED" } if no session exists.
 * - Throws { code: "FORBIDDEN" } if authenticated but not staff (i.e. a customer).
 * Call sites can catch and redirect appropriately.
 */
export async function requireStaff(roles: AppRole[] = ["admin", "manager", "support"]) {
  let session;
  try {
    session = await requireUser();
  } catch {
    throw { code: "UNAUTHENTICATED" };
  }
  const role = (session.user as { role?: AppRole } | undefined)?.role ?? "user";
  if (!roles.includes(role)) {
    throw { code: "FORBIDDEN" };
  }
  return session;
}
