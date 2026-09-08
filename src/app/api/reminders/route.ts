import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");
  const upcoming = searchParams.get("upcoming");
  const status = searchParams.get("status") || "active";

  const where: Record<string, unknown> = { userId: session.user.id, status };
  if (patientId) where.patientId = patientId;

  let orderBy: Record<string, string> = { date: "asc" };

  const result = await prisma.reminder.findMany({
    where,
    orderBy,
    ...(upcoming ? { take: 3 } : {}),
    include: { patient: { select: { name: true } } },
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { patientId, testName, date, recurrence, notes } = body;

    if (!patientId || !testName || !date) {
      return NextResponse.json({ error: "patientId, testName, and date are required" }, { status: 400 });
    }

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, userId: session.user.id },
      select: { id: true },
    });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const reminder = await prisma.reminder.create({
      data: {
        userId: session.user.id,
        patientId,
        testName: String(testName).trim(),
        date: new Date(date),
        recurrence: recurrence || "none",
        notes: notes || null,
      },
      include: { patient: { select: { name: true } } },
    });

    await logAudit({
      userId: session.user.id,
      patientId,
      action: "reminder.created",
      detail: `Reminder: ${testName} on ${date}`,
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error("Reminder create error:", error);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, status, notes, date } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const existing = await prisma.reminder.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, patientId: true, testName: true },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (date) data.date = new Date(date);

    await prisma.reminder.update({ where: { id }, data });

    await logAudit({
      userId: session.user.id,
      patientId: existing.patientId,
      action: `reminder.${status === "completed" ? "completed" : status === "cancelled" ? "cancelled" : "updated"}`,
      detail: `${existing.testName}${status ? ` → ${status}` : ""}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Reminder update error:", error);
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const existing = await prisma.reminder.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.reminder.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Reminder delete error:", error);
    return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 });
  }
}