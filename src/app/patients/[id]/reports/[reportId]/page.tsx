import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmButton, DeleteReportButton } from "@/components/report-actions";
import { generateSummary } from "@/lib/summary";
import { StatusBadge, flagToTone, flagToLabel } from "@/components/status";

type Params = Promise<{ id: string; reportId: string }>;

export default async function PatientReportDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id, reportId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const report = await prisma.report.findFirst({
    where: { id: reportId, patientId: id, userId: session.user.id },
    include: { results: true },
  });
  if (!report) notFound();

  const fileUrl = `/api/files/${report.id}`;
  const unconfirmed = report.results.filter((r) => !r.confirmed).length;
  const summary = generateSummary(report.results);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <Link
            href={`/patients/${id}/reports`}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
          >
            <span aria-hidden>←</span> Back to Reports
          </Link>
          <h1 className="text-xl md:text-2xl font-bold mt-2">{report.title}</h1>
          <p className="text-muted-foreground">
            {report.laboratoryName || "Unknown lab"}
            {report.labLocation ? ` • ${report.labLocation}` : ""}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <StatusBadge
              tone={unconfirmed > 0 ? "attention" : "normal"}
              label={
                unconfirmed > 0
                  ? `${unconfirmed} unconfirmed result${unconfirmed > 1 ? "s" : ""}`
                  : "All results confirmed"
              }
            />
{report.reportType && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border capitalize">
              {report.reportType}
            </span>
          )}
          {report.processingStatus === "manual" && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-info-light text-info border border-info/25 font-medium">
              Manual entry
            </span>
          )}
          {report.reportDate && report.pageCount ? (
            <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              {report.pageCount} page{report.pageCount > 1 ? "s" : ""}
            </span>
          ) : null}
          {report.language && report.language !== "en" ? (
            <span className="text-xs px-2 py-0.5 rounded-md bg-warning-light text-warning border border-warning/30 font-medium uppercase">
              {report.language}
            </span>
          ) : null}
          {report.processingStatus === "failed" && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-danger-light text-danger border border-danger/30 font-medium">
              Processing failed
              {report.processingError ? `: ${report.processingError}` : ""}
            </span>
          )}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <a href={fileUrl} download={report.fileName}>
            <Button variant="outline">Download</Button>
          </a>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">View</Button>
          </a>
          <DeleteReportButton
            reportId={report.id}
            redirectTo={`/patients/${id}/reports`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Report Date</p>
          <p className="font-medium mt-1">
            {report.reportDate
              ? new Date(report.reportDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Unknown"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Report Type</p>
          <p className="font-medium mt-1 capitalize">{report.reportType || "Blood test"}</p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Patient</p>
          <p className="font-medium mt-1">{report.patientName || "You"}</p>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Extracted Results ({report.results.length})
          </CardTitle>
          {unconfirmed > 0 && (
            <span className="text-xs text-muted-foreground">
              Review and confirm each result to lock it in
            </span>
          )}
        </CardHeader>
        <CardContent>
          {report.results.length === 0 ? (
            <p className="text-muted-foreground">
              No results extracted from this report yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Test</th>
                    <th className="py-2 pr-4 font-medium">Result</th>
                    <th className="py-2 pr-4 font-medium">Unit</th>
                    <th className="py-2 pr-4 font-medium">Reference Range</th>
                    <th className="py-2 pr-4 font-medium">Flag</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.results.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3 pr-4 min-w-40">
                        <p className="font-medium">{r.originalTestName}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.canonicalName}
                        </p>
                      </td>
                      <td className="py-3 pr-4 font-semibold whitespace-nowrap">
                        {r.originalValue}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                        {r.originalUnit || "-"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                        {r.originalRefRange || "-"}
                      </td>
                      <td className="py-3 pr-4">
                        {r.flag ? (
                          <StatusBadge
                            tone={flagToTone(r.flag)}
                            label={flagToLabel(r.flag)}
                          />
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </td>
                      <td className="py-3">
                        <ConfirmButton resultId={r.id} confirmed={r.confirmed} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {report.parsedText && report.processingStatus !== "manual" && (
        <details className="group">
          <summary className="cursor-pointer list-none">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Extracted Text (view only)</span>
                <span className="text-xs text-muted-foreground group-open:hidden">Click to open</span>
                <span className="text-xs text-muted-foreground hidden group-open:inline">Click to close</span>
              </div>
            </Card>
          </summary>
          <Card className="mt-2">
            <CardContent>
              <pre className="whitespace-pre-wrap text-xs font-mono text-muted-foreground max-h-96 overflow-y-auto leading-relaxed">
                {report.parsedText}
              </pre>
            </CardContent>
          </Card>
        </details>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Health Summary</CardTitle>
          <span className="text-xs text-muted-foreground">
            Auto-generated from confirmed results
          </span>
        </CardHeader>
        <CardContent className="space-y-3">
          {unconfirmed > 0 ? (
            <p className="text-sm text-muted-foreground">
              Confirm results above to include them in this summary
              ({summary.verifiedCount} of {summary.totalCount} confirmed).
            </p>
          ) : null}
          <p className="text-base font-medium">{summary.headline}</p>
          {summary.points.length > 0 ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {summary.points.map((p) => (
                <li key={p.canonicalName} className="flex gap-2">
                  <StatusBadge
                    tone={
                      p.status === "check"
                        ? "attention"
                        : p.status === "normal"
                        ? "normal"
                        : "danger"
                    }
                    label={p.status}
                  />
                  <span>{p.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No confirmed results.</p>
          )}
          <p className="text-xs text-muted-foreground/80">{summary.disclaimer}</p>
        </CardContent>
      </Card>
    </div>
  );
}