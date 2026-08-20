import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { caseCategories, casePriorities, caseStatuses } from "@/lib/case-utils";
import { requireRole } from "@/lib/rbac";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["admin", "manager", "support"]);
    const { id } = await params;
    const body = await request.json();

    const dataToUpdate: {
      status?: string;
      priority?: string;
      category?: string;
      assignedUserId?: string | null;
    } = {};

    if (body?.status !== undefined) {
      const status = String(body.status);
      if (!caseStatuses.includes(status as (typeof caseStatuses)[number])) {
        return NextResponse.json({ error: "Invalid case status." }, { status: 400 });
      }
      dataToUpdate.status = status;
    }

    if (body?.priority !== undefined) {
      const priority = String(body.priority);
      if (!casePriorities.includes(priority as (typeof casePriorities)[number])) {
        return NextResponse.json({ error: "Invalid case priority." }, { status: 400 });
      }
      dataToUpdate.priority = priority;
    }

    if (body?.category !== undefined) {
      const category = String(body.category);
      if (!caseCategories.includes(category as (typeof caseCategories)[number])) {
        return NextResponse.json({ error: "Invalid case category." }, { status: 400 });
      }
      dataToUpdate.category = category;
    }

    if (body?.assignedUserId !== undefined) {
      dataToUpdate.assignedUserId = body.assignedUserId ? String(body.assignedUserId) : null;
    }

    const item = await prisma.serviceRequest.update({
      where: { id },
      data: dataToUpdate,
      include: {
        customer: true,
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Unable to update case." }, { status: 403 });
  }
}