import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { toCSV, toJSON, measurementsToCSV } from "@/lib/export";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");
  const format = searchParams.get("format") || "csv";
  const scope = searchParams.get("scope") || "full";

  if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, userId: session.user.id },
    select: { id: true },
  });
  if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

  const reports = await prisma.report.findMany({
    where: { patientId, userId: session.user.id },
    include: { results: true },
    orderBy: { reportDate: "desc" },
  });

  const exportResults = reports.flatMap((r) =>
    r.results.map((res) => ({
      canonicalName: res.canonicalName,
      originalTestName: res.originalTestName,
      originalValue: res.originalValue,
      originalUnit: res.originalUnit,
      normalizedValue: res.normalizedValue,
      referenceLow: res.referenceLow,
      referenceHigh: res.referenceHigh,
      flag: res.flag,
      reportDate: r.reportDate?.toISOString().split("T")[0] ?? null,
      reportTitle: r.title,
      laboratoryName: r.laboratoryName,
      confirmed: res.confirmed,
    }))
  );

  let measurements: { type: string; value: number; unit: string | null; note: string | null; date: string; source: string }[] = [];
  if (scope === "full") {
    measurements = await prisma.healthMeasurement.findMany({
      where: { patientId, userId: session.user.id },
      orderBy: { date: "desc" },
    }).then((ms) => ms.map((m) => ({
      type: m.type,
      value: m.value,
      unit: m.unit,
      note: m.note,
      date: m.date.toISOString(),
      source: m.source,
    })));
  }

  const content = format === "json"
    ? JSON.stringify({ reports: exportResults, measurements }, null, 2)
    : [...toCSV(exportResults).split("\n"), "", "--- Measurements ---", measurementsToCSV(measurements)].join("\n");

  const filename = `blood-tracker-export-${patientId.slice(0, 8)}.${format === "json" ? "json" : "csv"}`;

  await logAudit({
    userId: session.user.id,
    patientId,
    action: "export.generated",
    detail: `${format.toUpperCase()} export, scope: ${scope}`,
  });

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": format === "json" ? "application/json" : "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}