import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { RemindersPanel } from "@/components/reminders-panel";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

export default async function PatientRemindersPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, name: true },
  });
  if (!patient) notFound();

  const reminders = await prisma.reminder.findMany({
    where: { patientId: id, userId: session.user.id },
    orderBy: { date: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Test Reminders
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Schedule follow-up blood tests and track upcoming reminders for {patient.name}.
        </p>
      </div>

      {reminders.length === 0 ? (
        <Card className="py-16 text-center">
          <Bell className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="mt-4 font-semibold">No reminders scheduled</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
            Create a reminder to track when your next blood test is due.
          </p>
        </Card>
      ) : (
        <RemindersPanel patientId={id} initialReminders={reminders} />
      )}
    </div>
  );
}