"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { X, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DEMO_MESSAGE } from "@/lib/demo";
import type { ShellUser } from "@/components/layout/types";

const BANNER_KEY = "demo-banner-dismissed";

interface DemoContextValue {
  isDemo: boolean;
  openDemo: () => void;
}

const DemoContext = createContext<DemoContextValue>({
  isDemo: false,
  openDemo: () => {},
});

export function useDemo() {
  return useContext(DemoContext);
}

export function DemoProvider({
  user,
  children,
}: {
  user: ShellUser | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const isDemo = user?.isDemo ?? false;

  useEffect(() => {
    if (isDemo) {
      setDismissed(sessionStorage.getItem(BANNER_KEY) === "1");
    }
  }, [isDemo]);

  if (!isDemo) return <>{children}</>;

  return (
    <DemoContext.Provider value={{ isDemo: true, openDemo: () => setOpen(true) }}>
      {!dismissed && (
        <div className="flex items-center justify-center gap-2 border-b border-primary/10 bg-primary-light/60 px-4 py-2 text-center text-sm text-primary">
          <span className="truncate">{DEMO_MESSAGE}</span>
          <Link
            href="/register"
            className="shrink-0 font-semibold underline underline-offset-2 hover:text-primary-hover"
          >
            Create free account
          </Link>
          <button
            onClick={() => {
              setDismissed(true);
              sessionStorage.setItem(BANNER_KEY, "1");
            }}
            aria-label="Dismiss"
            className="shrink-0 rounded p-0.5 hover:bg-primary/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Read-only demo</DialogTitle>
            <DialogDescription>{DEMO_MESSAGE}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button render={<Link href="/register" />}>
              Create Free Account
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="sm:mr-auto"
            >
              Continue Exploring
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {children}
    </DemoContext.Provider>
  );
}

export function DemoChip() {
  const { isDemo, openDemo } = useDemo();
  if (!isDemo) return null;
  return (
    <button
      onClick={openDemo}
      aria-label="This is a read-only demo"
      title="This is a read-only demo account"
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/10 hover:bg-primary/10"
    >
      Demo · Read Only
    </button>
  );
}

export function DemoGate({ children }: { children: React.ReactNode }) {
  const { isDemo } = useDemo();
  if (isDemo) return null;
  return <>{children}</>;
}

export function DemoNotice({ children }: { children: React.ReactNode }) {
  const { isDemo } = useDemo();
  if (!isDemo) return <>{children}</>;
  return (
    <div className="rounded-xl border bg-card p-6 text-center">
      <p className="font-semibold">Read-only demo</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {DEMO_MESSAGE}
      </p>
      <Link href="/register" className="mt-4 inline-block">
        <Button variant="outline" size="sm">
          Create Free Account
        </Button>
      </Link>
    </div>
  );
}