"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";
import { getBreadcrumbs } from "./nav-config";
import { UserAvatar } from "./user-menu";
import { PatientSwitcher } from "@/components/patients/patient-switcher";
import { DemoChip } from "@/components/demo/demo-provider";
import type { ShellUser, ShellPatient } from "./types";

export function Topbar({
  user,
  patients,
}: {
  user: ShellUser | null;
  patients: ShellPatient[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  }

  const breadcrumbs = getBreadcrumbs(pathname);
  const isPatientPage = pathname.startsWith("/patients/");

  return (
    <header className="h-14 shrink-0 border-b border-border bg-card flex items-center gap-4 px-6 print-hidden">
      <div className="flex-1 min-w-0 flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground/40">/</span>}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{crumb.label}</span>
            )}
          </span>
        ))}
        {isPatientPage && <PatientSwitcher patients={patients} compact />}
      </div>

      <form
        onSubmit={handleSearch}
        className="hidden lg:flex items-center gap-2 max-w-xs w-full"
      >
        <div className="relative flex-1">
          <Icon
            name="search"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </form>

      <DemoChip />
      <UserAvatar user={user} href="/profile" size="md" />
    </header>
  );
}
