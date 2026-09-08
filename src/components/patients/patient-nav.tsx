"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  CalendarDays,
  ChevronDown,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PatientNavTab {
  href: string;
  label: string;
  icon: LucideIcon;
}

const PRIMARY_LABELS = ["Overview", "Reports", "Lab Results", "Vitals", "Trends", "Timeline"];

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
  const isActive = (href: string) => pathname.startsWith(href);

  if (variant === "sidebar") {
    return (
      <nav className="space-y-0.5">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-primary-light text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>
    );
  }

  const primary = items.filter((item) => PRIMARY_LABELS.includes(item.label));
  const more = items.filter((item) => !PRIMARY_LABELS.includes(item.label));
  const activeItem = items.find((item) => isActive(item.href));

  const tabClass = (active: boolean) =>
    `inline-flex shrink-0 items-center whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
      active
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:border-border/60 hover:text-foreground"
    }`;

  return (
    <nav className="flex items-end gap-1 border-b border-border -mb-px">
      <div className="no-scrollbar -mb-px flex min-w-0 flex-1 overflow-x-auto gap-1">
        {primary.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={tabClass(active)}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {more.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="More patient sections"
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              more.some((item) => isActive(item.href))
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border/60 hover:text-foreground"
            }`}
          >
            More
            <ChevronDown className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {more.map((item) => {
              const active = isActive(item.href);
              return (
                <DropdownMenuItem
                  key={item.href}
                  render={<Link href={item.href} className="w-full" />}
                  className={active ? "bg-primary-light" : ""}
                >
                  <item.icon className="h-4 w-4" />
                  <span aria-current={active ? "page" : undefined}>{item.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Screen-reader cue for the active section when it lives in the More menu */}
      {activeItem && !PRIMARY_LABELS.includes(activeItem.label) && (
        <span className="sr-only">Currently in {activeItem.label}</span>
      )}
    </nav>
  );
}