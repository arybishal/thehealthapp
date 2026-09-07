"use client";

import Link from "next/link";
import { MAIN_NAV, SECONDARY_NAV, ADMIN_NAV } from "./nav-config";
import { NavigationItem } from "./navigation-item";
import { UserMenu } from "./user-menu";
import { PatientSwitcher } from "@/components/patients/patient-switcher";
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
      <div className="h-14 flex items-center px-5 border-b border-border shrink-0">
        <Link href="/patients" className="text-lg font-bold text-foreground">
          TheBloodTracker
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {MAIN_NAV.map((item) => (
          <NavigationItem key={item.href} item={item} />
        ))}
        <div className="px-3 pt-2 pb-1">
          <PatientSwitcher patients={patients} compact />
        </div>
        <Link
          href="/patients/new"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors mt-1"
        >
          <Icon name="plus" className="w-4 h-4" />
          Add Patient
        </Link>
        <div className="border-t border-border my-3" />
        {isAdmin && (
          <>
            {ADMIN_NAV.map((item) => (
              <NavigationItem key={item.href} item={item} />
            ))}
            <div className="border-t border-border my-3" />
          </>
        )}
        {SECONDARY_NAV.map((item) => (
          <NavigationItem key={item.href} item={item} />
        ))}
      </nav>

      <div className="border-t border-border p-3 shrink-0">
        <UserMenu user={user} />
      </div>
    </aside>
  );
}
