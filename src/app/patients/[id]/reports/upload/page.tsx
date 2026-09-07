import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { UploadReportForm } from "./upload-form";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

export default async function PatientUploadPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, name: true },
  });
  if (!patient) notFound();

  return <UploadReportForm patientId={patient.id} patientName={patient.name} />;
}