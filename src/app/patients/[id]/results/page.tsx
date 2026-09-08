import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Microscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status";
import { findBiomarkerByName } from "@/lib/biomarkers";
import { formatNumber } from "@/lib/patients";

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
      referenceLow: true,
      referenceHigh: true,
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
      refLow: number | null;
      refHigh: number | null;
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
        refLow: r.referenceLow,
        refHigh: r.referenceHigh,
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
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          Lab Results
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Laboratory results recorded for this patient.
        </p>
      </div>

      {biomarkers.length === 0 ? (
        <Card className="py-16 text-center border-border bg-card rounded-xl shadow-[0_1px_3px_rgba(24,39,75,0.04)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <Microscope className="h-7 w-7" />
          </div>
          <p className="mt-4 font-semibold">No laboratory results yet</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto px-4">
            Upload a report to start building this patient&apos;s laboratory
            result history.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {biomarkers.map((b) => {
            const flag =
              b.latestValue !== null &&
              b.refLow !== null &&
              b.latestValue < b.refLow
                ? "L"
                : b.latestValue !== null &&
                    b.refHigh !== null &&
                    b.latestValue > b.refHigh
                  ? "H"
                  : null;
            const tone =
              flag === "H" || flag === "L"
                ? ("danger" as const)
                : ("normal" as const);
            return (
              <Link
                key={b.canonicalName}
                href={`/patients/${id}/results/${encodeURIComponent(b.canonicalName)}`}
                className="group relative flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 shadow-[0_1px_3px_rgba(24,39,75,0.04)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_-12px_rgba(24,39,75,0.12)]"
              >
                <span
                  aria-hidden
                  className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl ${
                    tone === "danger" ? "bg-danger" : "bg-transparent"
                  }`}
                />
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light/50 text-primary transition-colors duration-200 group-hover:bg-primary-light">
                  <Microscope className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{b.displayName}</p>
                    <span className="text-xs text-muted-foreground capitalize">
                      {b.category}
                    </span>
                  </div>
                  {b.count === 1 ? (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {b.count} recorded result
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {b.count} recorded results
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl md:text-2xl font-bold tracking-tight">
                    {formatNumber(b.latestValue)}
                    {b.latestUnit && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        {b.latestUnit}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {b.refLow !== null && b.refHigh !== null
                      ? `Ref ${b.refLow}-${b.refHigh}`
                      : "No reference range"}
                  </p>
                </div>
                <StatusBadge tone={tone} />
                <ArrowRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}