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
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
        >
          <span aria-hidden>&larr;</span> Back to Trends
        </Link>
      </div>

      <div>
        <h1 className="text-xl md:text-2xl font-bold">{displayName}</h1>
        <p className="text-muted-foreground capitalize">{category}</p>
      </div>

      {description && (
        <div className="bg-primary-light border border-primary/15 rounded-xl p-4 text-sm text-primary">
          <p className="font-semibold mb-1">About this test</p>
          <p>{description}</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sorted}>
              <CartesianGrid strokeDasharray="3 3" stroke={border} />
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
                    fill={danger}
                    fillOpacity={0.05}
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
                    fill={success}
                    fillOpacity={0.06}
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
                stroke={primary}
                strokeWidth={2}
                dot={{ r: 4, fill: primary, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
          {refHigh !== null && (
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 border-b border-dashed border-danger inline-block" />
              Upper reference ({refHigh} {unit})
            </span>
          )}
          {refLow !== null && (
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 border-b border-dashed border-primary inline-block" />
              Lower reference ({refLow} {unit})
            </span>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border font-semibold text-sm">
          Full History ({data.length} results)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Result</th>
                <th className="px-4 py-2 font-medium">Reference Range</th>
                <th className="px-4 py-2 font-medium">Status</th>
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
                  <tr key={d.id}>
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
