import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseReportText } from "@/lib/parser";
import { detectLanguage } from "@/lib/language";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const maxDuration = 120;

interface ReviewedResult {
  originalTestName: string;
  canonicalName: string;
  originalValue: string;
  originalUnit: string | null;
  normalizedValue: number | null;
  normalizedUnit: string | null;
  referenceLow: number | null;
  referenceHigh: number | null;
  originalRefRange: string | null;
  flag: string | null;
  confidence: string;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "Blood Test";
    const reportType = (formData.get("reportType") as string) || "general";
    const laboratoryName = (formData.get("laboratoryName") as string) || null;
    const reportDate = (formData.get("reportDate") as string) || null;
    const patientName = (formData.get("patientName") as string) || null;
    const reportNumber = (formData.get("reportNumber") as string) || null;
    const parsedText = (formData.get("parsedText") as string) || "";
    const resultsRaw = formData.get("results") as string | null;
    const patientId = (formData.get("patientId") as string) || "";
    const force = formData.get("force") === "true";

    // Validate the patient belongs to this user
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, userId: session.user.id },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const dateVal = reportDate && !isNaN(Date.parse(reportDate))
      ? new Date(reportDate)
      : null;

    const isManual = !file;
    let storedName = "manual";
    let originalFileName = "Manual entry";
    let originalFileType = "manual";
    let originalFileSize = 0;

    if (!isManual) {
      const validTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!validTypes.includes(file!.type)) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
      }
      if (file!.size > 20 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large" }, { status: 400 });
      }
      const uploadsDir = path.join(process.cwd(), "uploads");
      await mkdir(uploadsDir, { recursive: true });
      const extension = file!.name.split(".").pop() || "bin";
      storedName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
      const buffer = Buffer.from(await file!.arrayBuffer());
      await writeFile(path.join(uploadsDir, storedName), buffer);
      originalFileName = file!.name;
      originalFileType = file!.type;
      originalFileSize = file!.size;
    }

    // Duplicate detection
    if (force !== true) {
      const existing = await prisma.report.findFirst({
        where: {
          patientId: patient.id,
          title: title.trim(),
          reportDate: dateVal,
        },
        select: { id: true, title: true, reportDate: true, laboratoryName: true },
        orderBy: { createdAt: "desc" },
      });
      if (existing) {
        return NextResponse.json(
          {
            error: "Possible duplicate report",
            duplicate: {
              id: existing.id,
              title: existing.title,
              reportDate: existing.reportDate?.toISOString() ?? null,
              laboratoryName: existing.laboratoryName,
            },
          },
          { status: 409 }
        );
      }
    }

    const language = parsedText ? detectLanguage(parsedText) : "en";

    let reviewed: ReviewedResult[] = [];
    if (resultsRaw) {
      try { reviewed = JSON.parse(resultsRaw) as ReviewedResult[]; } catch { reviewed = []; }
    }
    if (reviewed.length === 0) {
      reviewed = parseReportText(parsedText).results;
    }

    const report = await prisma.report.create({
      data: {
        userId: session.user.id,
        patientId: patient.id,
        title,
        reportType: reportType || parseReportText(parsedText).reportType,
        laboratoryName: laboratoryName?.trim() || null,
        reportDate: dateVal,
        patientName: patientName?.trim() || null,
        reportNumber: reportNumber?.trim() || null,
        fileName: originalFileName,
        filePath: storedName,
        fileType: originalFileType,
        fileSize: originalFileSize,
        language,
        parsedText: parsedText || null,
        processingStatus: isManual ? "manual" : "confirmed",
        results: {
          create: reviewed.map((r) => ({
            canonicalName: r.canonicalName,
            originalTestName: r.originalTestName,
            originalValue: r.originalValue,
            originalUnit: r.originalUnit || null,
            normalizedValue: r.normalizedValue,
            normalizedUnit: r.normalizedUnit || null,
            referenceLow: r.referenceLow,
            referenceHigh: r.referenceHigh,
            originalRefRange: r.originalRefRange || null,
            flag: r.flag || null,
            confidence: r.confidence || "medium",
            confirmed: true,
            confirmedAt: new Date(),
            resultDate: dateVal,
          })),
        },
      },
      include: { results: true },
    });

    await logAudit({
      userId: session.user.id,
      patientId: patient.id,
      reportId: report.id,
      action: "report.uploaded",
      detail: `${isManual ? "Manual" : "File"}: ${originalFileName} (${reviewed.length} results)`,
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Report save error:", error);
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title } = await request.json();
    if (!id || !title) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const report = await prisma.report.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });
    if (!report) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.report.update({
      where: { id: report.id },
      data: { title: String(title).trim() },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Report rename error:", error);
    return NextResponse.json({ error: "Failed to rename report" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const report = await prisma.report.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });
    if (!report) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.report.delete({ where: { id: report.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Report delete error:", error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}