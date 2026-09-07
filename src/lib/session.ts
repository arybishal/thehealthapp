import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

export function getUserFromSession(
  session: { user?: { id?: string } } | null
): string | null {
  return session?.user?.id ?? null;
}

export async function requireUser() {
  const session = await getServerSession(authOptions);
  const userId = getUserFromSession(session);
  if (!userId) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "master_admin") {
    redirect("/dashboard");
  }
  return user;
}