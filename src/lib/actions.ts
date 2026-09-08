"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isDemoEmail, DEMO_MESSAGE } from "@/lib/demo";

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email already registered" };
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  await prisma.profile.create({
    data: { userId: user.id },
  });

  redirect("/login");
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  return user;
}

export async function requestPasswordReset(email: string) {
  if (isDemoEmail(email)) return { error: DEMO_MESSAGE };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "No account found with that email" };

  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  // No email service configured: return the reset link to display on screen.
  return {
    resetUrl: `/reset-password?email=${encodeURIComponent(email)}&token=${token}`,
  };
}

export async function resetPassword(email: string, token: string, password: string) {
  if (isDemoEmail(email)) return { error: DEMO_MESSAGE };

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (
    !user ||
    !user.resetToken ||
    user.resetToken !== token ||
    !user.resetTokenExpiry ||
    user.resetTokenExpiry < new Date()
  ) {
    return { error: "Invalid or expired reset link" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExpiry: null },
  });

  return { success: true };
}
