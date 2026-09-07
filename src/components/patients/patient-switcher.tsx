"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Plus, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/patients";

export interface SwitcherPatient {
  id: string;
  name: string;
}

export function getPatientIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/patients\/([^/]+)(?:\/|$)/);
  return match ? match[1] : null;
}

export function PatientAvatar({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`${
        size === "md" ? "w-9 h-9 text-sm" : "w-7 h-7 text-xs"
      } rounded-full bg-primary-light text-primary flex items-center justify-center font-semibold shrink-0`}
    >
      {getInitials(name)}
    </span>
  );
}

export function PatientSwitcher({
  patients,
  compact = false,
}: {
  patients: SwitcherPatient[];
  compact?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const currentId = getPatientIdFromPath(pathname);
  const current = patients.find((p) => p.id === currentId) ?? null;

  if (patients.length === 0) {
    return (
      <Link
        href="/patients/new"
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Patient
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium hover:bg-muted hover:text-foreground transition-colors min-w-0 max-w-full">
        <PatientAvatar name={current?.name ?? "All patients"} />
        <span className="truncate">
          {current ? current.name : "All patients"}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {!compact && (
          <>
            <DropdownMenuItem
              render={
                <Link href="/patients" prefetch={false} className="w-full" />
              }
            >
              <Users />
              All patients
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {patients.map((p) => (
          <DropdownMenuItem
            key={p.id}
            className={p.id === currentId ? "bg-primary-light" : ""}
            onClick={() => router.push(`/patients/${p.id}/overview`)}
          >
            <PatientAvatar name={p.name} />
            {p.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/patients/new" />}>
          <Plus />
          Add Patient
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}