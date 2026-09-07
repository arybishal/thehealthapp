import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type Params = Promise<{ id: string }>;

export default async function ReportDetailRedirect({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const report = await prisma.report.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, patientId: true },
  });

  if (report) {
    redirect(`/patients/${report.patientId}/reports/${report.id}`);
  } else {
    redirect("/patients");
  }
}