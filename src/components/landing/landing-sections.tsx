import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Download,
  Droplets,
  FileText,
  FlaskConical,
  FolderOpen,
  HeartPulse,
  KeyRound,
  ListChecks,
  Lock,
  Printer,
  Share2,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-[38px] md:leading-tight">
        {title}
      </h2>
      {body && (
        <p className="mt-4 text-base text-muted-foreground md:text-[17px]">
          {body}
        </p>
      )}
    </div>
  );
}

/* ── Trust strip ──────────────────────────────────────── */
export function TrustStrip() {
  const items = [
    { icon: FolderOpen, label: "Organize Your Reports" },
    { icon: ListChecks, label: "Track Your Results" },
    { icon: TrendingUp, label: "Understand Your History" },
    { icon: Users, label: "Manage Family Records" },
  ];
  return (
    <section className="border-y border-border bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-6 md:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-center gap-2.5 text-sm font-medium text-muted-foreground"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
              <item.icon className="h-4 w-4" />
            </span>
            {item.label}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── What is TheBloodTracker ──────────────────────────── */
export function AboutSection() {
  const scattered = [
    "PDF",
    "Lab Report",
    "Paper Document",
    "Email Attachment",
    "Hospital Record",
  ];
  const organized = [
    "Reports",
    "Results",
    "Biomarkers",
    "Vitals",
    "Timeline",
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="What is TheBloodTracker?"
          title="Your health records shouldn't live in scattered files."
          body="Blood reports often end up across email attachments, hospital portals, messaging apps, paper documents, and folders. TheBloodTracker brings those records together so you can build a clear, organized health history over time."
        />

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">
          <div>
            <p className="mb-4 text-sm font-semibold text-muted-foreground">
              Scattered Reports
            </p>
            <div className="flex flex-wrap gap-2">
              {scattered.map((s) => (
                <span
                  key={s}
                  className="rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-muted-foreground shadow-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <ArrowDown className="hidden h-5 w-5 md:block" />
              <ArrowRight className="h-5 w-5 md:hidden" />
            </span>
            <span className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md">
              <Droplets className="h-4 w-4" />
              TheBloodTracker
            </span>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold text-muted-foreground">
              Organized Health History
            </p>
            <div className="flex flex-wrap gap-2 rounded-2xl border border-primary/20 bg-primary-light/40 p-3">
              {organized.map((o) => (
                <span
                  key={o}
                  className="rounded-lg border border-border bg-white px-3.5 py-2 text-sm font-medium shadow-sm"
                >
                  {o}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ─────────────────────────────────────── */
export function HowItWorks() {
  const steps = [
    {
      n: "01",
      icon: UserPlus,
      title: "Create a Patient Profile",
      body: "Create your own profile or organize health records for family members.",
    },
    {
      n: "02",
      icon: Upload,
      title: "Add Your Reports",
      body: "Upload blood tests and laboratory reports.",
    },
    {
      n: "03",
      icon: FlaskConical,
      title: "Organize Your Health Data",
      body: "Keep lab results, biomarkers, vitals and medical information structured.",
    },
    {
      n: "04",
      icon: Activity,
      title: "See Your Health History",
      body: "Review results and trends over time in one place.",
    },
  ];
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="How It Works"
          title="Your health history, organized in four simple steps."
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="h-full rounded-2xl border border-border bg-background p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-widest text-muted-foreground">
                    {s.n}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
              {i < steps.length - 1 && (
                <span className="absolute -right-4 top-1/2 hidden h-px w-8 bg-border lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features ─────────────────────────────────────────── */
export function Features() {
  const features = [
    {
      icon: FileText,
      title: "Medical Reports",
      body: "Keep laboratory and medical reports organized in one place.",
      accent: "bg-primary-light text-primary",
    },
    {
      icon: FlaskConical,
      title: "Lab Results",
      body: "Track test names, results, units, reference ranges and dates.",
      accent: "bg-secondary/10 text-secondary",
    },
    {
      icon: Activity,
      title: "Biomarker Trends",
      body: "See how important health markers change over time.",
      accent: "bg-primary-light text-primary",
    },
    {
      icon: HeartPulse,
      title: "Vitals",
      body: "Keep blood pressure, heart rate, weight, glucose, temperature and other measurements together.",
      accent: "bg-secondary/10 text-secondary",
    },
    {
      icon: Users,
      title: "Family Profiles",
      body: "Manage health records for yourself and your family from one account.",
      accent: "bg-primary-light text-primary",
    },
    {
      icon: CalendarDays,
      title: "Health Timeline",
      body: "See important health records and events chronologically.",
      accent: "bg-secondary/10 text-secondary",
    },
    {
      icon: Printer,
      title: "Patient Summary",
      body: "Generate a clean printable summary of a patient's health information.",
      accent: "bg-primary-light text-primary",
    },
    {
      icon: FolderOpen,
      title: "Organized Health History",
      body: "Keep years of health information structured instead of scattered across files.",
      accent: "bg-secondary/10 text-secondary",
    },
  ];
  return (
    <section id="features" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to organize your health history."
        />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.accent}`}
              >
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-bold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Family ───────────────────────────────────────────── */
export function FamilySection() {
  const members = [
    { name: "Bishal Aryal", active: true },
    { name: "Wife", active: false },
    { name: "Father", active: false },
    { name: "Mother", active: false },
    { name: "Child", active: false },
  ];
  const recordTypes = [
    { icon: FileText, label: "Reports" },
    { icon: FlaskConical, label: "Lab Results" },
    { icon: HeartPulse, label: "Vitals" },
    { icon: CalendarDays, label: "Medical Details" },
    { icon: Activity, label: "Trends" },
    { icon: CalendarDays, label: "Timeline" },
    { icon: Printer, label: "Health Summary" },
  ];
  return (
    <section className="scroll-mt-24 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Family Management"
          title="One account. Multiple patient profiles."
          body="Organize health information for yourself and the people you care about without mixing their medical records."
        />

        <div className="mt-16 overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          <div className="hidden items-center gap-3 border-b border-border bg-white px-6 py-4 md:flex">
            {members.map((m) => (
              <button
                key={m.name}
                className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm transition-colors ${
                  m.active
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    m.active ? "bg-white/25" : "bg-primary-light text-primary"
                  }`}
                >
                  {m.name.split(" ").map((p) => p[0]).join("")}
                </span>
                {m.name}
              </button>
            ))}
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-5 md:gap-0 md:p-0">
            {members.map((m) => (
              <div
                key={m.name}
                className={`rounded-2xl border p-5 md:rounded-none md:border-0 md:border-r md:border-border md:last:border-r-0 ${
                  m.active
                    ? "border-primary/25 bg-white"
                    : "border-border bg-white/60"
                }`}
              >
                <p className="mb-4 text-sm font-bold md:hidden">
                  {m.name}
                  {m.active && (
                    <span className="ml-5 rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Viewing
                    </span>
                  )}
                </p>
                <ul className="space-y-2.5">
                  {recordTypes.map((r) => (
                    <li
                      key={r.label}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <r.icon className="h-4 w-4 text-primary/70" />
                      {r.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="border-t border-border bg-white px-6 py-3 text-sm text-muted-foreground">
            Each patient keeps an independent record — reports, results, vitals
            and history never mix between profiles.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Why TheBloodTracker ──────────────────────────────── */
export function WhySection() {
  const principles = [
    {
      icon: FolderOpen,
      title: "Organized",
      body: "Keep important health information structured and easy to find.",
    },
    {
      icon: TrendingUp,
      title: "Longitudinal",
      body: "See how your results change over months and years.",
    },
    {
      icon: UserRound,
      title: "Patient-Centered",
      body: "Keep each person's health information in a separate patient record.",
    },
  ];
  return (
    <section
      id="why-thebloodtracker"
      className="scroll-mt-24 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Why TheBloodTracker"
          title="Built around your health history."
        />
        <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-3">
          {principles.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border bg-white p-7 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-border"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <p.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold tracking-tight">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Privacy ──────────────────────────────────────────── */
export function PrivacySection() {
  const items = [
    {
      icon: Lock,
      title: "Private Patient Records",
      body: "Health records are stored under your account and scoped to the patient profiles you manage.",
    },
    {
      icon: KeyRound,
      title: "Secure Account Access",
      body: "Sign in with your own account to reach your health history.",
    },
    {
      icon: Share2,
      title: "Controlled Sharing",
      body: "Your records stay with you until you actively choose to share them.",
    },
    {
      icon: Download,
      title: "Data Export",
      body: "Download your original uploaded report files whenever you need them.",
    },
    {
      icon: Trash2,
      title: "Data Deletion",
      body: "You can delete reports, patient profiles and your account data.",
    },
  ];
  return (
    <section id="privacy" className="scroll-mt-24 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Privacy"
          title="Your health information deserves privacy."
          body="TheBloodTracker is designed around the idea that your health information should remain under your control."
        />
        <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-background p-6 transition-colors duration-200 hover:border-primary/25"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold tracking-tight">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-1">
            Read more in our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Free ─────────────────────────────────────────────── */
export function FreeSection() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-5 rounded-2xl border border-border bg-white px-8 py-7 md:flex-row">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <HeartPulse className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight">Free to use.</p>
              <p className="text-sm text-muted-foreground">
                No pricing plans, subscriptions or upgrades. Your health history,
                simply organized.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className={buttonVariants({ size: "lg" })}
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Final CTA ────────────────────────────────────────── */
export function FinalCtaSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0a6470] to-[#0d7c8a] px-8 py-16 text-center text-white md:py-20">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-[40px] md:leading-tight">
            Your health history deserves more than a folder full of PDFs.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base text-white/70 md:text-[17px]">
            Start organizing your reports, results and health information in one
            place.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-lg bg-white px-6 py-3 text-[15px] font-semibold text-[#0d7c8a] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-white/25 px-6 py-3 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-white/10"
            >
              Already have an account? Log In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}