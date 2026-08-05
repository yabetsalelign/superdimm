import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tx = {
      id:
        typeof globalThis?.crypto?.randomUUID === "function"
          ? globalThis.crypto.randomUUID()
          : String(Date.now()),
      amount: Number(body.amount ?? 0),
      description: String(body.description ?? ""),
      type: body.type ?? "expense",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(tx, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions failed:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
