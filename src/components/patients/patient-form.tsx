"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BLOOD_GROUPS } from "@/lib/patients";
import type { Patient } from "../../../generated/prisma/client";
import { createPatient, updatePatient } from "@/lib/patientActions";

export function PatientForm({ patient }: { patient?: Patient }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!patient;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData(e.currentTarget);
      const result = isEdit ? await updatePatient(patient.id, fd) : await createPatient(fd);
      if (result && "error" in result && result.error) {
        setError(result.error);
      }
    });
  }

  function convertDateToInput(dateStr: string | Date | null | undefined) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  }

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-sm text-danger text-center rounded-lg border border-danger/25 bg-danger-light p-3">
          {error}
        </p>
      )}

      <Section title="Personal Information">
        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name <span className="text-danger">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={patient?.name ?? ""}
            required
            placeholder="Full name"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <select
              id="relationship"
              name="relationship"
              defaultValue={patient?.relationship ?? ""}
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select</option>
              {[
                "Self",
                "Father",
                "Mother",
                "Sister",
                "Brother",
                "Spouse",
                "Son",
                "Daughter",
                "Grandparent",
                "Other",
              ].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              defaultValue={convertDateToInput(patient?.dob)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              name="gender"
              defaultValue={patient?.gender ?? ""}
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bloodGroup">Blood Group</Label>
          <select
            id="bloodGroup"
            name="bloodGroup"
            defaultValue={patient?.bloodGroup ?? ""}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Select</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Contact Details">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={patient?.phone ?? ""}
              placeholder="+1 234 567 890"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={patient?.email ?? ""}
              placeholder="email@example.com"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            defaultValue={patient?.address ?? ""}
            placeholder="Home address"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            name="emergencyContact"
            defaultValue={patient?.emergencyContact ?? ""}
            placeholder="Name and phone number"
          />
        </div>
      </Section>

      <Section title="Physical Details">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              name="height"
              type="number"
              step="0.1"
              defaultValue={patient?.height ?? ""}
              placeholder="175"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              defaultValue={patient?.weight ?? ""}
              placeholder="70"
            />
          </div>
        </div>
      </Section>

      <Section title="Medical Details">
        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies</Label>
          <textarea
            id="allergies"
            name="allergies"
            rows={2}
            defaultValue={patient?.allergies ?? ""}
            placeholder="Known allergies, e.g. penicillin, peanuts"
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="conditions">Medical Conditions</Label>
          <textarea
            id="conditions"
            name="conditions"
            rows={2}
            defaultValue={patient?.conditions ?? ""}
            placeholder="Chronic conditions, diagnoses"
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="medications">Current Medications</Label>
          <textarea
            id="medications"
            name="medications"
            rows={2}
            defaultValue={patient?.medications ?? ""}
            placeholder="Active prescriptions"
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="surgeries">Previous Surgeries</Label>
          <textarea
            id="surgeries"
            name="surgeries"
            rows={2}
            defaultValue={patient?.surgeries ?? ""}
            placeholder="Surgical history"
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="familyHistory">Family Medical History</Label>
          <textarea
            id="familyHistory"
            name="familyHistory"
            rows={2}
            defaultValue={patient?.familyHistory ?? ""}
            placeholder="Relevant family medical history"
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          />
        </div>
      </Section>

      <Section title="Notes">
        <div className="space-y-2">
          <Label htmlFor="notes">Medical Notes</Label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={patient?.notes ?? ""}
            placeholder="Any important medical information"
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          />
        </div>
      </Section>

      <div className="flex gap-3 pt-2 pb-8">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          {isEdit ? "Save Changes" : "Create Patient"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}