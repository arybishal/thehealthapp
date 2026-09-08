"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileHeader } from "./mobile-header";
import { MobileNavigation } from "./mobile-navigation";
import type { ShellUser, ShellPatient } from "./types";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/demo",
  "/forgot-password",
  "/reset-password",
  "/medica",
  "/privacy",
  "/terms",
  "/s",
];

export function AppShellClient({
  user,
  patients,
  children,
}: {
  user: ShellUser | null;
  patients: ShellPatient[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/");

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: sidebar + main */}
      <div className="hidden lg:flex h-screen">
        <Sidebar user={user} patients={patients} />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Topbar user={user} patients={patients} />
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-6 py-6">{children}</div>
          </main>
        </div>
      </div>

      {/* Mobile: header + content + bottom nav */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <MobileHeader user={user} patients={patients} />
        <main className="flex-1 pb-24">
          <div className="max-w-3xl mx-auto px-4 py-6">{children}</div>
        </main>
        <MobileNavigation />
      </div>
    </div>
  );
}
