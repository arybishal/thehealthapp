"use client";

import { useMemo, useState } from "react";
import { TrendingUp, Droplets } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DATA = [
  { m: "Jan 24", v: 5.6 },
  { m: "Mar 24", v: 5.5 },
  { m: "Jun 24", v: 5.4 },
  { m: "Sep 24", v: 5.5 },
  { m: "Dec 24", v: 5.3 },
  { m: "Mar 25", v: 5.4 },
  { m: "Jun 25", v: 5.6 },
  { m: "Sep 25", v: 5.8 },
  { m: "Dec 25", v: 5.6 },
  { m: "Mar 26", v: 5.7 },
];

const RANGES = [
  { key: "30d", label: "30 Days", n: 3 },
  { key: "90d", label: "90 Days", n: 5 },
  { key: "1y", label: "1 Year", n: 8 },
  { key: "all", label: "All", n: 10 },
];

function TooltipCard({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">
        {payload[0].value} %
      </p>
    </div>
  );
}

export function DataVisualization() {
  const [range, setRange] = useState("1y");

  const sliced = useMemo(() => {
    const n = RANGES.find((r) => r.key === range)?.n ?? DATA.length;
    return DATA.slice(-n);
  }, [range]);
  const last = sliced[sliced.length - 1];
  const prev = sliced[sliced.length - 2];
  const delta = last && prev ? Number((last.v - prev.v).toFixed(1)) : null;

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Health Data Visualization
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-[38px] md:leading-tight">
            See the story behind your numbers.
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-[17px]">
            A single test result tells you what happened once. A health history
            helps you see how things change over time.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {/* Main chart card */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold tracking-tight">HbA1c</h3>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    Glycated Hemoglobin
                  </span>
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {last?.v} <span className="text-base font-medium text-muted-foreground">%</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Previous: <span className="font-semibold text-foreground">{prev?.v} %</span>
                  {delta != null && (
                    <span
                      className={`ml-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        delta > 0
                          ? "bg-warning-light text-warning"
                          : "bg-success-light text-success"
                      }`}
                    >
                      {delta > 0 ? "▲" : "▼"} {Math.abs(delta)} %
                    </span>
                  )}
                </p>
              </div>

              {/* Range control */}
              <div className="flex rounded-lg border border-border bg-muted/50 p-1">
                {RANGES.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setRange(r.key)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                      range === r.key
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sliced} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hba1c" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d7c8a" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#0d7c8a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e8eb" vertical={false} />
                  {/* reference band */}
                  <ReferenceArea
                    y1={4}
                    y2={5.6}
                    fill="#2f9e6b"
                    fillOpacity={0.07}
                    stroke="#2f9e6b"
                    strokeOpacity={0.2}
                    strokeDasharray="4 4"
                    label={{
                      value: "Reference range",
                      position: "insideTopLeft",
                      fontSize: 11,
                      fill: "#5c717a",
                    }}
                  />
                  <XAxis
                    dataKey="m"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#5c717a" }}
                  />
                  <YAxis
                    domain={[4.5, 6]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#5c717a" }}
                    unit="%"
                  />
                  <Tooltip content={<TooltipCard />} />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#0d7c8a"
                    strokeWidth={2.5}
                    fill="url(#hba1c)"
                    animationDuration={700}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary biomarker card */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold tracking-tight">Vitamin D</h3>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-light text-warning">
                  <Droplets className="h-4.5 w-4.5" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight">
                28 <span className="text-base font-medium text-muted-foreground">ng/mL</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Previous: <span className="font-semibold text-foreground">31 ng/mL</span>
                <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-warning-light px-2 py-0.5 text-xs font-semibold text-warning">
                  ▼ 3 ng/mL
                </span>
              </p>
              <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                Tracked alongside hemoglobin, glucose, cholesterol and many more
                markers from your reports.
              </p>
            </div>

            <div className="flex flex-1 flex-col justify-center rounded-2xl border border-primary/15 bg-primary-light/40 p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <TrendingUp className="h-5 w-5" />
              </span>
              <p className="mt-4 text-sm font-semibold text-foreground">
                Longitudinal tracking
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Every uploaded report adds to the same history, so trends build
                up over months and years — not a single snapshot.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}