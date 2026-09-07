import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { findBiomarkerByName } from "@/lib/biomarkers";
import { BiomarkerDetail } from "@/components/biomarker-detail";

type Params = Promise<{ id: string; biomarker: string }>;

export default async function PatientBiomarkerPage({
  params,
}: {
  params: Params;
}) {
  const { id, biomarker } = await params;
  const canonicalName = decodeURIComponent(biomarker);

  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!patient) notFound();

  const meta = findBiomarkerByName(canonicalName);
  if (!meta) notFound();

  const results = await prisma.labResult.findMany({
    where: {
      report: { patientId: id },
      canonicalName,
    },
    orderBy: { createdAt: "desc" },
    include: { report: true },
  });

  if (results.length === 0) notFound();

  const data = results.map((r) => {
    const date = r.resultDate || r.createdAt;
    return {
      id: r.id,
      date: date.toISOString().slice(0, 10),
      displayDate: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      }),
      value: r.normalizedValue ?? 0,
      unit: r.normalizedUnit || r.originalUnit || "unit",
      refLow: r.referenceLow,
      refHigh: r.referenceHigh,
      confidence: r.confidence,
      reportId: r.reportId,
    };
  });

  return (
    <BiomarkerDetail
      canonicalName={meta.canonicalName}
      displayName={meta.displayName}
      category={meta.category}
      description={meta.description}
      data={data}
      patientId={id}
    />
  );
}