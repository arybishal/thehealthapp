import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  FlaskConical,
  Activity,
  Plus,
  Users,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DemoGate } from "@/components/demo/demo-provider";
import { calcAge, getInitials } from "@/lib/patients";

export const dynamic = "force-dynamic";

export default async function PatientsListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const patients = await prisma.patient.findMany({
    where: { userId: session.user.id },
    include: { reports: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  const patientIds = patients.map((p) => p.id);

  const labResults = await prisma.labResult.findMany({
    where: { report: { patientId: { in: patientIds } } },
    select: { canonicalName: true, report: { select: { patientId: true } } },
  });

  const labCountByPatient = new Map<string, number>();
  const bioCountByPatient = new Map<string, Set<string>>();
  for (const r of labResults) {
    const pid = r.report.patientId;
    labCountByPatient.set(pid, (labCountByPatient.get(pid) ?? 0) + 1);
    if (!bioCountByPatient.has(pid)) bioCountByPatient.set(pid, new Set());
    bioCountByPatient.get(pid)!.add(r.canonicalName);
  }

  const stats = new Map(
    patientIds.map((id) => [
      id,
      {
        reports: patients.find((p) => p.id === id)!.reports.length,
        results: labCountByPatient.get(id) ?? 0,
        biomarkers: bioCountByPatient.get(id)?.size ?? 0,
      },
    ])
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Patients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage health records for each patient.
          </p>
        </div>
        <DemoGate>
          <Link href="/patients/new" className={buttonVariants({ size: "lg" })}>
            <Plus />
            Add Patient
          </Link>
        </DemoGate>
      </div>

      {patients.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light/60 text-primary">
            <Users className="h-7 w-7" />
          </div>
          <p className="mt-4 font-semibold">Add your first patient</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto px-4">
            Create a patient profile to start organizing their health records.
          </p>
          <DemoGate>
            <Link href="/patients/new" className="mt-5 inline-block">
              <Button>
                <Plus />
                Add Patient
              </Button>
            </Link>
          </DemoGate>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p) => {
            const s = stats.get(p.id)!;
            const initials = getInitials(p.name);
            const age = calcAge(p.dob);
            return (
              <Link key={p.id} href={`/patients/${p.id}/overview`}>
                <Card className="p-5 transition-all hover:shadow-elevated hover:border-primary/30 h-full">
                  <div className="flex items-start gap-4">
                    <span className="w-11 h-11 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{p.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {age != null ? `${age} years` : "—"}
                        {p.gender ? ` · ${p.gender}` : ""}
                        {p.bloodGroup ? ` · ${p.bloodGroup}` : ""}
                        {p.relationship ? ` · ${p.relationship}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {s.reports}
                      </p>
                      reports
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {s.results}
                      </p>
                      results
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {s.biomarkers}
                      </p>
                      biomarkers
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}