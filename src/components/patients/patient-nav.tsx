"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  CalendarDays,
  FileText,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  Link as LinkIcon,
  Printer,
  Ruler,
  Settings2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PatientNavTab {
  href: string;
  label: string;
  icon: LucideIcon;
}

function buildNav(patientId: string): PatientNavTab[] {
  const base = `/patients/${patientId}`;
  return [
    { href: `${base}/overview`, label: "Overview", icon: LayoutDashboard },
    { href: `${base}/reports`, label: "Reports", icon: FileText },
    { href: `${base}/results`, label: "Lab Results", icon: FlaskConical },
    { href: `${base}/vitals`, label: "Vitals", icon: Gauge },
    { href: `${base}/trends`, label: "Trends", icon: Activity },
    { href: `${base}/timeline`, label: "Timeline", icon: CalendarDays },
    { href: `${base}/reminders`, label: "Reminders", icon: Bell },
    { href: `${base}/ranges`, label: "Ranges", icon: Ruler },
    { href: `${base}/share`, label: "Share", icon: LinkIcon },
    { href: `${base}/details`, label: "Medical Details", icon: Settings2 },
    { href: `${base}/summary`, label: "Patient Summary", icon: Printer },
  ];
}

export function PatientNav({
  patientId,
  variant = "horizontal",
}: {
  patientId: string;
  variant?: "horizontal" | "sidebar";
}) {
  const pathname = usePathname();
  const items = buildNav(patientId);

  if (variant === "sidebar") {
    return (
      <nav className="space-y-0.5">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-light text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex overflow-x-auto gap-1 -mb-px border-b border-border">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors duration-200 ${
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}