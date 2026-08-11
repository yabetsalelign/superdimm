import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await requireUser();
    const role = (session.user as { role?: string } | undefined)?.role ?? "user";
    const userId = (session.user as { id?: string } | undefined)?.id ?? undefined;

    const where =
      role === "admin" || role === "manager"
        ? {}
        : {
            OR: [
              { assignedUserId: userId },
              { createdByUserId: userId },
            ],
          };

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
    const session = await requireRole(["admin", "manager", "support"]);
    const body = await request.json();
    const customerId = String(body?.customerId ?? "").trim();
    const title = String(body?.title ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const status = String(body?.status ?? "open");
    const priority = String(body?.priority ?? "medium");

    if (!customerId || !title) {
      return NextResponse.json({ error: "Customer and title are required." }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    const item = await prisma.serviceRequest.create({
      data: {
        customerId,
        title,
        description: description || null,
        status,
        priority,
        assignedUserId: (session.user as { id?: string } | undefined)?.id ?? null,
        createdByUserId: (session.user as { id?: string } | undefined)?.id ?? null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
