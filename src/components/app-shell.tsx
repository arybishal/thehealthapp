import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShellClient } from "@/components/layout/app-shell-client";

export default async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  let patients: { id: string; name: string }[] = [];
  if (user?.id) {
    patients = await prisma.patient.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    });
  }

  return (
    <AppShellClient user={user ?? null} patients={patients}>
      {children}
    </AppShellClient>
  );
}