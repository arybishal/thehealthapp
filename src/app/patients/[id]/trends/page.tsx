import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { findBiomarkerByName } from "@/lib/biomarkers";
import { TrendsPanel } from "@/components/trends/trends-panel";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

export default async function PatientTrendsPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!patient) notFound();

  const results = await prisma.labResult.findMany({
    where: { report: { patientId: id } },
    orderBy: { createdAt: "desc" },
    include: { report: true },
  });

  const grouped = new Map<
    string,
    Array<{
      id: string;
      date: string;
      displayDate: string;
      value: number;
      unit: string;
      refLow: number | null;
      refHigh: number | null;
      confidence: string;
      reportId: string;
    }>
  >();

  for (const r of results) {
    const key = r.canonicalName;
    if (!grouped.has(key)) grouped.set(key, []);

    const date = r.resultDate || r.createdAt;
    const outputDate = date.toISOString().slice(0, 10);
    const displayDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });

    const arr = grouped.get(key)!;
    const existing = arr.find((x) => x.date === outputDate);
    if (!existing) {
      arr.push({
        id: r.id,
        date: outputDate,
        displayDate,
        value: r.normalizedValue ?? 0,
        unit: r.normalizedUnit || r.originalUnit || "unit",
        refLow: r.referenceLow,
        refHigh: r.referenceHigh,
        confidence: r.confidence,
        reportId: r.reportId,
      });
    }
  }

  const ranges: Record<string, { low: number | null; high: number | null }> = {};
  for (const [name, data] of grouped) {
    const latest = data.find((d) => d.refLow !== null || d.refHigh !== null);
    ranges[name] = {
      low: latest?.refLow ?? null,
      high: latest?.refHigh ?? null,
    };
  }

  const items = [...grouped.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([name, data]) => {
      const meta = findBiomarkerByName(name);
      return {
        canonicalName: name,
        displayName: meta?.displayName || name,
        category: (meta?.category || "").toLowerCase() || "Other",
        data,
      };
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Trends</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          See how this patient&apos;s results have changed over time.
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="font-semibold">No biomarkers tracked yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a report to start seeing trends.
          </p>
        </Card>
      ) : (
        <TrendsPanel items={items} referenceRanges={ranges} patientId={id} />
      )}
    </div>
  );
}