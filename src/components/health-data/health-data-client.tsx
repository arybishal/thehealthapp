"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Droplets,
  Gauge,
  HeartPulse,
  Microscope,
  Scale,
  Thermometer,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export interface LabGroup {
  canonicalName: string;
  displayName: string;
  category: string;
  count: number;
  latestValue: number | null;
  latestUnit: string;
  latestDate: string;
  previous: number | null;
}

export interface MeasurementGroup {
  type: string;
  displayName: string;
  count: number;
  lastValue: number;
  lastUnit: string;
  lastDate: string;
}

const measurementIcons: Record<string, typeof Scale> = {
  weight: Scale,
  height: Scale,
  blood_pressure: Gauge,
  heart_rate: HeartPulse,
  blood_sugar: Droplets,
  temperature: Thermometer,
};

function shortDate(d: string | null) {
  if (!d) return "No date";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function TrendDot({ latest, previous }: { latest: number | null; previous: number | null | undefined }) {
  if (latest === null || previous === null || previous === undefined) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  if (latest === previous) {
    return <span className="text-xs text-muted-foreground">→</span>;
  }
  return (
    <span className="text-xs font-semibold text-info">
      {latest > previous ? "↑" : "↓"}
    </span>
  );
}

export function HealthDataClient({
  biomarkers,
  measurements,
}: {
  biomarkers: LabGroup[];
  measurements: MeasurementGroup[];
}) {
  const [tab, setTab] = useState("lab");

  const labEmpty = biomarkers.length === 0;
  const measEmpty = measurements.length === 0;

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v)}>
      <TabsList variant="line">
        <TabsTrigger value="lab">Laboratory Results</TabsTrigger>
        <TabsTrigger value="measurements">Measurements</TabsTrigger>
      </TabsList>

      <TabsContent value="lab">
        {labEmpty ? (
          <EmptyState
            title="No laboratory results yet"
            sub="Upload a report to start building your laboratory result history."
          />
        ) : (
          <div className="divide-y border rounded-xl bg-card">
            {biomarkers.map((b) => (
              <Link
                key={b.canonicalName}
                href={`/biomarkers/${encodeURIComponent(b.canonicalName)}`}
                className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light/60 text-primary">
                  <Microscope className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{b.displayName}</p>
                    <span className="text-xs text-muted-foreground capitalize">
                      {b.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {b.count} {b.count === 1 ? "recorded result" : "recorded results"}
                    {b.latestDate ? ` • Latest ${shortDate(b.latestDate)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="font-semibold">
                      {b.latestValue ?? "—"}
                      {b.latestUnit && (
                        <span className="text-xs font-normal text-muted-foreground">
                          {" "}
                          {b.latestUnit}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Latest</p>
                  </div>
                  <TrendDot latest={b.latestValue} previous={b.previous} />
                  <ArrowRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="measurements">
        {measEmpty ? (
          <EmptyState
            title="No measurements yet"
            sub="Use Quick Add on the dashboard to record weight, blood pressure, heart rate, and more."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {measurements.map((m) => {
              const Icon = measurementIcons[m.type] ?? Activity;
              return (
                <Card key={m.type} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{m.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.count} {m.count === 1 ? "record" : "records"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">
                        {m.lastValue} {m.lastUnit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {shortDate(m.lastDate)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <Card className="py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light/60 text-primary">
        <Activity className="h-7 w-7" />
      </div>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto px-4">
        {sub}
      </p>
    </Card>
  );
}