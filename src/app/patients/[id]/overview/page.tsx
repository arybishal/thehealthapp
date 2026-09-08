import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  Activity,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  FileText,
  FlaskConical,
  Gauge,
  HeartPulse,
  Plus,
  Scale,
  Droplets,
  Thermometer,
  CalendarDays,
  Link as LinkIcon,
  Ruler,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, flagToTone, flagToLabel } from "@/components/status";
import { QuickAdd } from "@/components/dashboard/quick-add";

type Params = Promise<{ id: string }>;

const measurementMeta = {
  weight: { label: "Weight", icon: Scale },
  height: { label: "Height", icon: Scale },
  bmi: { label: "BMI", icon: Scale },
  blood_pressure: { label: "Blood Pressure", icon: Gauge },
  heart_rate: { label: "Heart Rate", icon: HeartPulse },
  blood_sugar: { label: "Blood Glucose", icon: Droplets },
  temperature: { label: "Temperature", icon: Thermometer },
} as const;

const longDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const shortDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

async function getLatestResults(patientId: string) {
  const results = await prisma.labResult.findMany({
    where: { report: { patientId } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
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

  const latestMap = new Map<
    string,
    {
      id: string;
      value: number | null;
      unit: string;
      date: Date;
      refLow: number | null;
      refHigh: number | null;
    }
  >();
  const prevMap = new Map<string, { value: number | null; date: Date }>();

  for (const r of results) {
    const date = r.resultDate || r.createdAt;
    const entry = {
      id: r.id,
      value: r.normalizedValue,
      unit: r.normalizedUnit || r.originalUnit || "",
      date,
      refLow: r.referenceLow,
      refHigh: r.referenceHigh,
    };

    if (!latestMap.has(r.canonicalName)) {
      latestMap.set(r.canonicalName, entry);
    } else if (!prevMap.has(r.canonicalName)) {
      prevMap.set(r.canonicalName, { value: r.normalizedValue, date });
    }
  }

  return Array.from(latestMap.entries()).map(([name, latest]) => {
    const prev = prevMap.get(name);
    return { name, latest, prev };
  });
}

function flagIndicator(
  value: number | null,
  refLow: number | null,
  refHigh: number | null
) {
  if (value === null) return null;
  if (refLow !== null && value < refLow) return "L";
  if (refHigh !== null && value > refHigh) return "H";
  return null;
}

function StatCard({
  icon: Icon,
  value,
  label,
  sub,
  boxClass,
}: {
  icon: ComponentType<{ className?: string }>;
  value: number;
  label: string;
  sub: string;
  boxClass: string;
}) {
  return (
    <Card className="p-5 transition-shadow hover:shadow-md relative overflow-hidden" size="sm">
      <div className="h-1 w-full bg-gradient-to-r from-primary/60 to-transparent absolute top-0 left-0" />
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${boxClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-sm font-medium mt-0.5">{label}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{sub}</p>
    </Card>
  );
}

function ChangeChip({
  latest,
  prev,
}: {
  latest: number | null;
  prev: number | null | undefined;
}) {
  if (latest === null || prev === null || prev === undefined) return null;
  const diff = Number((latest - prev).toFixed(2));
  if (diff === 0) {
    return (
      <span className="text-xs font-medium text-muted-foreground">→ Stable</span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-info-light px-2 py-0.5 text-xs font-semibold text-info">
      {diff > 0 ? "↑" : "↓"} {Math.abs(diff)}
    </span>
  );
}

export default async function PatientOverviewPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!patient) notFound();

  const [totalReports, totalResults, uniqueBiomarkers, latestResults, recent, upcomingReminders] =
    await Promise.all([
      prisma.report.count({ where: { patientId: id } }),
      prisma.labResult.count({ where: { report: { patientId: id } } }),
      prisma.labResult.groupBy({
        by: ["canonicalName"],
        where: { report: { patientId: id } },
      }),
      getLatestResults(id),
      prisma.report.findMany({
        where: { patientId: id },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { results: true },
      }),
      prisma.reminder.findMany({
        where: { patientId: id, userId: session.user.id, status: "active" },
        orderBy: { date: "asc" },
        take: 3,
      }),
    ]);

  const measurements = await prisma.healthMeasurement.findMany({
    where: { patientId: id },
    orderBy: { date: "desc" },
    take: 5,
  });

  const latestReport = recent[0] ?? null;
  const fileUrl = latestReport ? `/api/files/${latestReport.id}` : null;

  return (
    <div className="space-y-6">
      {/* Health Overview Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href={`/patients/${id}/reports`}>
          <StatCard
            icon={FileText}
            value={totalReports}
            label="Medical Reports"
            sub="Uploaded lab reports in this patient's history"
            boxClass="bg-primary-light text-primary"
          />
        </Link>
        <Link href={`/patients/${id}/results`}>
          <StatCard
            icon={FlaskConical}
            value={totalResults}
            label="Tracked Results"
            sub="Individual lab results extracted from reports"
            boxClass="bg-secondary/15 text-secondary"
          />
        </Link>
        <Link href={`/patients/${id}/trends`}>
          <StatCard
            icon={Activity}
            value={uniqueBiomarkers.length}
            label="Tracked Biomarkers"
            sub="Distinct biomarkers monitored over time"
            boxClass="bg-info-light text-info"
          />
        </Link>
      </div>

      {/* Latest Report + Latest Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-base font-semibold mb-3">Latest Report</h2>
          {latestReport && fileUrl ? (
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-hover text-white">
              <CardContent className="p-5">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold truncate text-white">
                      {latestReport.title}
                    </p>
                    <p className="text-sm text-primary-foreground/80 truncate">
                      {latestReport.laboratoryName || "Unknown lab"} •{" "}
                      {latestReport.reportDate
                        ? longDate(latestReport.reportDate)
                        : "No date"}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-primary-foreground/80">
                  {latestReport.results.length} results extracted
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/patients/${id}/reports/${latestReport.id}`}>
                    <Button size="sm" className="bg-white text-primary hover:bg-white/90">
                      <FileText />
                      View Report
                    </Button>
                  </Link>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "outline", size: "sm", className: "border-white/30 text-white hover:bg-white/10" })}
                  >
                    <ExternalLink />
                    View Original
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <FileText className="h-7 w-7" />
                </div>
                <p className="mt-4 font-semibold">No medical reports yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload the first report to start building this patient&apos;s
                  health history.
                </p>
                <Link
                  href={`/patients/${id}/reports/upload`}
                  className="mt-5 inline-block"
                >
                  <Button>
                    <Plus />
                    Upload Report
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Latest Results */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Latest Results
            </CardTitle>
            <Link
              href={`/patients/${id}/results`}
              className="text-sm text-primary hover:underline whitespace-nowrap"
            >
              View All Results
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {latestResults.length === 0 ? (
              <p className="px-4 py-8 text-sm text-muted-foreground">
                No results yet. Upload a report to start tracking biomarkers.
              </p>
            ) : (
              <div className="divide-y">
                {latestResults.slice(0, 5).map(({ name, latest, prev }) => {
                  const flag = flagIndicator(
                    latest.value,
                    latest.refLow,
                    latest.refHigh
                  );
                  const prevValue = prev?.value ?? null;
                  const changeLabel =
                    latest.value != null &&
                    prevValue != null &&
                    latest.value !== prevValue
                      ? prevValue > latest.value
                        ? " • Decreased from previous result"
                        : " • Increased from previous result"
                      : null;
                  return (
                    <Link
                      key={name}
                      href={`/patients/${id}/results/${encodeURIComponent(name)}`}
                      className="group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{name}</p>
                          {flag && (
                            <StatusBadge
                              tone={flagToTone(flag)}
                              label={flagToLabel(flag)}
                            />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Recorded on {shortDate(latest.date)}
                        </p>
                        {prev?.value != null && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Previous {prev.value} {latest.unit}
                            {changeLabel}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold">
                          {latest.value ?? "—"}
                          {latest.unit && (
                            <span className="text-xs font-normal text-muted-foreground">
                              {" "}
                              {latest.unit}
                            </span>
                          )}
                        </p>
                        <p className="mt-1">
                          <ChangeChip latest={latest.value} prev={prev?.value} />
                        </p>
                        <p className="mt-1 flex items-center justify-end gap-0.5 text-xs font-medium text-primary transition-opacity md:opacity-0 md:group-hover:opacity-100">
                          View History <ArrowRight className="h-3 w-3" />
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Add + Recent Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Quick Add</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickAdd patientId={id} />
            <p className="mt-4 text-xs text-muted-foreground">
              Add a health measurement without uploading a report.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Vitals</CardTitle>
            <Link
              href={`/patients/${id}/vitals`}
              className="text-sm text-primary hover:underline"
            >
              View Vitals
            </Link>
          </CardHeader>
          <CardContent>
            {measurements.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No vitals recorded yet. Use Quick Add to track weight, blood
                pressure, heart rate, and more.
              </p>
            ) : (
              <div className="space-y-2">
                {measurements.map((m) => {
                  const meta =
                    measurementMeta[m.type as keyof typeof measurementMeta];
                  const Icon = meta?.icon ?? Activity;
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {meta?.label || m.type}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {shortDate(m.date)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold shrink-0">
                        {m.value} {m.unit}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Upcoming Reminders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-base font-semibold mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <Link href={`/patients/${id}/ranges`} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow text-sm">
              <Ruler className="h-4 w-4 text-primary" /> Reference Ranges
            </Link>
            <Link href={`/patients/${id}/reminders`} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow text-sm">
              <CalendarDays className="h-4 w-4 text-primary" /> Reminders
            </Link>
            <Link href={`/patients/${id}/reports/upload`} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow text-sm">
              <Plus className="h-4 w-4 text-primary" /> Upload Report
            </Link>
          </div>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Upcoming Reminders</CardTitle>
              <Link href={`/patients/${id}/reminders`} className="text-sm text-primary hover:underline">View All</Link>
            </CardHeader>
            <CardContent>
              {upcomingReminders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No upcoming reminders. Schedule a follow-up test to stay on track.
                </p>
              ) : (
                <div className="space-y-2">
                  {upcomingReminders.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border bg-card text-sm">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium">{r.testName}</p>
                          <p className="text-xs text-muted-foreground">
                            Due {new Date(r.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            {r.notes && ` — ${r.notes}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Reports</CardTitle>
          <Link
            href={`/patients/${id}/reports`}
            className="text-sm text-primary hover:underline"
          >
            View All Reports
          </Link>
        </CardHeader>
        <CardContent className="grid gap-2">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No reports uploaded yet.
            </p>
          ) : (
            recent.map((report) => (
              <Link
                key={report.id}
                href={`/patients/${id}/reports/${report.id}`}
                className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{report.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {report.laboratoryName || "Unknown lab"} •{" "}
                    {report.reportDate ? longDate(report.reportDate) : "No date"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">
                    {report.results.length} results
                  </p>
                  <p className="mt-0.5 flex items-center justify-end gap-0.5 text-xs font-medium text-primary transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    View <ChevronRight className="h-3.5 w-3.5" />
                  </p>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}