import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PatientForm } from "@/components/patients/patient-form";

export const dynamic = "force-dynamic";

export default async function NewPatientPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-1 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Add Patient</h1>
        <p className="text-sm text-muted-foreground">
          Create a profile to start managing a patient&apos;s health records.
        </p>
      </div>
      <PatientForm />
    </div>
  );
}
