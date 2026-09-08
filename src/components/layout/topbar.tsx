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
    <header className="print-hidden mx-6 mt-4 flex items-center gap-4 rounded-pill border border-white/40 bg-white/65 px-6 py-3 shadow-nav backdrop-blur-nav">
      <div className="flex-1 min-w-0 flex items-center gap-2 text-[13px] font-medium">
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
            className="h-9 w-full rounded-pill border border-border bg-bg pl-8 pr-3 text-sm placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-dark/30 focus-visible:ring-offset-2 transition-colors"
          />
        </div>
      </form>

      <DemoChip />
      <UserAvatar user={user} href="/profile" size="md" />
    </header>
  );
}
