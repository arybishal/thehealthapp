"use server";

import { prisma } from "./prisma";
import { requireUser } from "./session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function text(formData: FormData, key: string): string | null {
  const v = (formData.get(key) as string)?.trim();
  return v ? v : null;
}

function number(formData: FormData, key: string): number | null {
  const v = (formData.get(key) as string)?.trim();
  if (!v) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function date(formData: FormData, key: string): Date | null {
  const v = (formData.get(key) as string);
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createPatient(formData: FormData) {
  const user = await requireUser();

  const name = text(formData, "name");
  if (!name) return { error: "Full name is required" };

  const patient = await prisma.patient.create({
    data: {
      userId: user.id,
      name,
      dob: date(formData, "dob"),
      gender: text(formData, "gender"),
      bloodGroup: text(formData, "bloodGroup"),
      phone: text(formData, "phone"),
      email: text(formData, "email"),
      address: text(formData, "address"),
      emergencyContact: text(formData, "emergencyContact"),
      height: number(formData, "height"),
      weight: number(formData, "weight"),
      allergies: text(formData, "allergies"),
      conditions: text(formData, "conditions"),
      medications: text(formData, "medications"),
      surgeries: text(formData, "surgeries"),
      familyHistory: text(formData, "familyHistory"),
      notes: text(formData, "notes"),
    },
  });

  revalidatePath("/patients");
  redirect(`/patients/${patient.id}/overview`);
}

export async function updatePatient(patientId: string, formData: FormData) {
  const user = await requireUser();

  const existing = await prisma.patient.findFirst({
    where: { id: patientId, userId: user.id },
  });
  if (!existing) return { error: "Patient not found" };

  const name = text(formData, "name");
  if (!name) return { error: "Full name is required" };

  await prisma.patient.update({
    where: { id: patientId },
    data: {
      name,
      dob: date(formData, "dob"),
      gender: text(formData, "gender"),
      bloodGroup: text(formData, "bloodGroup"),
      phone: text(formData, "phone"),
      email: text(formData, "email"),
      address: text(formData, "address"),
      emergencyContact: text(formData, "emergencyContact"),
      height: number(formData, "height"),
      weight: number(formData, "weight"),
      allergies: text(formData, "allergies"),
      conditions: text(formData, "conditions"),
      medications: text(formData, "medications"),
      surgeries: text(formData, "surgeries"),
      familyHistory: text(formData, "familyHistory"),
      notes: text(formData, "notes"),
    },
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/patients");
}

export async function deletePatient(patientId: string) {
  const user = await requireUser();

  const existing = await prisma.patient.findFirst({
    where: { id: patientId, userId: user.id },
  });
  if (!existing) return { error: "Patient not found" };

  // Cascade deletes reports + measurements (and their lab results) via DB.
  await prisma.patient.delete({ where: { id: patientId } });

  revalidatePath("/patients");
  redirect("/patients");
}

export async function addMeasurement(patientId: string, formData: FormData) {
  const user = await requireUser();

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, userId: user.id },
  });
  if (!patient) return { error: "Patient not found" };

  const type = text(formData, "type");
  const value = number(formData, "value");
  if (!type || value === null) return { error: "Type and value are required" };

  await prisma.healthMeasurement.create({
    data: {
      userId: user.id,
      patientId,
      type,
      value,
      unit: text(formData, "unit"),
      note: text(formData, "note"),
      date: date(formData, "date") ?? new Date(),
    },
  });

  revalidatePath(`/patients/${patientId}/vitals`);
  revalidatePath(`/patients/${patientId}/overview`);
}