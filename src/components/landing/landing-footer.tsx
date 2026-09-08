import Link from "next/link";
import { Droplets } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                <Droplets className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block text-[17px] font-extrabold tracking-tight">
                  The Health Trackey
                </span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  by The8Pattern
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Every Blood Test. One Clear Health History.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-sm font-bold">Product</p>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold">Account</p>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    Log In
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold">Legal</p>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">© 2026 The Health Trackey by The8Pattern</p>
          <p className="text-sm text-muted-foreground">Free health record organization for you and your family.</p>
        </div>
      </div>
    </footer>
  );
}