"use server";

import { prisma } from "./prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { revalidatePath } from "next/cache";

export async function saveProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;

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
