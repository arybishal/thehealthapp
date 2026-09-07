import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReportList } from "@/components/reports/report-list";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

export default async function PatientReportsPage({
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

  const reports = await prisma.report.findMany({
    where: { patientId: id },
    orderBy: { createdAt: "desc" },
    include: { results: { select: { id: true } } },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Medical Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Reports for your patient&apos;s history.
          </p>
        </div>
        <Link
          href={`/patients/${id}/reports/upload`}
          className={buttonVariants({ size: "lg" })}
        >
          <Plus />
          Upload Report
        </Link>
      </div>

      {reports.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light/60 text-primary">
            <FileText className="h-7 w-7" />
          </div>
          <p className="mt-4 font-semibold">This patient&apos;s history starts here.</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto px-4">
            Upload the first medical report and turn it into structured health
            data.
          </p>
          <Link href={`/patients/${id}/reports/upload`} className="mt-5 inline-block">
            <Button>
              <Plus />
              Upload Report
            </Button>
          </Link>
        </Card>
      ) : (
        <ReportList
          patientId={id}
          reports={reports.map((r) => ({
            ...r,
            reportDate: r.reportDate?.toISOString() ?? null,
            createdAt: r.createdAt.toISOString(),
          }))}
        />
      )}
    </div>
  );
}