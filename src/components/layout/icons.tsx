import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  HeartPulse,
  TrendingUp,
  CalendarDays,
  Users,
  Cog,
  LifeBuoy,
  Search,
  Bell,
  Menu,
  X,
  Plus,
  LogOut,
  User,
  Shield,
} from "lucide-react";

export type IconName =
  | "dashboard"
  | "reports"
  | "health"
  | "trends"
  | "timeline"
  | "family"
  | "patients"
  | "admin"
  | "settings"
  | "help"
  | "search"
  | "bell"
  | "menu"
  | "x"
  | "plus"
  | "logout"
  | "user";

const iconMap: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  reports: FileText,
  health: HeartPulse,
  trends: TrendingUp,
  timeline: CalendarDays,
  family: Users,
  patients: Users,
  admin: Shield,
  settings: Cog,
  help: LifeBuoy,
  search: Search,
  bell: Bell,
  menu: Menu,
  x: X,
  plus: Plus,
  logout: LogOut,
  user: User,
};

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const Comp = iconMap[name];
  return <Comp className={className} />;
}
