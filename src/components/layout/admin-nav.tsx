"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const GROUPS = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Management",
    items: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/patients", label: "Patients" },
      { href: "/admin/reports", label: "Reports" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/activity", label: "Activity" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

const FLAT = GROUPS.flatMap((g) => g.items);

export function AdminNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href + "/") || pathname === href;

  return (
    <nav className="no-scrollbar -mb-px flex items-end gap-2 overflow-x-auto border-b border-border">
      {GROUPS.map((group, gi) => (
        <div key={group.label} className="flex items-end gap-1">
          {gi > 0 && (
            <span className="mb-3 ml-1 mr-1 h-4 w-px self-center bg-border" />
          )}
          {group.items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex shrink-0 items-center whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border/60 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}