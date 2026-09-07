import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { PatientForm } from "@/components/patients/patient-form";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

export default async function PatientEditPage({
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-1 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Edit Patient</h1>
        <p className="text-sm text-muted-foreground">
          Update {patient.name}&apos;s profile.
        </p>
      </div>
      <PatientForm patient={patient} />
    </div>
  );
}