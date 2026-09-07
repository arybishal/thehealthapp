import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, flagToTone, flagToLabel } from "@/components/status";

const sampleResults = [
  { name: "Hemoglobin", value: "14.2 g/dL", ref: "13.0 - 17.0", flag: null, trend: "→" },
  { name: "WBC", value: "7.2 ×10⁹/L", ref: "4.0 - 11.0", flag: null, trend: "→" },
  { name: "Platelets", value: "245 ×10⁹/L", ref: "150 - 450", flag: null, trend: "→" },
  { name: "HbA1c", value: "5.8 %", ref: "4.0 - 5.6", flag: "H", trend: "↑" },
  { name: "Vitamin D", value: "28.0 ng/mL", ref: "30.0 - 100.0", flag: "L", trend: "↓" },
  { name: "Total Cholesterol", value: "198 mg/dL", ref: "< 200", flag: null, trend: "→" },
];

const sampleReports = [
  { title: "Annual Health Checkup", lab: "City General Diagnostics", date: "Aug 15, 2026", n: 24 },
  { title: "Thyroid Function Panel", lab: "MedLife Pathology", date: "Jun 02, 2026", n: 5 },
  { title: "Lipid Profile", lab: "City General Diagnostics", date: "Mar 11, 2026", n: 4 },
];

const sampleTimeline = [
  { date: "Aug 2026", events: ["Annual Health Checkup - 24 results", "Vitamin D flagged low"] },
  { date: "Jun 2026", events: ["Thyroid Function Panel - 5 results"] },
  { date: "Mar 2026", events: ["Lipid Profile - 4 results"] },
];

const sampleTrends = [
  { name: "HbA1c", values: [5.9, 5.7, 5.6, 5.8, 5.8, 5.7, 5.8], refLow: 4.0, refHigh: 5.6, unit: "%" },
  { name: "Vitamin D", values: [22, 24, 27, 25, 28, 26, 28], refLow: 30, refHigh: 100, unit: "ng/mL" },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">TheBloodTracker</h1>
            <p className="text-muted-foreground">
              A live preview of how your health history comes together
            </p>
          </div>
          <Link href="/login">
            <Button>Sign in to your account</Button>
          </Link>
        </header>

        {/* Hero */}
        <section className="rounded-2xl bg-white border p-8 text-center">
          <h2 className="text-2xl font-bold">
            Upload a blood report. See your health history.
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            TheBloodTracker extracts your lab results from PDFs and images with
            OCR, normalizes biomarker names and units, and charts them over time
            against clinical reference ranges.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            {["OCRs PDF & images", "50+ biomarkers", "Trend charts", "Reference range flags"].map(
              (f) => (
                <span
                  key={f}
                  className="px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-700"
                >
                  {f}
                </span>
              )
            )}
          </div>
        </section>

        {/* Dashboard glimpse */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Dashboard &amp; Latest Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {[
              ["Reports", "12"],
              ["Tracked Results", "86"],
              ["Biomarkers", "31"],
              ["Abnormal flags", "3"],
            ].map(([label, value]) => (
              <Card key={label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Results</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Biomarker</th>
                      <th className="px-4 py-2 font-medium">Latest</th>
                      <th className="px-4 py-2 font-medium">Reference</th>
                      <th className="px-4 py-2 font-medium">Flag</th>
                      <th className="px-4 py-2 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sampleResults.map((r) => (
                      <tr key={r.name}>
                        <td className="px-4 py-3 font-medium">{r.name}</td>
                        <td className="px-4 py-3">{r.value}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.ref}</td>
                        <td className="px-4 py-3">
                          {r.flag ? (
                            <StatusBadge
                              tone={flagToTone(r.flag)}
                              label={flagToLabel(r.flag)}
                            />
                          ) : (
                            <StatusBadge tone="normal" label="Normal" />
                          )}
                        </td>
                        <td className="px-4 py-3">{r.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Reports */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Your Report Library</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleReports.map((rep) => (
              <Card key={rep.title}>
                <CardHeader>
                  <CardTitle className="text-base">{rep.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {rep.lab} • {rep.date}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    <span className="font-semibold">{rep.n}</span> results extracted
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Timeline + Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <h3 className="text-lg font-semibold mb-3">Timeline</h3>
            <Card>
              <CardContent className="p-6 space-y-5">
                {sampleTimeline.map((t) => (
                  <div key={t.date}>
                    <p className="font-semibold text-sm text-muted-foreground">
                      {t.date}
                    </p>
                    <div className="mt-2 space-y-2">
                      {t.events.map((e) => (
                        <div
                          key={e}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          {e}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Trend Spotlight</h3>
            {sampleTrends.map((t) => {
              const max = Math.max(...t.values) * 1.1;
              const min = Math.min(...t.values) * 0.9;
              return (
                <Card key={t.name} className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      {t.name} ({t.unit})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-1 h-24">
                      {t.values.map((v, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-t ${
                            v > t.refHigh
                              ? "bg-danger"
                              : v < t.refLow
                              ? "bg-info"
                              : "bg-primary"
                          }`}
                          style={{
                            height: `${((v - min) / (max - min)) * 100}%`,
                          }}
                          title={`${v} ${t.unit}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Reference: {t.refLow}–{t.refHigh} {t.unit}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        </div>

        {/* CTA */}
        <section className="rounded-2xl bg-white border p-8 text-center">
          <h2 className="text-xl font-bold">This is just a preview</h2>
          <p className="text-muted-foreground mt-2">
            Sign up free and upload your real reports to unlock everything — or
            register with the demo account to explore an empty workspace.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Link href="/register">
              <Button size="lg">Create your account</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
