import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDays, Upload } from "lucide-react";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

interface TimelineEvent {
  id: string;
  date: Date;
  kind: "report" | "measurement";
  title: string;
  subtitle?: string;
  href: string;
  meta?: string;
}

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
    ...reports.map((r) => ({
      id: r.id,
      date: r.reportDate || r.createdAt,
      kind: "report" as const,
      title: r.title,
      subtitle: r.laboratoryName || "Unknown laboratory",
      href: `/patients/${id}/reports/${r.id}`,
      meta: `${r.results.length} ${r.results.length === 1 ? "result" : "results"}`,
    })),
    ...measurements.map((m) => ({
      id: m.id,
      date: m.date,
      kind: "measurement" as const,
      title: `${m.value} ${m.unit}`,
      subtitle: `${m.type.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")} measurement`,
      href: `/patients/${id}/vitals`,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Group by year then month
  const grouped = new Map<string, Map<string, TimelineEvent[]>>();
  for (const event of events) {
    const year = event.date.toLocaleDateString("en-US", { year: "numeric" });
    const month = event.date.toLocaleDateString("en-US", { month: "long" });
    if (!grouped.has(year)) grouped.set(year, new Map());
    const yearMap = grouped.get(year)!;
    if (!yearMap.has(month)) yearMap.set(month, []);
    yearMap.get(month)!.push(event);
  }

  const sortedYears = [...grouped.keys()].sort((a, b) => parseInt(b) - parseInt(a));
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Health Timeline</h1>
        <p className="text-muted-foreground">
          Complete health history for this patient
        </p>
      </div>

      {events.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light/60 text-primary">
            <CalendarDays className="h-7 w-7" />
          </div>
          <p className="mt-4 font-semibold">
            This patient&apos;s timeline starts with their first report
          </p>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto px-4">
            Upload a medical report and it will appear here, grouped by month
            and year as their health history grows.
          </p>
          <Link href={`/patients/${id}/reports/upload`} className="mt-5 inline-block">
            <Button>
              <Upload />
              Upload Report
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="relative border-l-2 border-border pl-6 ml-3 space-y-8">
          {sortedYears.map((year) => {
            const yearMap = grouped.get(year)!;
            const sortedMonths = [...yearMap.keys()].sort(
              (a, b) => months.indexOf(b) - months.indexOf(a)
            );

            return (
              <div key={year} className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                <h2 className="text-xl font-bold mb-4">{year}</h2>
                <div className="space-y-4">
                  {sortedMonths.map((month) => (
                    <div key={month}>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        {month}
                      </h3>
                      <div className="space-y-2">
                        {yearMap.get(month)!.map((event) => (
                          <Link
                            key={`${event.kind}-${event.id}`}
                            href={event.href}
                            className="block p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <p className="font-medium truncate">{event.title}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {event.subtitle}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                {event.meta && (
                                  <p className="text-sm font-medium">{event.meta}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {event.date.toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </p>
                              </div>
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