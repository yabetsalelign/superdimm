import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await requireUser();
    const role = (session.user as { role?: string } | undefined)?.role ?? "user";
    const currentUserId = (session.user as { id?: string } | undefined)?.id;

    const where = role === "admin" || role === "manager"
      ? {}
      : { userId: currentUserId ?? "" };

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(["admin", "manager", "support", "user"]);
    const body = await request.json();
    const currentUserId = (session.user as { id?: string } | undefined)?.id;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(body.amount ?? 0),
        description: String(body.description ?? ""),
        type: body.type ?? "expense",
        customerId: body.customerId ? String(body.customerId) : null,
        userId: currentUserId,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
