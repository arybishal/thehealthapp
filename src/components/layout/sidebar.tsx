"use client";

import Link from "next/link";
import { MAIN_NAV, SECONDARY_NAV, ADMIN_NAV } from "./nav-config";
import { NavigationItem } from "./navigation-item";
import { UserMenu } from "./user-menu";
import { PatientSwitcher } from "@/components/patients/patient-switcher";
import { DemoGate } from "@/components/demo/demo-provider";
import type { ShellUser, ShellPatient } from "./types";
import { Icon } from "./icons";

export function Sidebar({
  user,
  patients,
}: {
  user: ShellUser | null;
  patients: ShellPatient[];
}) {
  const isAdmin = user?.role === "master_admin";

  return (
    <aside className="w-64 shrink-0 h-full border-r border-border bg-card flex flex-col print-hidden">
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-border shrink-0">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_2px_6px_-2px_rgba(37,41,161,0.4)]">
          <Icon name="patients" className="w-4 h-4" />
        </span>
        <Link href="/patients" className="text-[0.95rem] font-extrabold tracking-tight text-foreground">
          TheBloodTracker
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
          Main
        </p>
        <div className="space-y-0.5">
          {MAIN_NAV.map((item) => (
            <NavigationItem key={item.href} item={item} />
          ))}
        </div>

        <div className="mt-6 mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
          Family
        </div>
        <div className="space-y-0.5 px-3">
          <PatientSwitcher patients={patients} compact />
          <DemoGate>
            <Link
              href="/patients/new"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground mt-1"
            >
              <Icon name="plus" className="h-4 w-4 shrink-0" />
              Add Patient
            </Link>
          </DemoGate>
        </div>

        {isAdmin && (
          <>
            <div className="mt-6 mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
              Admin
            </div>
            <div className="space-y-0.5">
              {ADMIN_NAV.map((item) => (
                <NavigationItem key={item.href} item={item} />
              ))}
            </div>
          </>
        )}

        <div className="mt-6 mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
          System
        </div>
        <div className="space-y-0.5">
          {SECONDARY_NAV.map((item) => (
            <NavigationItem key={item.href} item={item} />
          ))}
        </div>
      </nav>

      <div className="border-t border-border p-3 shrink-0">
        <UserMenu user={user} />
      </div>
    </aside>
  );
}
