import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getReportCategoryLabel } from "@/lib/biomarkers";
import { StatusBadge, flagToTone, flagToLabel } from "@/components/status";

type SearchParams = Promise<{ q?: string }>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  if (!query) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Search</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Search your health history
          </p>
        </div>
        <Card className="py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light/60 text-primary">
            <Search className="h-7 w-7" />
          </div>
          <p className="mt-4 font-semibold">Search your health history</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto px-4">
            Find any biomarker, laboratory, or report in your account.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Try: HbA1c, Vitamin D, CBC, or a laboratory name
          </p>
          <div className="mx-auto mt-6 max-w-md px-4">
            <form action="/search" className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                name="q"
                type="search"
                placeholder="Search biomarkers, labs, dates..."
                className="pl-9 h-10"
                autoFocus
              />
            </form>
          </div>
        </Card>
      </div>
    );
  }

  const userId = session.user.id;

  // Search biomarkers (canonical names + original test names)
  const biomarkerResults = await prisma.labResult.findMany({
    where: {
      report: { userId },
      OR: [
        { canonicalName: { contains: query } },
        { originalTestName: { contains: query } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { report: true },
    take: 30,
  });

  // Search reports (title, lab name, report type, date)
  const reportResults = await prisma.report.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: query } },
        { laboratoryName: { contains: query } },
        { reportType: { contains: query } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { results: true },
    take: 20,
  });

  // Search measurements
  const measurementResults = await prisma.healthMeasurement.findMany({
    where: { userId, type: { contains: query } },
    orderBy: { date: "desc" },
    take: 10,
  });

  const searchForm = (
    <form action="/search" className="flex gap-2 w-full max-w-md">
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Search biomarkers, labs, dates..."
        className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
      />
      <Button type="submit" variant="outline" size="sm">
        Search
      </Button>
    </form>
  );

  const total = biomarkerResults.length + reportResults.length + measurementResults.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Search Results</h1>
          <p className="text-muted-foreground">
            {total} {total === 1 ? "result" : "results"} for &quot;{query}&quot;
          </p>
        </div>
        {searchForm}
      </div>

      {biomarkerResults.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Biomarker Results</h2>
          {biomarkerResults.map((r) => (
            <Link
              key={r.id}
              href={`/patients/${r.report.patientId}/reports/${r.reportId}`}
              className="block p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {r.originalTestName}
                      {r.canonicalName !== r.originalTestName && (
                        <span className="text-xs text-muted-foreground ml-2">
                          → {r.canonicalName}
                        </span>
                      )}
                    </p>
                    {r.flag ? (
                      <StatusBadge
                        tone={flagToTone(r.flag)}
                        label={flagToLabel(r.flag)}
                      />
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {r.report.title} •{" "}
                    {r.resultDate?.toLocaleDateString() ||
                      r.report.reportDate?.toLocaleDateString() ||
                      "No date"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold">{r.originalValue}</p>
                  <p className="text-xs text-muted-foreground">
                    {getReportCategoryLabel(r.report.reportType)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {reportResults.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Reports</h2>
          {reportResults.map((report) => (
            <Link
              key={report.id}
              href={`/patients/${report.patientId}/reports/${report.id}`}
              className="block p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium truncate">{report.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {report.laboratoryName || "Unknown lab"} •{" "}
                    {getReportCategoryLabel(report.reportType)}
                  </p>
                </div>
                <p className="text-sm font-medium shrink-0">
                  {report.results.length}{" "}
                  {report.results.length === 1 ? "result" : "results"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {measurementResults.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Measurements</h2>
          {measurementResults.map((m) => (
            <div
              key={m.id}
              className="p-3 rounded-lg border border-border bg-card flex items-center justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium capitalize truncate">{m.type}</p>
                {m.note && (
                  <p className="text-xs text-muted-foreground truncate">{m.note}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold">
                  {m.value} {m.unit}
                </p>
                <p className="text-xs text-muted-foreground">
                  {m.date.toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {total === 0 && (
        <Card className="py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <FileText className="h-7 w-7" />
          </div>
          <p className="mt-4 font-semibold">No results found for &quot;{query}&quot;</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto px-4">
            Try a different biomarker name, laboratory, or report title, or
            check your spelling.
          </p>
        </Card>
      )}
    </div>
  );
}