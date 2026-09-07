import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Microscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { findBiomarkerByName } from "@/lib/biomarkers";
import { formatDate, formatNumber } from "@/lib/patients";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

export default async function PatientResultsPage({
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
    select: {
      canonicalName: true,
      normalizedValue: true,
      normalizedUnit: true,
      originalUnit: true,
      resultDate: true,
      createdAt: true,
    },
  });

  const grouped = new Map<
    string,
    {
      displayName: string;
      category: string;
      count: number;
      latestValue: number | null;
      latestUnit: string;
      latestDate: Date;
      previous: number | null;
    }
  >();

  for (const r of results) {
    const name = r.canonicalName;
    const date = r.resultDate || r.createdAt;
    const value = r.normalizedValue;
    const unit = r.normalizedUnit || r.originalUnit || "";

    if (!grouped.has(name)) {
      const meta = findBiomarkerByName(name);
      grouped.set(name, {
        displayName: meta?.displayName || name,
        category: (meta?.category || "Other").toLowerCase(),
        count: 1,
        latestValue: value,
        latestUnit: unit,
        latestDate: date,
        previous: null,
      });
    } else {
      const g = grouped.get(name)!;
      g.count += 1;
      if (g.previous === null) g.previous = value;
    }
  }

  const biomarkers = Array.from(grouped.entries()).map(
    ([canonicalName, g]) => ({ canonicalName, ...g })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Lab Results</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Laboratory results recorded for this patient.
        </p>
      </div>

      {biomarkers.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light/60 text-primary">
            <Microscope className="h-7 w-7" />
          </div>
          <p className="mt-4 font-semibold">No laboratory results yet</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto px-4">
            Upload a report to start building this patient&apos;s laboratory
            result history.
          </p>
        </Card>
      ) : (
        <div className="divide-y border rounded-xl bg-card">
          {biomarkers.map((b) => (
            <Link
              key={b.canonicalName}
              href={`/patients/${id}/results/${encodeURIComponent(b.canonicalName)}`}
              className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light/60 text-primary">
                <Microscope className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{b.displayName}</p>
                  <span className="text-xs text-muted-foreground capitalize">
                    {b.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {b.count} {b.count === 1 ? "recorded result" : "recorded results"}
                  {" • Latest "}
                  {formatDate(b.latestDate)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="font-semibold">
                    {formatNumber(b.latestValue)}
                    {b.latestUnit && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {" "}
                        {b.latestUnit}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">Latest</p>
                </div>
                {b.previous !== null &&
                  b.latestValue !== null &&
                  b.previous !== b.latestValue && (
                    <span className="text-xs font-semibold text-info">
                      {b.latestValue > b.previous ? "↑" : "↓"}
                    </span>
                  )}
                <ArrowRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}