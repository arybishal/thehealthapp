"use client";

import { MOBILE_BOTTOM_NAV } from "./nav-config";
import { NavigationItem } from "./navigation-item";

export function MobileNavigation() {
  return (
    <nav className="print-hidden lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card">
      <div className="grid grid-cols-3">
        {MOBILE_BOTTOM_NAV.map((item) => (
          <NavigationItem key={item.href} item={item} variant="column" />
        ))}
      </div>
    </nav>
  );
}
