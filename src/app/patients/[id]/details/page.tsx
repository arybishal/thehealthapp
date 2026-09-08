import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  HeartPulse,
  Pencil,
  Phone,
  Ruler,
  StickyNote,
  User,
} from "lucide-react";
import type { ComponentType } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calcAge, calcBMI, genderLabel } from "@/lib/patients";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

function Section({
  title,
  icon: Icon,
  editHref,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border rounded-xl bg-card shadow-[0_1px_3px_rgba(24,39,75,0.04)]">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <CardTitle className="flex-1 text-base font-semibold">
          {title}
        </CardTitle>
        <Link
          href={editHref}
          className={`${buttonVariants({ variant: "ghost", size: "sm" })} text-muted-foreground`}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Link>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function FieldRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right break-words">
        {value || "—"}
      </span>
    </div>
  );
}

export default async function PatientDetailsPage({
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

  const editHref = `/patients/${id}/edit`;
  const age = calcAge(patient.dob);
  const bmi = calcBMI(patient.height, patient.weight);
  const dobFormatted = patient.dob
    ? new Date(patient.dob).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Medical Details</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Personal and medical information for this patient.
          </p>
        </div>
        <Link href={editHref} className={buttonVariants({ size: "sm" })}>
          <Pencil />
          Edit Details
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Section title="Personal Information" icon={User} editHref={`${editHref}#personal`}>
            <FieldRow label="Full Name" value={patient.name} />
            <FieldRow label="Date of Birth" value={dobFormatted} />
            <FieldRow label="Age" value={age != null ? `${age} years` : null} />
            <FieldRow label="Gender" value={genderLabel(patient.gender)} />
            <FieldRow label="Blood Group" value={patient.bloodGroup} />
          </Section>

          <Section title="Contact Details" icon={Phone} editHref={`${editHref}#contact`}>
            <FieldRow label="Phone" value={patient.phone} />
            <FieldRow label="Email" value={patient.email} />
            <FieldRow label="Address" value={patient.address} />
            <FieldRow label="Emergency Contact" value={patient.emergencyContact} />
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Physical Details" icon={Ruler} editHref={`${editHref}#physical`}>
            <FieldRow label="Height" value={patient.height ? `${patient.height} cm` : null} />
            <FieldRow label="Weight" value={patient.weight ? `${patient.weight} kg` : null} />
            <FieldRow label="BMI" value={bmi != null ? String(bmi) : null} />
          </Section>

          <Section title="Medical Details" icon={HeartPulse} editHref={`${editHref}#medical`}>
            <FieldRow label="Allergies" value={patient.allergies} />
            <FieldRow label="Medical Conditions" value={patient.conditions} />
            <FieldRow label="Medications" value={patient.medications} />
            <FieldRow label="Surgeries" value={patient.surgeries} />
            <FieldRow label="Family History" value={patient.familyHistory} />
          </Section>

          <Section title="Notes" icon={StickyNote} editHref={`${editHref}#notes`}>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">
              {patient.notes || "No notes."}
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}