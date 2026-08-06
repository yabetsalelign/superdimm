import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@superdimm.com";

async function getDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo User",
      role: "user",
    },
    update: {},
  });
}

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await getDemoUser();

    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(body.amount ?? 0),
        description: String(body.description ?? ""),
        type: body.type ?? "expense",
        userId: user.id,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions failed:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
