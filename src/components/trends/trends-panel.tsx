"use client";

import { useState } from "react";
import { TrendCard } from "@/components/trend-card";
import { Card } from "@/components/ui/card";

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

interface TrendItem {
  canonicalName: string;
  displayName: string;
  category: string;
  data: DataPoint[];
}

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "changed", label: "Recently Changed" },
  { value: "stable", label: "Stable" },
  { value: "multiple", label: "Multiple Records" },
];

function classify(data: DataPoint[]): string {
  const count = data.length;
  const latest = data[0]?.value;
  const previous = data[1]?.value;
  if (count === 0) return "all";
  if (count === 1) return "all"; // single record, no trend
  if (latest === previous) return "stable";
  return "changed";
}

export function TrendsPanel({
  items,
  referenceRanges,
  patientId,
}: {
  items: TrendItem[];
  referenceRanges: Record<string, { low: number | null; high: number | null }>;
  patientId?: string;
}) {
  const [filter, setFilter] = useState("all");

  const visible =
    filter === "all"
      ? items
      : items.filter((it) => {
          const cls = classify(it.data);
          if (filter === "multiple") return it.data.length > 1;
          return cls === filter;
        });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground shrink-0">
          {visible.length} {visible.length === 1 ? "biomarker" : "biomarkers"}
        </p>
      </div>

      {visible.length === 0 ? (
        <Card className="py-14 text-center">
          <p className="font-semibold">No biomarkers match this filter.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different filter to see more trends.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visible.map((item) => (
            <TrendCard
              key={item.canonicalName}
              canonicalName={item.canonicalName}
              displayName={item.displayName}
              category={item.category}
              data={item.data}
              referenceRange={
                referenceRanges[item.canonicalName] ?? { low: null, high: null }
              }
              patientId={patientId}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Reference ranges shown on charts come from the original laboratory
        report.
      </p>
    </div>
  );
}