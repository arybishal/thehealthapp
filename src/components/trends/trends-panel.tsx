"use client";

import { useState } from "react";
import { TrendCard } from "@/components/trend-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildCompareInsight } from "@/lib/insights";
import type { InsightSeriesInput } from "@/lib/insights";

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
  if (count === 1) return "all";
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
  const [compareSelected, setCompareSelected] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);

  const visible =
    filter === "all"
      ? items
      : items.filter((it) => {
          const cls = classify(it.data);
          if (filter === "multiple") return it.data.length > 1;
          return cls === filter;
        });

  function toggleCompare(name: string) {
    setCompareSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  // Build compare series map from selected items
  const compareSeriesMap: Record<string, InsightSeriesInput[]> = {};
  for (const item of items.filter((it) => compareSelected.has(it.canonicalName))) {
    compareSeriesMap[item.canonicalName] = item.data.map((d) => ({
      canonicalName: item.canonicalName,
      originalValue: String(d.value),
      originalUnit: d.unit,
      normalizedValue: d.value,
      referenceLow: d.refLow,
      referenceHigh: d.refHigh,
      resultDate: new Date(d.date),
    }));
  }

  const compareInsight = compareSelected.size >= 2
    ? buildCompareInsight(compareSeriesMap)
    : null;

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
          <button
            onClick={() => { setShowCompare(!showCompare); if (showCompare) setCompareSelected(new Set()); }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              showCompare
                ? "bg-info text-info-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Compare
          </button>
        </div>
        <p className="text-xs text-muted-foreground shrink-0">
          {visible.length} {visible.length === 1 ? "biomarker" : "biomarkers"}
        </p>
      </div>

      {showCompare && compareSelected.size >= 2 && compareInsight && (
        <Card className="bg-primary-light/30 border-primary/15 p-4 space-y-2">
          <p className="font-semibold text-sm text-primary">Comparison Insight</p>
          {compareInsight.points.map((point, i) => (
            <p key={i} className="text-sm text-muted-foreground">{point}</p>
          ))}
          {compareInsight.questions.map((q, i) => (
            <p key={i} className="text-sm text-primary/80 italic">{q}</p>
          ))}
          <p className="text-xs text-muted-foreground italic">{compareInsight.disclaimer}</p>
        </Card>
      )}

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
            <div key={item.canonicalName} className="relative">
              {showCompare && (
                <label className="absolute top-2 right-2 z-10 bg-card border rounded-full px-2 py-0.5 text-xs cursor-pointer flex items-center gap-1.5 shadow-sm">
                  <input
                    type="checkbox"
                    checked={compareSelected.has(item.canonicalName)}
                    onChange={() => toggleCompare(item.canonicalName)}
                    className="rounded"
                  />
                  Compare
                </label>
              )}
              <TrendCard
                canonicalName={item.canonicalName}
                displayName={item.displayName}
                category={item.category}
                data={item.data}
                referenceRange={
                  referenceRanges[item.canonicalName] ?? { low: null, high: null }
                }
                patientId={patientId}
              />
            </div>
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