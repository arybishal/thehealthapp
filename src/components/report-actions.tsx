"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/components/demo/demo-provider";

export function ConfirmButton({
  resultId,
  confirmed,
}: {
  resultId: string;
  confirmed: boolean;
}) {
  const router = useRouter();
  const { isDemo } = useDemo();
  const [isPending, startTransition] = useTransition();

  if (isDemo) return null;

  function toggle() {
    startTransition(async () => {
      const res = await fetch("/api/results", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resultId, confirmed: !confirmed }),
      });
      if (res.ok) router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`px-2 py-1 rounded-md text-xs font-semibold border transition-colors disabled:opacity-50 ${
        confirmed
          ? "bg-success-light text-success border-success/25"
          : "bg-muted text-muted-foreground border-border hover:bg-warning-light hover:text-warning"
      }`}
    >
      {isPending ? "..." : confirmed ? "✓ Confirmed" : "Confirm"}
    </button>
  );
}

export function DeleteReportButton({
  reportId,
  redirectTo = "/reports",
}: {
  reportId: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { isDemo } = useDemo();
  const [isPending, startTransition] = useTransition();

  if (isDemo) return null;

  function remove() {
    if (!confirm("Delete this report and all its results?")) return;
    startTransition(async () => {
      const res = await fetch("/api/reports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reportId }),
      });
      if (res.ok) router.push(redirectTo);
    });
  }

  return (
    <button
      onClick={remove}
      disabled={isPending}
      className="px-3 py-2 rounded-md border text-sm text-danger hover:bg-danger-light disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}