"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Chart colors follow the design tokens in globals.css. CSS variables do not
// resolve inside SVG presentation attributes, so read them once mounted; the
// fallbacks match the light-theme token values.
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

function useChartColors() {
  const primary = useTokenColor("--primary", "oklch(0.5 0.11 225)");
  const success = useTokenColor("--success", "oklch(0.55 0.13 160)");
  const danger = useTokenColor("--danger", "oklch(0.6 0.19 20)");
  const border = useTokenColor("--border", "oklch(0.92 0.012 225)");
  return { primary, success, danger, border };
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

interface TrendCardProps {
  canonicalName: string;
  displayName: string;
  category: string;
  data: DataPoint[];
  referenceRange: { low: number | null; high: number | null };
  patientId?: string;
}

function getTrend(data: DataPoint[]): { direction: "up" | "down" | "flat" | "none"; delta: string } {
  if (data.length < 2) return { direction: "none", delta: "" };
  const first = data[data.length - 1].value;
  const last = data[0].value;
  const delta = last - first;
  const pct = Math.abs((delta / first) * 100);
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  return { direction, delta: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} (${pct.toFixed(1)}%)` };
}

export function TrendCard({ canonicalName, displayName, category, data, referenceRange, patientId }: TrendCardProps) {
  const { primary, success, danger, border } = useChartColors();
  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const unit = data[0]?.unit || "";
  const latest = data[0]?.value;
  const previous = data[1]?.value ?? null;
  const change =
    latest != null && previous != null ? Number((latest - previous).toFixed(2)) : null;
  const changeLabel =
    change === null
      ? "No previous result"
      : change === 0
      ? "Stable compared with previous result"
      : change > 0
      ? "Changed (+" + change + ") from previous result"
      : "Changed (" + change + ") from previous result";

  const biomarkerHref = patientId
    ? `/patients/${patientId}/results/${encodeURIComponent(canonicalName)}`
    : `/biomarkers/${encodeURIComponent(canonicalName)}`;

  return (
    <Card className="hover:-translate-y-px transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary">
              {category}
            </div>
            <CardTitle className="text-base">{displayName}</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">
            {data.length} {data.length === 1 ? "result" : "results"}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 1 ? (
          <div className="text-center py-6">
            <p className="text-3xl font-bold">
              {data[0].value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">{data[0].displayDate}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              Upload more reports to see trends
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Latest</p>
                <p className="text-2xl font-bold">
                  {latest != null ? latest : "—"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">{unit}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Previous: {previous != null ? `${previous} ${unit}` : "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Change</p>
                <p
                  className={`text-lg font-semibold ${
                    change === null
                      ? "text-muted-foreground"
                      : change > 0
                      ? "text-danger"
                      : change < 0
                      ? "text-success"
                      : "text-info"
                  }`}
                >
                  {change === null
                    ? "—"
                    : `${change > 0 ? "+" : ""}${change}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[160px]">
                  {changeLabel}
                </p>
              </div>
            </div>
            <div className="h-48">
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
                    width={40}
                  />
                  <Tooltip
                    formatter={(value) => [`${Number(value)} ${unit}`, ""]}
                    labelFormatter={(label) => `${label}`}
                  />
                  {referenceRange.high !== null && (
                    <ReferenceArea
                      y1={referenceRange.high}
                      y2={referenceRange.high * 2}
                      fill="oklch(0.95 0.04 25)"
                      fillOpacity={0.5}
                      stroke="none"
                    />
                  )}
                  {referenceRange.low !== null && referenceRange.high !== null && (
                    <ReferenceArea
                      y1={referenceRange.low}
                      y2={referenceRange.high}
                      fill="oklch(0.97 0.005 260)"
                      fillOpacity={1}
                      stroke="none"
                    />
                  )}
                  {referenceRange.high !== null && (
                    <Line
                      type="monotone"
                      dataKey={() => referenceRange.high}
                      stroke={danger}
                      strokeDasharray="4 4"
                      dot={false}
                      activeDot={false}
                      strokeWidth={1}
                    />
                  )}
                  {referenceRange.low !== null && (
                    <Line
                      type="monotone"
                      dataKey={() => referenceRange.low}
                      stroke={primary}
                      strokeDasharray="4 4"
                      dot={false}
                      activeDot={false}
                      strokeWidth={1}
                    />
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
            <div className="mt-4">
              <Link
                href={biomarkerHref}
                className="text-sm text-primary hover:underline"
              >
                View full history →
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
