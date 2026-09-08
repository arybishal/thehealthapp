"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileHeader } from "./mobile-header";
import { MobileNavigation } from "./mobile-navigation";
import type { ShellUser, ShellPatient } from "./types";
import { DemoProvider } from "@/components/demo/demo-provider";

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
    <DemoProvider user={user}>
      <div className="min-h-screen bg-bg [background:radial-gradient(900px_500px_at_85%_-10%,rgba(44,154,209,0.10),transparent),radial-gradient(700px_400px_at_-10%_20%,rgba(18,36,54,0.05),transparent)]">
        {/* Desktop: sidebar + main */}
        <div className="hidden lg:flex h-screen">
          <Sidebar user={user} patients={patients} />
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <Topbar user={user} patients={patients} />
            <main className="flex-1">
              <div key={pathname} className="max-w-7xl mx-auto px-6 py-6 animate-panel-swap">{children}</div>
            </main>
          </div>
        </div>

        {/* Mobile: header + content + bottom nav */}
        <div className="lg:hidden flex flex-col min-h-screen">
          <MobileHeader user={user} patients={patients} />
          <main className="flex-1 pb-24">
            <div key={pathname} className="max-w-3xl mx-auto px-4 py-6 animate-panel-swap">{children}</div>
          </main>
          <MobileNavigation />
        </div>
      </div>
    </DemoProvider>
  );
}
