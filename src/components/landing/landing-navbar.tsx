"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Droplets, Menu, X } from "lucide-react";

const LINKS = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#why-thebloodtracker", label: "Why TheBloodTracker" },
  { href: "#privacy", label: "Privacy" },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="TheBloodTracker home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-[0_2px_8px_-2px_rgba(37,99,235,0.5)]">
        <Droplets className="h-5 w-5" />
      </span>
      <span className="text-[17px] font-extrabold tracking-tight">
        TheBloodTracker
      </span>
    </Link>
  );
}

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function exploreDemo() {
    const result = await signIn("credentials", {
      email: "demo@thebloodtracker.com",
      password: "demo1234",
      redirect: false,
      callbackUrl: "/patients",
    });
    if (!result?.error) router.push(result?.url ?? "/patients");
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-border bg-white shadow-[0_4px_20px_-12px_rgba(23,32,51,0.12)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            onClick={exploreDemo}
            className="rounded-lg border border-dashed border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-light/40"
          >
            Explore Demo
          </button>
          <Link
            href="/login"
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_8px_-2px_rgba(37,99,235,0.5)] transition-all duration-200 hover:-translate-y-px hover:bg-primary-hover hover:shadow-[0_6px_16px_-4px_rgba(37,99,235,0.5)]"
          >
            Get Started Free
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-foreground lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-white px-6 pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setOpen(false);
                exploreDemo();
              }}
              className="flex items-center justify-center rounded-lg border border-dashed border-primary/40 bg-white px-4 py-2.5 text-sm font-semibold text-primary"
            >
              Explore Demo
            </button>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Log In
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}