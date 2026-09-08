"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { MAIN_NAV, SECONDARY_NAV, ADMIN_NAV } from "./nav-config";
import { NavigationItem } from "./navigation-item";
import { Icon } from "./icons";
import { PatientSwitcher } from "@/components/patients/patient-switcher";
import { DemoChip } from "@/components/demo/demo-provider";
import type { ShellUser, ShellPatient } from "./types";

export function MobileHeader({
  user,
  patients,
}: {
  user: ShellUser | null;
  patients: ShellPatient[];
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const isAdmin = user?.role === "master_admin";
  const isPatientPage = pathname.startsWith("/patients/");

  return (
    <>
      <header className="lg:hidden h-14 flex items-center justify-between px-4 border-b border-border bg-card shrink-0 print-hidden">
        <Link href="/patients" className="text-lg font-bold text-foreground">
          TheBloodTracker
        </Link>

        <div className="flex items-center gap-2 min-w-0">
          <DemoChip />
          {isPatientPage && <PatientSwitcher patients={patients} compact />}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <Icon name="menu" className="w-5 h-5" />
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="absolute left-0 top-0 bottom-0 w-72 bg-card shadow-xl flex flex-col">
            <div className="h-14 flex items-center justify-between px-5 border-b border-border shrink-0">
              <Link
                href="/patients"
                className="text-lg font-bold text-foreground"
                onClick={() => setDrawerOpen(false)}
              >
                TheBloodTracker
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="p-2 -mr-2 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {MAIN_NAV.map((item) => (
                <NavigationItem key={item.href} item={item} />
              ))}
              <div className="border-t border-border my-3" />
              <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
                Patients
              </p>
              <PatientSwitcher patients={patients} />
              {isAdmin && (
                <>
                  <div className="border-t border-border my-3" />
                  {ADMIN_NAV.map((item) => (
                    <NavigationItem key={item.href} item={item} />
                  ))}
                </>
              )}
              <div className="border-t border-border my-3" />
              {SECONDARY_NAV.map((item) => (
                <NavigationItem key={item.href} item={item} />
              ))}
            </nav>

            <div className="border-t border-border p-3 shrink-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-semibold shrink-0">
                  {(user?.name || user?.email || "U")
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user?.name || "Account"}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                <Icon name="logout" className="w-5 h-5 text-muted-foreground" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
