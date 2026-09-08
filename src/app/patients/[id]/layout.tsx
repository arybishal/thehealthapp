import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PatientNav } from "@/components/patients/patient-nav";
import { PatientAvatar } from "@/components/patients/patient-switcher";
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
    age != null ? `${age} yrs` : null,
    genderLabel(patient.gender),
    patient.bloodGroup,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Identity header — premium card */}
      <div className="rounded-xl border bg-card shadow-[0_1px_3px_rgba(24,39,75,0.04)] hover:shadow-[0_8px_24px_-12px_rgba(24,39,75,0.12)] transition-shadow duration-200">
        <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <PatientAvatar name={patient.name} size="lg" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                {patient.name}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {meta.map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
                  >
                    {m}
                  </span>
                ))}
                {meta.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    No details yet
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/patients/${patient.id}/reports/upload`}
              className={buttonVariants({ size: "sm" })}
            >
              <Plus />
              Upload Report
            </Link>
            <Link
              href={`/patients/${patient.id}/edit`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Pencil />
              Edit
            </Link>
          </div>
        </div>
      </div>

      <PatientNav patientId={patient.id} variant="horizontal" />

      <div>{children}</div>
    </div>
  );
}