"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import type { NavItem } from "./nav-config";

export function NavigationItem({
  item,
  variant = "row",
}: {
  item: NavItem;
  variant?: "row" | "column";
}) {
  const pathname = usePathname();
  const active =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href + "/"));

  if (variant === "column") {
    return (
      <Link
        href={item.href}
        className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Icon
          name={item.icon}
          className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`}
        />
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
        active
          ? "bg-primary-light text-primary font-semibold"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <span
        className={`w-[3px] h-4 rounded-full bg-primary absolute left-0 transition-all duration-200 ${
          active
            ? "opacity-100 scale-y-100"
            : "opacity-0 scale-y-50 group-hover:opacity-100 group-hover:scale-y-75"
        }`}
      />
      <Icon
        name={item.icon}
        className={`w-5 h-5 shrink-0 transition-colors duration-200 ${
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        }`}
      />
      {item.label}
    </Link>
  );
}
