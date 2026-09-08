"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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

  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLElement | null>>([]);
  const [capsule, setCapsule] = useState<{ left: number; width: number } | null>(
    null
  );
  const capsuleRef = useRef(capsule);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeIdx = activeItem
      ? primary.findIndex((item) => item.href === activeItem.href)
      : -1;
    let el: HTMLElement | null = null;
    if (activeIdx >= 0) el = tabRefs.current[activeIdx];
    else if (activeItem) el = tabRefs.current[primary.length];
    const next =
      !el ? null
      : { left: el.offsetLeft - container.offsetLeft, width: el.offsetWidth };
    const prev = capsuleRef.current;
    if (
      next === prev ||
      (next && prev && next.left === prev.left && next.width === prev.width)
    )
      return;
    capsuleRef.current = next;
    setCapsule(next);
  }, [activeItem, primary]);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex max-w-full items-center rounded-pill border border-white/40 bg-white/40 p-1 shadow-flat backdrop-blur-nav"
    >
      {capsule && (
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-pill bg-dark shadow-flat transition-[left,width] duration-base ease-out"
          style={{ left: capsule.left, width: capsule.width }}
        />
      )}
      <nav className="no-scrollbar flex min-w-0 max-w-full items-center overflow-x-auto gap-0.5">
        {primary.map((item, i) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative z-10 inline-flex shrink-0 items-center whitespace-nowrap rounded-pill px-4 py-2 text-[13px] transition-colors duration-fast ${
                active
                  ? "text-white font-semibold"
                  : "text-ink/70 font-medium hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {more.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="More patient sections"
            ref={(el) => {
              tabRefs.current[primary.length] = el;
            }}
            className={`relative z-10 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill px-4 py-2 text-[13px] transition-colors duration-fast ${
              more.some((item) => isActive(item.href))
                ? "text-white font-semibold"
                : "text-ink/70 font-medium hover:text-ink"
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
    </div>
  );
}