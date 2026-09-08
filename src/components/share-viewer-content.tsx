"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, flagToTone, flagToLabel } from "@/components/status";
import { buildTrendInsight, buildCompareInsight } from "@/lib/insights";
import type { InsightSeriesInput } from "@/lib/insights";

interface ShareViewerContentProps {
  patient: { id: string; name: string; dob: Date | null; gender: string | null };
  reports: Array<{
    id: string;
    title: string;
    reportDate: Date | null;
    laboratoryName: string | null;
    results: Array<{
      id: string;
      canonicalName: string;
      originalValue: string;
      originalUnit: string | null;
      normalizedValue: number | null;
      referenceLow: number | null;
      referenceHigh: number | null;
      flag: string | null;
    }>;
  }>;
  vitals: Array<{
    id: string;
    type: string;
    value: number;
    unit: string | null;
    date: Date;
  }>;
  includeTimeline: boolean;
  includeInsights: boolean;
  includeDetails: boolean;
}

export function ShareViewerContent({
  patient,
  reports,
  vitals,
  includeTimeline,
  includeInsights,
  includeDetails,
}: ShareViewerContentProps) {
  const flatResults = reports.flatMap((r) =>
    r.results.map((res) => ({
      ...res,
      reportDate: r.reportDate?.toISOString().split("T")[0] ?? null,
    }))
  );

  // Group by biomarker for insight
  const grouped: Record<string, InsightSeriesInput[]> = {};
  for (const r of flatResults) {
    if (!grouped[r.canonicalName]) grouped[r.canonicalName] = [];
    grouped[r.canonicalName].push({
      canonicalName: r.canonicalName,
      originalValue: r.originalValue,
      originalUnit: r.originalUnit,
      normalizedValue: r.normalizedValue,
      referenceLow: r.referenceLow,
      referenceHigh: r.referenceHigh,
      resultDate: r.reportDate ? new Date(r.reportDate) : null,
    });
  }

  const compareInsight = includeInsights && Object.keys(grouped).length >= 2
    ? buildCompareInsight(grouped)
    : null;

  return (
    <div className="space-y-6">
      {includeDetails && (
        <Card>
          <CardContent className="p-4 text-sm space-y-1">
            <p><span className="font-medium">Patient:</span> {patient.name}</p>
            {patient.dob && <p><span className="font-medium">Date of birth:</span> {new Date(patient.dob).toLocaleDateString()}</p>}
            {patient.gender && <p><span className="font-medium">Gender:</span> {patient.gender}</p>}
          </CardContent>
        </Card>
      )}

      {reports.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3">Reports</h2>
          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.laboratoryName || "Unknown lab"} •{" "}
                        {report.reportDate
                          ? new Date(report.reportDate).toLocaleDateString()
                          : "No date"}
                      </p>
                    </div>
                  </div>
                  {report.results.length > 0 && (
                    <div className="divide-y divide-border mt-2 border border-border rounded-lg overflow-hidden">
                      {report.results.map((r) => (
                        <div key={r.id} className="flex items-center justify-between px-3 py-2 text-sm">
                          <div className="min-w-0">
                            <p className="font-medium">{r.canonicalName}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <p className="text-sm font-medium">
                              {r.originalValue} {r.originalUnit || ""}
                            </p>
                            {r.flag && (
                              <StatusBadge tone={flagToTone(r.flag)} label={flagToLabel(r.flag)} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {compareInsight && (
        <Card className="bg-primary-light/30 border-primary/15">
          <CardContent className="p-4 space-y-2">
            <p className="font-semibold text-sm text-primary">AI Insight</p>
            {compareInsight.points.map((point, i) => (
              <p key={i} className="text-sm text-muted-foreground">{point}</p>
            ))}
            <p className="text-xs text-muted-foreground italic">{compareInsight.disclaimer}</p>
          </CardContent>
        </Card>
      )}

      {vitals.length > 0 && includeTimeline && (
        <div>
          <h2 className="text-base font-semibold mb-3">Recent Vitals</h2>
          <div className="space-y-2">
            {vitals.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                <span className="font-medium capitalize">{v.type.replace(/_/g, " ")}</span>
                <span>{v.value} {v.unit || ""}</span>
                <span className="text-muted-foreground text-xs">
                  {new Date(v.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reports.length === 0 && vitals.length === 0 && (
        <Card className="py-12 text-center">
          <p className="text-muted-foreground">No data shared yet.</p>
        </Card>
      )}
    </div>
  );
}