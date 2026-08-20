import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole(["admin", "manager", "support"]);
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { serviceRequests: true, transactions: true } } },
    });
    return NextResponse.json(customers);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["admin", "manager", "support"]);
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const plan = String(body?.plan ?? "").trim();
    const status = String(body?.status ?? "active");

    if (!name) {
      return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    }

    const session = await requireUser();
    const customer = await prisma.customer.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        plan: plan || "Standard Telecom Service",
        status,
        userId: (session.user as { id?: string } | undefined)?.id ?? null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
