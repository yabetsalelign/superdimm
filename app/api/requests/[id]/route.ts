import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { casePriorities, caseStatuses } from "@/lib/case-utils";
import { requireRole } from "@/lib/rbac";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["admin", "manager", "support"]);
    const { id } = await params;
    const body = await request.json();
    const status = String(body?.status ?? "");
    const priority = String(body?.priority ?? "");
    const assignedUserId = body?.assignedUserId ? String(body.assignedUserId) : null;

    if (!caseStatuses.includes(status as (typeof caseStatuses)[number])) {
      return NextResponse.json({ error: "Invalid case status." }, { status: 400 });
    }
    if (!casePriorities.includes(priority as (typeof casePriorities)[number])) {
      return NextResponse.json({ error: "Invalid case priority." }, { status: 400 });
    }

    const item = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status,
        priority,
        assignedUserId,
        createdByUserId: (session.user as { id?: string } | undefined)?.id ?? undefined,
      },
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Unable to update case." }, { status: 403 });
  }
}