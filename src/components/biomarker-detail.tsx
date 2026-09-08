"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import Link from "next/link";
import { StatusBadge } from "@/components/status";
import { useEffect, useState } from "react";
import { buildResultInsight } from "@/lib/insights";
import type { InsightResultInput, InsightSeriesInput } from "@/lib/insights";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

function useTokenColor(variable: string, fallback: string): string {
  const [color, setColor] = useState(fallback);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();
    if (value) setColor(value);
  }, [variable]);
  return color;
}

interface DataPoint {
  id: string;
  date: string;
  displayDate: string;
  value: number;
  unit: string;
  refLow: number | null;
  refHigh: number | null;
  confidence: string;
  reportId: string;
}

interface BiomarkerDetailProps {
  canonicalName: string;
  displayName: string;
  category: string;
  description: string;
  data: DataPoint[];
  patientId?: string;
}

export function BiomarkerDetail({
  canonicalName,
  displayName,
  category,
  description,
  data,
  patientId,
}: BiomarkerDetailProps) {
  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const unit = data[0]?.unit || "";
  const refLow = data.find((d) => d.refLow !== null)?.refLow ?? null;
  const refHigh = data.find((d) => d.refHigh !== null)?.refHigh ?? null;

  // AI insight for the latest result compared to the previous one
  const latestPoint = sorted[sorted.length - 1];
  const previousPoint = sorted.length >= 2 ? sorted[sorted.length - 2] : null;
  const currentInput: InsightResultInput | null = latestPoint
    ? {
        canonicalName,
        originalValue: String(latestPoint.value),
        originalUnit: latestPoint.unit,
        normalizedValue: latestPoint.value,
        referenceLow: latestPoint.refLow,
        referenceHigh: latestPoint.refHigh,
        flag: latestPoint.refHigh !== null && latestPoint.value > latestPoint.refHigh
          ? "H"
          : latestPoint.refLow !== null && latestPoint.value < latestPoint.refLow
          ? "L"
          : null,
        resultDate: new Date(latestPoint.date),
      }
    : null;
  const prevInput: InsightSeriesInput | null = previousPoint
    ? {
        canonicalName,
        originalValue: String(previousPoint.value),
        originalUnit: previousPoint.unit,
        normalizedValue: previousPoint.value,
        referenceLow: previousPoint.refLow,
        referenceHigh: previousPoint.refHigh,
        resultDate: new Date(previousPoint.date),
      }
    : null;
  const insight = currentInput ? buildResultInsight(currentInput, prevInput) : null;

  const trendsHref = patientId
    ? `/patients/${patientId}/trends`
    : "/trends";
  const reportHref = (reportId: string) =>
    patientId
      ? `/patients/${patientId}/reports/${reportId}`
      : `/reports/${reportId}`;

  const primary = useTokenColor("--primary", "oklch(0.5 0.11 225)");
  const success = useTokenColor("--success", "oklch(0.55 0.13 160)");
  const danger = useTokenColor("--danger", "oklch(0.6 0.19 20)");
  const border = useTokenColor("--border", "oklch(0.92 0.012 225)");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={trendsHref}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors duration-200"
        >
          <span aria-hidden>&larr;</span> Back to Trends
        </Link>
      </div>

      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">{displayName}</h1>
        <p className="text-sm text-muted-foreground capitalize mt-0.5">{category}</p>
      </div>

      {description && (
        <div className="bg-primary-light/50 border border-primary/15 rounded-xl p-4 text-sm text-primary">
          <p className="font-semibold mb-1">About this test</p>
          <p>{description}</p>
        </div>
      )}

      {insight && insight.points.length > 0 && (
        <Card className="bg-info-light/50 border-info/15">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-info font-semibold text-sm">
              <Lightbulb className="h-4 w-4" />
              AI Interpretation
            </div>
            {insight.points.map((point, i) => (
              <p key={i} className="text-sm text-muted-foreground">{point}</p>
            ))}
            {insight.questions.map((q, i) => (
              <p key={i} className="text-sm text-primary/80 italic">{q}</p>
            ))}
            <p className="text-xs text-muted-foreground italic mt-2">{insight.disclaimer}</p>
          </CardContent>
        </Card>
      )}

      <div className="bg-card border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(24,39,75,0.04)]">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sorted}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.005 260)" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                width={50}
              />
              <Tooltip
                formatter={(value) => [`${Number(value)} ${unit}`, ""]}
                labelFormatter={(label) => `${label}`}
              />
              {refHigh !== null && (
                <>
                  <ReferenceArea
                    y1={refHigh}
                    y2={refLow !== null ? refHigh + (refHigh - refLow) : refHigh * 1.5}
                    fill="oklch(0.95 0.04 25)"
                    fillOpacity={0.5}
                    stroke="none"
                  />
                  <Line
                    type="monotone"
                    dataKey={() => refHigh}
                    stroke={danger}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={false}
                    strokeWidth={1}
                  />
                </>
              )}
              {refLow !== null && refHigh !== null && (
                <>
                  <ReferenceArea
                    y1={refLow}
                    y2={refHigh}
                    fill="oklch(0.97 0.005 260)"
                    fillOpacity={1}
                    stroke="none"
                  />
                  <Line
                    type="monotone"
                    dataKey={() => refLow}
                    stroke={primary}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={false}
                    strokeWidth={1}
                  />
                </>
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0d7c8a"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#0d7c8a", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
          {refHigh !== null && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b border-dashed border-danger inline-block" />
              Upper reference ({refHigh} {unit})
            </span>
          )}
          {refLow !== null && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b border-dashed border-primary inline-block" />
              Lower reference ({refLow} {unit})
            </span>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(24,39,75,0.04)]">
        <div className="px-4 py-3 border-b border-border font-semibold text-sm">
          Full History ({data.length} results)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Result</th>
                <th className="px-4 py-2.5 font-medium">Reference Range</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((d) => {
                const isHigh = d.refHigh !== null && d.value > d.refHigh;
                const isLow = d.refLow !== null && d.value < d.refLow;
                const refStr =
                  d.refLow !== null && d.refHigh !== null
                    ? `${d.refLow}\u2013${d.refHigh}`
                    : d.refLow !== null
                    ? `>${d.refLow}`
                    : d.refHigh !== null
                    ? `<${d.refHigh}`
                    : "Unknown";

                return (
                  <tr key={d.id} className="hover:bg-muted/50 transition-colors duration-200">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={reportHref(d.reportId)}
                        className="text-primary hover:underline"
                      >
                        {new Date(d.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      {d.value}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        {unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {refStr} {unit}
                    </td>
                    <td className="px-4 py-3">
                      {isHigh || isLow ? (
                        <StatusBadge
                          tone="danger"
                          label={isHigh ? "Outside range: High" : "Outside range: Low"}
                        />
                      ) : (
                        <StatusBadge tone="normal" label="Normal" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-warning-light border border-warning/30 rounded-xl p-4 text-sm text-warning">
        <p className="font-semibold mb-1">Medical Disclaimer</p>
        <p>
          This information is for reference only and should not replace medical
          advice. Please consult your healthcare provider about your results.
        </p>
      </div>
    </div>
  );
}
