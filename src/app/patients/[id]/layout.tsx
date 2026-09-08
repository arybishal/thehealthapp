import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PatientNav } from "@/components/patients/patient-nav";
import { PatientAvatar } from "@/components/patients/patient-switcher";
import { DemoGate } from "@/components/demo/demo-provider";
import { calcAge, genderLabel } from "@/lib/patients";

type Params = Promise<{ id: string }>;

export default async function PatientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { id, userId: session.user.id },
    include: {
      _count: { select: { reports: true, measurements: true } },
    },
  });

  if (!patient) notFound();

  const age = calcAge(patient.dob);
  const meta = [
    patient.relationship ?? null,
    genderLabel(patient.gender),
    age != null ? `${age} years` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Identity header */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex min-w-0 items-center gap-4">
            <PatientAvatar name={patient.name} size="lg" />
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold leading-[1.2] tracking-[-0.015em]">
                {patient.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium leading-[1.45] text-muted-foreground">
                <span className="truncate">
                  {meta.length > 0 ? meta.join(" · ") : "No details yet"}
                </span>
                {patient.bloodGroup ? (
                  <span className="inline-flex h-5 items-center rounded-md bg-primary-light px-1.5 text-xs font-semibold text-primary">
                    {patient.bloodGroup}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <DemoGate>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/patients/${patient.id}/edit`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Pencil />
                Edit Patient
              </Link>
              <Link
                href={`/patients/${patient.id}/reports/upload`}
                className={buttonVariants({ size: "sm" })}
              >
                <Plus />
                Upload Report
              </Link>
            </div>
          </DemoGate>
        </div>
      </div>

      <PatientNav patientId={patient.id} variant="horizontal" />

      <div>{children}</div>
    </div>
  );
}