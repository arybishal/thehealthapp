import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { isDemoEmail, DEMO_MESSAGE } from "@/lib/demo";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");
  const biomarker = searchParams.get("biomarker");

  if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });

  const where: Record<string, unknown> = { patientId, patient: { userId: session.user.id } };
  if (biomarker) where.biomarker = biomarker;

  const ranges = await prisma.referenceRange.findMany({
    where,
    orderBy: [{ biomarker: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(ranges);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoEmail(session.user.email)) return NextResponse.json({ error: DEMO_MESSAGE }, { status: 403 });

  try {
    const body = await request.json();
    const { patientId, biomarker, lower, upper, unit, source, sourceDetail, gender, ageMin, ageMax, notes } = body;

    if (!patientId || !biomarker) return NextResponse.json({ error: "patientId and biomarker required" }, { status: 400 });

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, userId: session.user.id },
      select: { id: true },
    });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const range = await prisma.referenceRange.create({
      data: {
        patientId,
        biomarker: String(biomarker).trim(),
        lower: lower !== undefined ? Number(lower) : null,
        upper: upper !== undefined ? Number(upper) : null,
        unit: unit || null,
        source: source || "standard",
        sourceDetail: sourceDetail || null,
        gender: gender || null,
        ageMin: ageMin !== undefined ? Number(ageMin) : null,
        ageMax: ageMax !== undefined ? Number(ageMax) : null,
        effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : null,
        effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : null,
        notes: notes || null,
      },
    });

    await logAudit({
      userId: session.user.id,
      patientId,
      action: "range.created",
      detail: `${biomarker}${lower !== null ? ` (${lower}–${upper})` : ""}`,
    });

    return NextResponse.json(range, { status: 201 });
  } catch (error) {
    console.error("Range create error:", error);
    return NextResponse.json({ error: "Failed to create reference range" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoEmail(session.user.email)) return NextResponse.json({ error: DEMO_MESSAGE }, { status: 403 });

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const existing = await prisma.referenceRange.findFirst({
      where: { id, patient: { userId: session.user.id } },
      select: { id: true, biomarker: true, patientId: true },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.referenceRange.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      patientId: existing.patientId,
      action: "range.deleted",
      detail: existing.biomarker,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Range delete error:", error);
    return NextResponse.json({ error: "Failed to delete reference range" }, { status: 500 });
  }
}