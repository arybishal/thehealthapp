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
      {/* Identity header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <PatientAvatar name={patient.name} size="md" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{patient.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {meta.join(" · ") || "No details yet"}
            </p>
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

      <PatientNav patientId={patient.id} variant="horizontal" />

      <div>{children}</div>
    </div>
  );
}