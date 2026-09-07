import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { PrintButton } from "./print-button";
import { StatusBadge, flagToTone, flagToLabel } from "@/components/status";
import { calcAge, calcBMI, genderLabel } from "@/lib/patients";
import { getReportCategoryLabel } from "@/lib/biomarkers";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

const longDate = (d: Date | string | null | undefined) => {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default async function PatientSummaryPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!patient) notFound();

  const [reports, latestResults, measurements] = await Promise.all([
    prisma.report.findMany({
      where: { patientId: id },
      orderBy: { createdAt: "desc" },
      include: { results: true },
      take: 50,
    }),
    (async () => {
      const results = await prisma.labResult.findMany({
        where: { report: { patientId: id } },
        orderBy: { createdAt: "desc" },
        select: {
          canonicalName: true,
          normalizedValue: true,
          normalizedUnit: true,
          originalUnit: true,
          referenceLow: true,
          referenceHigh: true,
          resultDate: true,
          createdAt: true,
        },
      });
      const latestMap = new Map<
        string,
        {
          value: number | null;
          unit: string;
          date: Date;
          refLow: number | null;
          refHigh: number | null;
        }
      >();
      for (const r of results) {
        if (!latestMap.has(r.canonicalName)) {
          latestMap.set(r.canonicalName, {
            value: r.normalizedValue,
            unit: r.normalizedUnit || r.originalUnit || "",
            date: r.resultDate || r.createdAt,
            refLow: r.referenceLow,
            refHigh: r.referenceHigh,
          });
        }
      }
      return [...latestMap.entries()].map(([name, v]) => ({
        name,
        ...v,
      }));
    })(),
    prisma.healthMeasurement.findMany({
      where: { patientId: id },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  const age = calcAge(patient.dob);
  const bmi = calcBMI(patient.height, patient.weight);
  const totalReports = reports.length;
  const totalResults = reports.reduce((sum, r) => sum + r.results.length, 0);
  const generatedAt = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 print-hidden">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Patient Health Summary</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            A concise printable overview of this patient&apos;s health record.
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-2xl font-bold">{patient.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {age != null ? `${age} years` : "—"}
              {patient.gender ? ` · ${genderLabel(patient.gender)}` : ""}
              {patient.bloodGroup ? ` · Blood Group ${patient.bloodGroup}` : ""}
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p className="font-semibold text-foreground text-sm">TheBloodTracker</p>
            <p className="mt-1">Generated {longDate(generatedAt)}</p>
          </div>
        </div>

        {/* At a glance */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-border text-center">
          <div>
            <p className="text-2xl font-bold">{totalReports}</p>
            <p className="text-xs text-muted-foreground">Reports</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totalResults}</p>
            <p className="text-xs text-muted-foreground">Lab Results</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{latestResults.length}</p>
            <p className="text-xs text-muted-foreground">Biomarkers</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{measurements.length}</p>
            <p className="text-xs text-muted-foreground">Measurements</p>
          </div>
        </div>

        {/* Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 py-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Contact
            </h3>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{patient.phone || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Email</dt>
                <dd>{patient.email || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Address</dt>
                <dd>{patient.address || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Emergency Contact</dt>
                <dd>{patient.emergencyContact || "—"}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Physical
            </h3>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Height</dt>
                <dd>{patient.height ? `${patient.height} cm` : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Weight</dt>
                <dd>{patient.weight ? `${patient.weight} kg` : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">BMI</dt>
                <dd>{bmi != null ? String(bmi) : "—"}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Medical overview */}
        <div className="border-t border-border py-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Medical Overview
          </h3>
          <dl className="space-y-1 text-sm">
            <div>
              <dt className="text-muted-foreground inline">Allergies: </dt>
              <dd className="inline">{patient.allergies || "None recorded"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground inline">Conditions: </dt>
              <dd className="inline">{patient.conditions || "None recorded"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground inline">Medications: </dt>
              <dd className="inline">{patient.medications || "None recorded"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground inline">Surgeries: </dt>
              <dd className="inline">{patient.surgeries || "None recorded"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground inline">Family History: </dt>
              <dd className="inline">{patient.familyHistory || "None recorded"}</dd>
            </div>
          </dl>
        </div>

        {/* Latest results */}
        <div className="border-t border-border py-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Latest Laboratory Results
          </h3>
          {latestResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">No lab results recorded.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Biomarker</th>
                  <th className="py-2 pr-4 font-medium">Result</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {latestResults.map((r) => {
                  let flag: string | null = null;
                  if (
                    r.value !== null &&
                    r.refLow !== null &&
                    r.value < r.refLow
                  )
                    flag = "L";
                  if (
                    r.value !== null &&
                    r.refHigh !== null &&
                    r.value > r.refHigh
                  )
                    flag = "H";
                  return (
                    <tr key={r.name}>
                      <td className="py-2 pr-4 font-medium">{r.name}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {r.value ?? "—"}
                        {r.unit && (
                          <span className="text-xs text-muted-foreground">
                            {" "}
                            {r.unit}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        {longDate(r.date)}
                      </td>
                      <td className="py-2">
                        {flag ? (
                          <StatusBadge
                            tone={flagToTone(flag)}
                            label={flagToLabel(flag)}
                          />
                        ) : (
                          <StatusBadge tone="normal" label="In range" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent measurements */}
        <div className="border-t border-border py-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Recent Measurements
          </h3>
          {measurements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No measurements recorded.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Value</th>
                  <th className="py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {measurements.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2 pr-4 capitalize">
                      {m.type.split("_").join(" ")}
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {m.value} {m.unit}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {longDate(m.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Report history */}
        <div className="border-t border-border py-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Report History
          </h3>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reports recorded.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Title</th>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium">Laboratory</th>
                  <th className="py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 pr-4 font-medium">{r.title}</td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {getReportCategoryLabel(r.reportType)}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {r.laboratoryName || "—"}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {longDate(r.reportDate || r.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-xs text-muted-foreground border-t border-border pt-4 mt-4">
          This summary is generated for reference only and does not replace
          professional medical advice. Consult a healthcare provider for
          interpretation of results.
        </p>
      </div>
    </div>
  );
}