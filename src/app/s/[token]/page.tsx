import { prisma } from "@/lib/prisma";
import { isShareExpired } from "@/lib/shares";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import { ShareViewerContent } from "@/components/share-viewer-content";

type Params = Promise<{ token: string }>;

export const dynamic = "force-dynamic";

export default async function ShareViewerPage({ params }: { params: Params }) {
  const { token } = await params;

  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      patient: {
        select: { id: true, name: true, dob: true, gender: true },
      },
    },
  });

  if (!link) notFound();

  if (isShareExpired(link.expiresAt, link.revoked)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-warning mx-auto" />
          <h1 className="text-xl font-bold">Link unavailable</h1>
          <p className="text-sm text-muted-foreground">
            This share link has expired or been revoked by the account owner.
          </p>
        </Card>
      </div>
    );
  }

  await prisma.shareLink.update({
    where: { id: link.id },
    data: {
      lastAccessedAt: new Date(),
      accessCount: { increment: 1 },
    },
  });

  let reports: Array<{
    id: string;
    title: string;
    reportDate: Date | null;
    laboratoryName: string | null;
    results: Array<{
      id: string;
      canonicalName: string;
      originalValue: string;
      originalUnit: string | null;
      normalizedValue: number | null;
      referenceLow: number | null;
      referenceHigh: number | null;
      flag: string | null;
    }>;
  }> = [];

  if (link.includeReports) {
    reports = await prisma.report.findMany({
      where: { patientId: link.patientId },
      orderBy: { reportDate: "desc" },
      include: {
        results: link.includeResults,
      },
    });
  }

  const vitals = link.includeVitals
    ? await prisma.healthMeasurement.findMany({
        where: { patientId: link.patientId },
        orderBy: { date: "desc" },
        take: 20,
      })
    : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <h1 className="font-semibold">{link.patient.name}</h1>
            <p className="text-xs text-muted-foreground">
              Shared health records
              {link.label && ` — ${link.label}`}
            </p>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6">
        <ShareViewerContent
          patient={link.patient}
          reports={reports}
          vitals={vitals}
          includeTimeline={link.includeTimeline}
          includeInsights={link.includeInsights}
          includeDetails={link.includeDetails}
        />
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            This information was shared through The Blood Tracker. It is not
            a substitute for professional medical advice.
          </p>
        </div>
      </main>
    </div>
  );
}