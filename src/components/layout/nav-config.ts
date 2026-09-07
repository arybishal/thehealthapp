import type { IconName } from "./icons";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

export const MAIN_NAV: NavItem[] = [
  { href: "/patients", label: "Patients", icon: "patients" },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Admin", icon: "admin" },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/settings", label: "Settings", icon: "settings" },
  { href: "/help", label: "Help & Support", icon: "help" },
];

export const MOBILE_BOTTOM_NAV: NavItem[] = [
  { href: "/patients", label: "Patients", icon: "patients" },
  { href: "/search", label: "Search", icon: "search" },
  { href: "/profile", label: "Profile", icon: "user" },
];

const PAGE_TITLES: Record<string, string> = {
  "/patients": "Patients",
  "/patients/new": "Add Patient",
  "/settings": "Settings",
  "/help": "Help & Support",
  "/profile": "Profile",
  "/search": "Search",
  "/admin": "Admin",
};

export function getBreadcrumbs(
  pathname: string
): { label: string; href?: string }[] {
  const patientMatch = pathname.match(/^\/patients\/([^/]+)(?:\/(.+))?$/);
  if (patientMatch) {
    const [, , rest] = patientMatch;
    if (rest === "new") return [{ label: "Add Patient" }];
    const labelMap: Record<string, string> = {
      overview: "Overview",
      reports: "Reports",
      results: "Lab Results",
      vitals: "Vitals",
      trends: "Trends",
      timeline: "Timeline",
      details: "Medical Details",
      edit: "Edit",
      summary: "Patient Summary",
    };
    // reports/* and results/* get their own crumbs
    if (rest?.startsWith("reports/"))
      return [
        { label: "Patients", href: "/patients" },
        { label: "Reports", href: `/patients/${patientMatch[1]}/reports` },
        { label: "Report" },
      ];
    if (rest?.startsWith("results/"))
      return [
        { label: "Patients", href: "/patients" },
        { label: "Lab Results", href: `/patients/${patientMatch[1]}/results` },
        { label: "Biomarker" },
      ];
    const pageLabel = rest ? labelMap[rest] : undefined;
    if (pageLabel) {
      return [
        { label: "Patients", href: "/patients" },
        { label: pageLabel },
      ];
    }
    return [
      { label: "Patients", href: "/patients" },
      { label: "Patient" },
    ];
  }

  if (pathname.startsWith("/admin")) {
    const section = pathname.split("/")[2];
    const adminLabels: Record<string, string> = {
      dashboard: "Dashboard",
      users: "Users",
      patients: "Patients",
      reports: "Reports",
      activity: "Activity",
      settings: "Settings",
    };
    const label = section ? adminLabels[section] : "Dashboard";
    return [{ label: "Admin", href: "/admin" }, { label }];
  }

  const title = PAGE_TITLES[pathname];
  return [{ label: title ?? "TheBloodTracker" }];
}
