"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { Icon } from "./icons";
import type { ShellUser } from "./types";

export function UserAvatar({
  user,
  size = "sm",
  href,
}: {
  user: ShellUser | null;
  size?: "sm" | "md";
  href?: string;
}) {
  const name = user?.name || user?.email || "U";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClasses =
    size === "md" ? "w-9 h-9 text-sm" : "w-8 h-8 text-xs";

  const inner = (
    <span
      className={`${sizeClasses} rounded-full bg-foreground text-background flex items-center justify-center font-semibold shrink-0`}
    >
      {initials}
    </span>
  );

  return href ? (
    <Link href={href} className="shrink-0 hover:opacity-80 transition-opacity">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function UserMenu({ user }: { user: ShellUser | null }) {
  const displayName = user?.name || "Account";
  const email = user?.email || "";

  return (
    <div className="flex items-center gap-3">
      <UserAvatar user={user} href="/profile" size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{displayName}</p>
        {email && (
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        )}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        aria-label="Logout"
        className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
      >
        <Icon name="logout" className="w-4 h-4" />
      </button>
    </div>
  );
}
