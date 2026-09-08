"use server";

import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { isDemoEmail, DEMO_MESSAGE } from "./demo";
import { revalidatePath } from "next/cache";

export async function saveProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;
  if (isDemoEmail(session.user.email)) return;

  const dob = formData.get("dob") as string;
  const gender = formData.get("gender") as string;
  const height = (formData.get("height") as string) || "";
  const weight = (formData.get("weight") as string) || "";
  const bloodGroup = (formData.get("bloodGroup") as string) || "";

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: {
      dob: dob || null,
      gender: gender || null,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      bloodGroup: bloodGroup || null,
    },
  });

  revalidatePath("/profile");
}

export interface ChangePasswordState {
  error?: string;
  success?: boolean;
}

export async function changePassword(
  _prev: ChangePasswordState | null,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not signed in." };
  if (isDemoEmail(session.user.email)) return { error: DEMO_MESSAGE };

  const current = (formData.get("currentPassword") as string) || "";
  const next = (formData.get("newPassword") as string) || "";
  const confirm = (formData.get("confirmPassword") as string) || "";

  if (!current || !next || !confirm)
    return { error: "Please fill in all fields." };
  if (next.length < 6)
    return { error: "New password must be at least 6 characters." };
  if (next !== confirm)
    return { error: "New passwords do not match." };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) return { error: "Account not found." };

  const ok = await bcrypt.compare(current, user.password);
  if (!ok) return { error: "Current password is incorrect." };

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(next, 12) },
  });

  return { success: true };
}
