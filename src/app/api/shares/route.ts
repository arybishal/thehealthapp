import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { generateShareToken, isShareExpired } from "@/lib/shares";
import { isDemoEmail, DEMO_MESSAGE } from "@/lib/demo";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  const where: Record<string, unknown> = { userId: session.user.id, revoked: false };
  if (patientId) where.patientId = patientId;

  const links = await prisma.shareLink.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      token: true,
      label: true,
      includeReports: true,
      includeResults: true,
      includeVitals: true,
      includeDetails: true,
      includeTimeline: true,
      includeInsights: true,
      expiresAt: true,
      revoked: true,
      createdAt: true,
      lastAccessedAt: true,
      accessCount: true,
      patient: { select: { name: true, id: true } },
    },
  });

  return NextResponse.json(links);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoEmail(session.user.email)) return NextResponse.json({ error: DEMO_MESSAGE }, { status: 403 });

  try {
    const body = await request.json();
    const { patientId, label, includeReports, includeResults, includeVitals, includeDetails, includeTimeline, includeInsights, expiresInDays } = body;

    if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, userId: session.user.id },
      select: { id: true },
    });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const token = generateShareToken();
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const link = await prisma.shareLink.create({
      data: {
        userId: session.user.id,
        patientId,
        token,
        label: label || null,
        includeReports: includeReports ?? true,
        includeResults: includeResults ?? true,
        includeVitals: includeVitals ?? false,
        includeDetails: includeDetails ?? false,
        includeTimeline: includeTimeline ?? false,
        includeInsights: includeInsights ?? false,
        expiresAt,
      },
      select: {
        id: true,
        token: true,
        label: true,
        includeReports: true,
        includeResults: true,
        includeVitals: true,
        includeDetails: true,
        includeTimeline: true,
        includeInsights: true,
        expiresAt: true,
        createdAt: true,
        patient: { select: { name: true } },
      },
    });

    await logAudit({
      userId: session.user.id,
      patientId,
      shareId: link.id,
      action: "share.created",
      detail: `Share link created${label ? `: ${label}` : ""}`,
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("Share create error:", error);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoEmail(session.user.email)) return NextResponse.json({ error: DEMO_MESSAGE }, { status: 403 });

  try {
    const { id, revoked } = await request.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const existing = await prisma.shareLink.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, patientId: true, token: true },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.shareLink.update({
      where: { id },
      data: { revoked: revoked ?? true },
    });

    await logAudit({
      userId: session.user.id,
      patientId: existing.patientId,
      shareId: existing.id,
      action: "share.revoked",
      detail: `Token: ${existing.token.slice(0, 8)}...`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Share revoke error:", error);
    return NextResponse.json({ error: "Failed to revoke share link" }, { status: 500 });
  }
}