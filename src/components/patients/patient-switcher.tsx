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
import { useDemo } from "@/components/demo/demo-provider";

export interface SwitcherPatient {
  id: string;
  name: string;
  relationship?: string | null;
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
  size?: "sm" | "md" | "lg";
}) {
  const box =
    size === "lg"
      ? "w-12 h-12 text-base rounded-xl"
      : size === "md"
        ? "w-10 h-10 text-sm rounded-lg"
        : "w-8 h-8 text-xs rounded-lg";
  return (
    <span
      className={`${box} bg-primary-light text-primary flex items-center justify-center font-bold shrink-0 ring-1 ring-primary/10`}
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
  const { isDemo } = useDemo();
  const currentId = getPatientIdFromPath(pathname);
  const current = patients.find((p) => p.id === currentId) ?? null;

  if (patients.length === 0 && !isDemo) {
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
      <DropdownMenuTrigger className="group flex items-center gap-2.5 w-full rounded-lg border border-border bg-card px-2.5 py-2 text-sm font-medium hover:bg-muted hover:text-foreground hover:border-primary/30 transition-colors min-w-0 max-w-full shadow-[0_1px_2px_rgba(24,39,75,0.04)]">
        <PatientAvatar name={current?.name ?? "All patients"} />
        <span className="truncate flex-1 text-left">
          {current ? current.name : "All patients"}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
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
            <span>
              <span className="block">{p.name}</span>
              {p.relationship && (
                <span className="block text-xs text-muted-foreground">
                  {p.relationship}
                </span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {!isDemo && (
          <DropdownMenuItem render={<Link href="/patients/new" />}>
            <Plus />
            Add Patient
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}