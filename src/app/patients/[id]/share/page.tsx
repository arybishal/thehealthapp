import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ShareLinksManager } from "@/components/share-links-manager";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

export default async function PatientSharePage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, name: true },
  });
  if (!patient) notFound();

  const links = await prisma.shareLink.findMany({
    where: { userId: session.user.id, patientId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      token: true,
      label: true,
      includeReports: true,
      includeResults: true,
      includeVitals: true,
      includeDetails: true,
      includeTimeline: true,
      includeInsights: true,
      expiresAt: true,
      revoked: true,
      createdAt: true,
      lastAccessedAt: true,
      accessCount: true,
      patient: { select: { name: true, id: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Share Health Data</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Create secure links to share {patient.name}&apos;s health records with
          doctors, family, or caregivers.
        </p>
      </div>

      <ShareLinksManager
        patientId={id}
        patientName={patient.name}
        initialLinks={links}
      />
    </div>
  );
}