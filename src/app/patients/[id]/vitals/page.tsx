import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Activity, Droplets, Gauge, HeartPulse, Plus, Scale, Thermometer } from "lucide-react";
import type { ComponentType } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickAdd } from "@/components/dashboard/quick-add";
import { AddMeasurementForm } from "./add-measurement-form";
import { calcBMI } from "@/lib/patients";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

const measurementMeta: Record<string, { label: string; icon: ComponentType<{ className?: string }> }> = {
  weight: { label: "Weight", icon: Scale },
  height: { label: "Height", icon: Scale },
  bmi: { label: "BMI", icon: Scale },
  blood_pressure: { label: "Blood Pressure", icon: Gauge },
  heart_rate: { label: "Heart Rate", icon: HeartPulse },
  blood_sugar: { label: "Blood Glucose", icon: Droplets },
  temperature: { label: "Temperature", icon: Thermometer },
};

export default async function PatientVitalsPage({
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

  const measurements = await prisma.healthMeasurement.findMany({
    where: { patientId: id },
    orderBy: { date: "desc" },
  });

  const bmi = calcBMI(patient.height, patient.weight);
  const physicalRows = [
    { label: "Height", value: patient.height ? `${patient.height} cm` : null },
    { label: "Weight", value: patient.weight ? `${patient.weight} kg` : null },
    { label: "BMI", value: bmi != null ? String(bmi) : null },
  ].filter((r) => r.value !== null);

  const grouped = new Map<string, typeof measurements>();
  for (const m of measurements) {
    if (!grouped.has(m.type)) grouped.set(m.type, []);
    grouped.get(m.type)!.push(m);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Vitals & Measurements</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Recorded health measurements for this patient.
        </p>
      </div>

      {physicalRows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Current Physical Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {physicalRows.map((r) => (
              <div
                key={r.label}
                className="rounded-xl bg-primary-light/50 px-4 py-3 flex flex-col gap-1"
              >
                <p className="text-xs text-muted-foreground">{r.label}</p>
                <p className="text-2xl font-bold text-foreground">{r.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Add</CardTitle>
        </CardHeader>
        <CardContent>
          <QuickAdd patientId={id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Add Measurement</CardTitle>
          <span className="text-xs text-muted-foreground">
            Full record with any measurement type
          </span>
        </CardHeader>
        <CardContent>
          <AddMeasurementForm patientId={id} />
        </CardContent>
      </Card>

      {measurements.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light/60 text-primary">
            <Activity className="h-7 w-7" />
          </div>
          <p className="mt-4 font-semibold">No measurements recorded yet</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto px-4">
            Use Quick Add or the form above to record vital signs and health
            measurements.
          </p>
        </Card>
      ) : (
        [...grouped.entries()].map(([type, list]) => {
          const meta = measurementMeta[type];
          const Icon = meta?.icon ?? Activity;
          return (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                    <Icon className="h-4 w-4" />
                  </span>
                  {meta?.label ?? type.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}
                  <span className="text-xs font-normal text-muted-foreground ml-auto">
                    {list.length} {list.length === 1 ? "record" : "records"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {list.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors duration-200"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {new Date(m.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        {m.note && (
                          <p className="text-xs text-muted-foreground truncate">
                            {m.note}
                          </p>
                        )}
                      </div>
                      <p className="font-bold shrink-0">
                        {m.value} <span className="text-sm font-normal text-muted-foreground">{m.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}