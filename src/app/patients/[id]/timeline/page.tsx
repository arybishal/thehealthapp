import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, FileText, HeartPulse, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

const measurementMeta: Record<string, { label: string; accent: string }> = {
  weight: { label: "Weight", accent: "bg-info-light text-info" },
  height: { label: "Height", accent: "bg-info-light text-info" },
  bmi: { label: "BMI", accent: "bg-info-light text-info" },
  blood_pressure: { label: "Blood Pressure", accent: "bg-primary-light text-primary" },
  heart_rate: { label: "Heart Rate", accent: "bg-primary-light text-primary" },
  blood_sugar: { label: "Blood Glucose", accent: "bg-primary-light text-primary" },
  temperature: { label: "Temperature", accent: "bg-secondary/15 text-secondary" },
};

const humanize = (s: string) =>
  s.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

interface TimelineEvent {
  id: string;
  date: Date;
  kind: "report" | "measurement";
  title: string;
  value?: string;
  unit?: string;
  description: string;
  href: string;
  meta?: string;
  accent: string;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default async function PatientTimelinePage({
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

  const [reports, measurements] = await Promise.all([
    prisma.report.findMany({
      where: { patientId: id },
      orderBy: { reportDate: "desc" },
      include: { results: true },
    }),
    prisma.healthMeasurement.findMany({
      where: { patientId: id },
      orderBy: { date: "desc" },
    }),
  ]);

  const events: TimelineEvent[] = [
    ...reports.map((r) => {
      const outOfRange = r.results.some(
        (res) =>
          res.normalizedValue != null &&
          ((res.referenceLow !== null && res.normalizedValue < res.referenceLow) ||
            (res.referenceHigh !== null && res.normalizedValue > res.referenceHigh))
      );
      return {
        id: r.id,
        date: r.reportDate || r.createdAt,
        kind: "report" as const,
        title: r.title,
        description: `${r.results.length} ${r.results.length === 1 ? "result" : "results"}`,
        href: `/patients/${id}/reports/${r.id}`,
        meta: outOfRange ? "Attention" : undefined,
        accent: "bg-primary-light text-primary",
      };
    }),
    ...measurements.map((m) => {
      const meta = measurementMeta[m.type];
      return {
        id: m.id,
        date: m.date,
        kind: "measurement" as const,
        title: meta?.label ?? humanize(m.type),
        value: String(m.value),
        unit: m.unit ?? undefined,
        description: `${meta?.label ?? humanize(m.type)} measurement${
          m.note ? ` — ${m.note}` : ""
        }`,
        href: `/patients/${id}/vitals`,
        accent: meta?.accent ?? "bg-secondary/15 text-secondary",
      };
    }),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const grouped = new Map<string, Map<string, TimelineEvent[]>>();
  for (const event of events) {
    const year = event.date.toLocaleDateString("en-US", { year: "numeric" });
    const month = event.date.toLocaleDateString("en-US", { month: "long" });
    if (!grouped.has(year)) grouped.set(year, new Map());
    const yearMap = grouped.get(year)!;
    if (!yearMap.has(month)) yearMap.set(month, []);
    yearMap.get(month)!.push(event);
  }

  const sortedYears = [...grouped.keys()].sort(
    (a, b) => parseInt(b) - parseInt(a)
  );

  const metaTone = (meta: string | undefined) =>
    meta === "Attention" ? "text-warning" : "text-muted-foreground";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Health Timeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your recorded health history, organized in one timeline.
        </p>
      </div>

      {events.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
            <CalendarDays className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold">No health history yet</p>
          <p className="mx-auto mt-1 max-w-md px-4 text-sm text-muted-foreground">
            Upload a medical report and it will appear here, grouped by month
            and year as the history grows.
          </p>
          <Link href={`/patients/${id}/reports/upload`} className="mt-5 inline-block">
            <Button>
              <Upload />
              Upload Report
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="relative space-y-10 border-l border-border pl-8">
          {sortedYears.map((year, i) => {
            const yearMap = grouped.get(year)!;
            const sortedMonths = [...yearMap.keys()].sort(
              (a, b) => MONTHS.indexOf(b) - MONTHS.indexOf(a)
            );

            return (
              <div key={year} className="relative">
                <span
                  className={`absolute -left-[37px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary ${
                    i === 0 ? "ring-4 ring-primary/15" : ""
                  }`}
                  aria-hidden
                />
                <h2 className="text-lg font-semibold tracking-tight">{year}</h2>
                <div className="mt-5 space-y-6">
                  {sortedMonths.map((month) => (
                    <div key={month}>
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {month}
                      </h3>
                      <div className="space-y-2">
                        {yearMap.get(month)!.map((event) => (
                          <Link
                            key={`${event.kind}-${event.id}`}
                            href={event.href}
                            className="group flex items-center gap-3.5 rounded-lg border border-border bg-card p-3.5 transition-colors hover:border-primary/25 hover:bg-background"
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${event.accent}`}
                            >
                              {event.kind === "report" ? (
                                <FileText className="h-4 w-4" />
                              ) : (
                                <HeartPulse className="h-4 w-4" />
                              )}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-2">
                                <p className="truncate text-sm font-medium">
                                  {event.title}
                                </p>
                                {event.value != null && (
                                  <p className="truncate text-base font-semibold">
                                    {event.value}
                                    {event.unit && (
                                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                                        {event.unit}
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {event.description}
                              </p>
                            </div>

                            <div className="shrink-0 text-right">
                              <p
                                className={`text-xs font-medium ${metaTone(
                                  event.meta
                                )}`}
                              >
                                {event.meta}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {event.date.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}