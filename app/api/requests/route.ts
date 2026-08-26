import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { caseCategories, casePriorities, caseStatuses, inferCaseCategory } from "@/lib/case-utils";
import { getCustomerForSession, requireRole, requireUser } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await requireUser();
    const role = (session.user as { role?: string } | undefined)?.role ?? "user";

    let where: Record<string, unknown> = {};

    if (role === "admin" || role === "manager" || role === "support") {
      where = {};
    } else {
      // Regular customer user: Strictly isolated to their own customer account
      const customer = await getCustomerForSession(session);
      if (!customer) {
        return NextResponse.json([]);
      }
      where = { customerId: customer.id };
    }

    const requests = await prisma.serviceRequest.findMany({
      where,
      include: {
        customer: true,
        assignedUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(["admin", "manager", "support", "user"]);
    const role = (session.user as { role?: string } | undefined)?.role ?? "user";
    const body = await request.json();
    let targetCustomerId = String(body?.customerId ?? "").trim();
    const title = String(body?.title ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const rawCategory = String(body?.category ?? "").toLowerCase().trim();
    const category = caseCategories.includes(rawCategory as (typeof caseCategories)[number])
      ? rawCategory
      : inferCaseCategory(title, description);

    if (!title) {
      return NextResponse.json({ error: "Problem title is required." }, { status: 400 });
    }

    // Role-based customer ID resolution and validation
    if (role === "user") {
      const customer = await getCustomerForSession(session);
      if (!customer) {
        return NextResponse.json({ error: "Customer profile not found." }, { status: 404 });
      }
      targetCustomerId = customer.id; // Enforce user's own customer ID; ignore any external customerId
    } else {
      // Staff roles: admin, manager, support
      if (targetCustomerId) {
        // Internal CRM flow: explicit customer selection
        const customer = await prisma.customer.findUnique({ where: { id: targetCustomerId } });
        if (!customer) {
          return NextResponse.json({ error: "Customer not found." }, { status: 404 });
        }
      } else {
        // Staff accessing customer portal: resolve established customer context
        const customer = await getCustomerForSession(session);
        if (!customer) {
          return NextResponse.json({ error: "A customer context is required to create a service request." }, { status: 400 });
        }
        targetCustomerId = customer.id;
      }
    }

    const rawStatus = String(body?.status ?? "open");
    const status = (role === "user" || !caseStatuses.includes(rawStatus as (typeof caseStatuses)[number]))
      ? "open"
      : rawStatus;

    const rawPriority = String(body?.priority ?? "medium");
    const priority = (role === "user" || !casePriorities.includes(rawPriority as (typeof casePriorities)[number]))
      ? "medium"
      : rawPriority;

    const assignedUserId = role === "user" ? null : (body?.assignedUserId ? String(body.assignedUserId) : null);
    const currentUserId = (session.user as { id?: string } | undefined)?.id ?? null;

    const item = await prisma.serviceRequest.create({
      data: {
        customerId: targetCustomerId,
        title,
        description: description || null,
        category,
        status,
        priority,
        assignedUserId,
        createdByUserId: currentUserId,
      },
      include: {
        customer: true,
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
