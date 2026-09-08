"use client";

import Link from "next/link";
import {
  Activity,
  Droplets,
  FileText,
  FlaskConical,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { getInitials } from "@/lib/patients";

const TREND = [
  { m: "Jan", v: 5.4 },
  { m: "Feb", v: 5.5 },
  { m: "Mar", v: 5.4 },
  { m: "Apr", v: 5.6 },
  { m: "May", v: 5.5 },
  { m: "Jun", v: 5.7 },
];

function StatusChip({
  label,
  tone,
}: {
  label: string;
  tone: "normal" | "attention";
}) {
  const tones = {
    normal: "bg-success-light text-success",
    attention: "bg-warning-light text-warning",
  };
  const dots = {
    normal: "bg-success",
    attention: "bg-warning",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} />
      {label}
    </span>
  );
}

function ProductPreview() {
  const stats = [
    {
      icon: FileText,
      value: "24",
      label: "Medical Reports",
      accent: "bg-primary-light text-primary",
    },
    {
      icon: FlaskConical,
      value: "186",
      label: "Tracked Results",
      accent: "bg-secondary/10 text-secondary",
    },
    {
      icon: Activity,
      value: "18",
      label: "Tracked Biomarkers",
      accent: "bg-info-light text-info",
    },
  ];
  const results = [
    { name: "Hemoglobin", value: "14.2", unit: "g/dL", status: "Normal", tone: "normal" as const },
    { name: "Vitamin D", value: "28", unit: "ng/mL", status: "Attention", tone: "attention" as const },
    { name: "HbA1c", value: "5.7", unit: "%", status: "Normal", tone: "normal" as const },
  ];
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-[0_24px_70px_-30px_rgba(23,32,51,0.45)] md:p-6">
      {/* window bar */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#C98A1E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3b7dd8]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#2f9e6b]" />
        <span className="ml-3 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {`thebloodtracker.com/patients/bishal`}
        </span>
      </div>

      {/* patient row */}
      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-sm font-bold text-primary ring-1 ring-primary/10">
          {getInitials("Bishal Aryal")}
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-bold tracking-tight">
            Bishal Aryal
          </p>
          <p className="truncate text-sm text-muted-foreground">
            34 years · Male · O+
          </p>
        </div>
      </div>

      {/* stat tiles */}
      <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Health Overview
      </p>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border p-2.5"
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.accent}`}
            >
              <s.icon className="h-3.5 w-3.5" />
            </span>
            <p className="mt-2 text-lg font-bold leading-none">{s.value}</p>
            <p className="mt-1 text-[11px] font-medium leading-tight text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* latest results */}
      <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Latest Results
      </p>
      <div className="mt-2.5 divide-y divide-border rounded-xl border border-border">
        {results.map((r) => (
          <div key={r.name} className="flex items-center justify-between px-3 py-2.5">
            <div>
              <p className="text-sm font-semibold">{r.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {r.value} {r.unit}
              </p>
            </div>
            <StatusChip label={r.status} tone={r.tone} />
          </div>
        ))}
      </div>

      {/* mini chart */}
      <div className="mt-5 rounded-xl border border-border p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">
            HbA1c Trend
          </p>
          <TrendingUp className="h-3.5 w-3.5 text-secondary" />
        </div>
        <div className="mt-2 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TREND} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="hero-trend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d7c8a" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0d7c8a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#0d7c8a"
                strokeWidth={2}
                fill="url(#hero-trend)"
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute left-[-8%] top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-14 md:pt-20 lg:grid-cols-2">
        {/* Copy */}
        <div className="animate-fade-in">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-sm">
            <Droplets className="h-3.5 w-3.5" />
            Personal Health Records, Simplified
          </p>
          <h1 className="mt-6 text-[40px] font-bold leading-[1.08] tracking-tight md:text-6xl">
            Every Blood Test.{" "}
            <span className="text-primary">One Clear Health History.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-[17px]">
            Keep your blood reports, laboratory results, biomarkers, vitals, and
            medical history organized in one place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_2px_10px_-2px_rgba(37,99,235,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_10px_24px_-6px_rgba(37,99,235,0.55)]"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center rounded-lg border border-border bg-white px-6 py-3.5 text-[15px] font-semibold text-foreground transition-colors duration-200 hover:bg-muted"
            >
              Log In
            </Link>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            Free to use. Built to help you keep your health history organized.
          </p>
        </div>

        {/* Product preview */}
        <div className="animate-fade-in relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="animate-float">
            <ProductPreview />
          </div>
        </div>
      </div>
    </section>
  );
}