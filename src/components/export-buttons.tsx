"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { downloadCSV, downloadJSON, toCSV, toJSON, type ExportableResult } from "@/lib/export";

export function ExportButtons({ patientId }: { patientId: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleExport(format: "csv" | "json") {
    setLoading(format);
    try {
      const res = await fetch(
        `/api/export?patientId=${patientId}&format=${format}&scope=full`
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blood-tracker-export.${format === "json" ? "json" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // fallback: fetch and build locally
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("csv")}
        disabled={loading !== null}
      >
        {loading === "csv" ? <Loader2 className="animate-spin" /> : <Download />}
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("json")}
        disabled={loading !== null}
      >
        {loading === "json" ? <Loader2 className="animate-spin" /> : <Download />}
        Export JSON
      </Button>
    </div>
  );
}