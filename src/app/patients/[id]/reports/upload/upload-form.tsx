"use client";

import { useRef, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, FileUp, Loader2, Pen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StatusBadge, flagToTone, flagToLabel } from "@/components/status";

interface ExtractableResult {
  originalTestName: string;
  canonicalName: string;
  originalValue: string;
  originalUnit: string | null;
  normalizedValue: number | null;
  normalizedUnit: string | null;
  referenceLow: number | null;
  referenceHigh: number | null;
  originalRefRange: string | null;
  flag: string | null;
  confidence: string;
}

interface ExtractionResult {
  parsedText: string;
  laboratoryName: string | null;
  reportDate: string | null;
  patientName: string | null;
  reportNumber: string | null;
  reportType: string | null;
  results: ExtractableResult[];
  pageCount?: number;
}

function recomputeFlag(value: string, refRange: string | null): string | null {
  const num = parseFloat(value.replace(/[<>=≤≥]/g, "").trim());
  if (isNaN(num) || !refRange) return null;
  const match = refRange.match(/<\s*(\d+(?:\.\d+)?)/);
  if (match) return num > parseFloat(match[1]) ? "H" : null;
  const range = refRange.match(/(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)/);
  if (!range) return null;
  const low = parseFloat(range[1]);
  const high = parseFloat(range[2]);
  if (num > high) return "H";
  if (num < low) return "L";
  return null;
}

export function UploadReportForm({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [results, setResults] = useState<ExtractableResult[]>([]);
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState("");
  const [duplicateInfo, setDuplicateInfo] = useState<{ id: string; title: string; reportDate: string | null; laboratoryName: string | null } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setDuplicateInfo(null);
    const valid = ["application/pdf", "image/jpeg", "image/png"].includes(file.type);
    if (!valid) {
      setError("Please upload a PDF, JPG, JPEG, or PNG file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File is too large (max 20MB).");
      return;
    }
    setSelectedFile(file);
    setReportTitle(file.name.replace(/\.[^.]+$/, ""));
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setError(null);
    setDuplicateInfo(null);
    const valid = ["application/pdf", "image/jpeg", "image/png"].includes(file.type);
    if (!valid) { setError("Please upload a PDF, JPG, JPEG, or PNG file."); return; }
    if (file.size > 20 * 1024 * 1024) { setError("File is too large (max 20MB)."); return; }
    setSelectedFile(file);
    setReportTitle(file.name.replace(/\.[^.]+$/, ""));
  }, []);

  async function processReport(file: File): Promise<ExtractionResult> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/reports/process", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: "Processing failed" }));
      throw new Error(errData.error || "Processing failed");
    }

    const data = await res.json();
    return data as ExtractionResult;
  }

  function handleProcess() {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);

    processReport(selectedFile)
      .then((result) => {
        setExtraction(result);
        setResults(result.results.map((r) => ({ ...r })));
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }

  function updateResult(i: number, patch: Partial<ExtractableResult>) {
    const next = [...results];
    next[i] = { ...next[i], ...patch };
    if (patch.originalValue !== undefined || patch.originalRefRange !== undefined) {
      next[i].flag = recomputeFlag(next[i].originalValue, next[i].originalRefRange);
    }
    setResults(next);
  }

  function removeResult(i: number) {
    setResults((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addResult() {
    setResults((prev) => [
      ...prev,
      {
        originalTestName: "",
        canonicalName: "",
        originalValue: "",
        originalUnit: null,
        normalizedValue: null,
        normalizedUnit: null,
        referenceLow: null,
        referenceHigh: null,
        originalRefRange: null,
        flag: null,
        confidence: "low",
      },
    ]);
  }

  function handleSave(force = false) {
    const isManual = isManualEntry && !selectedFile;
    if (!isManual && (!selectedFile || !extraction)) return;

    setIsProcessing(true);
    const formData = new FormData();
    if (selectedFile) formData.append("file", selectedFile);
    formData.append("title", reportTitle || (selectedFile?.name.replace(/\.[^.]+$/, "") ?? "Manual entry"));
    formData.append("reportType", reportType || extraction?.reportType || "general");
    formData.append("laboratoryName", extraction?.laboratoryName || "");
    formData.append("reportDate", extraction?.reportDate || "");
    formData.append("patientName", patientName);
    formData.append("reportNumber", extraction?.reportNumber || "");
    formData.append("parsedText", extraction?.parsedText || "");
    formData.append("results", JSON.stringify(results));
    formData.append("patientId", patientId);
    if (force) formData.append("force", "true");

    fetch("/api/reports", { method: "POST", body: formData })
      .then(async (res) => {
        if (res.status === 409) {
          const data = await res.json();
          setDuplicateInfo(data.duplicate);
          setIsProcessing(false);
          return null;
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Save failed" }));
          throw new Error(err.error || "Save failed");
        }
        return res.json();
      })
      .then((data) => {
        if (data) router.push(`/patients/${patientId}/reports/${data.id}`);
      })
      .catch((err: Error) => { setError(err.message); setIsProcessing(false); });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">
          Upload Report for {patientName}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Upload a blood test report and we&apos;ll extract the results for you.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Report</CardTitle>
          <CardDescription>
            Supported formats: PDF, JPG, JPEG, PNG (max 20MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div
            className={`flex flex-col items-center gap-1 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
              isDragOver ? "border-primary bg-primary-light/40" : "border-border bg-muted/30"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
          >
            <FileUp className="h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium text-foreground">
              Drag and drop or choose a report
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              PDF, JPG, or PNG up to 20MB
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button variant="default" onClick={() => fileInputRef.current?.click()} type="button">
                Choose file
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsManualEntry(true);
                  setExtraction({ parsedText: "", laboratoryName: null, reportDate: null, patientName: patientName, reportNumber: null, reportType: null, results: [], pageCount: undefined });
                  setResults([]);
                  setReportTitle("");
                }}
                type="button"
              >
                <Pen className="h-4 w-4" />
                Enter manually
              </Button>
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light/60 text-primary">
                <FileUp className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setExtraction(null);
                  setResults([]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Remove
              </Button>
            </div>
          )}

          {duplicateInfo && (
            <div className="rounded-xl border border-warning/40 bg-warning-light p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning">Possible duplicate detected</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    A report with a similar title and date already exists
                    {duplicateInfo.laboratoryName ? ` from ${duplicateInfo.laboratoryName}` : ""}.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setDuplicateInfo(null)}>
                  Keep Existing
                </Button>
                <Button size="sm" onClick={() => handleSave(true)}>
                  Upload Anyway
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setDuplicateInfo(null); setError(null); }}>
                  Review & Edit
                </Button>
              </div>
            </div>
          )}

          {error && !duplicateInfo && (
            <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-light p-3 text-sm text-danger">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">We couldn&apos;t process this report</p>
                <p className="mt-0.5">{error}</p>
                <p className="mt-1 text-xs text-danger/80">
                  Check the file format and size, then try again.
                </p>
              </div>
            </div>
          )}

          {selectedFile && !extraction && (
            <Button onClick={handleProcess} disabled={isProcessing}>
              {isProcessing && <Loader2 className="animate-spin" />}
              {isProcessing ? "Processing report..." : "Process Report"}
            </Button>
          )}

          {isProcessing && selectedFile && !extraction && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting results from your report...
            </div>
          )}

          {extraction && (
            <div className="space-y-4">
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Review Extracted Information</h3>
                  <span className="text-xs bg-success-light text-success px-2 py-1 rounded-md border border-success/25 font-medium">
                    {results.length} results found
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Report Title</Label>
                    <Input
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Report Type</Label>
                    <select
                      className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={reportType || extraction.reportType || "general"}
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <option value="cbc">CBC (Complete Blood Count)</option>
                      <option value="lipid">Lipid Profile</option>
                      <option value="diabetes">Diabetes / Glucose</option>
                      <option value="hba1c">HbA1c</option>
                      <option value="thyroid">Thyroid</option>
                      <option value="liver">Liver Function</option>
                      <option value="kidney">Kidney Function</option>
                      <option value="vitamin">Vitamin Test</option>
                      <option value="iron">Iron Studies</option>
                      <option value="urine">Urine Test</option>
                      <option value="general">General Blood Test</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Laboratory</Label>
                    <Input
                      className="h-8"
                      placeholder="e.g. City Diagnostics"
                      value={extraction.laboratoryName || ""}
                      onChange={(e) => setExtraction({ ...extraction, laboratoryName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Report Date</Label>
                    <Input
                      className="h-8"
                      type="date"
                      value={extraction.reportDate || ""}
                      onChange={(e) => setExtraction({ ...extraction, reportDate: e.target.value })}
                    />
</div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Patient</Label>
                    <p className="font-medium pt-1">{patientName}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 font-semibold text-sm border-b border-border flex items-center justify-between">
                  <span>Extracted Results - Edit &amp; confirm before saving</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Edit values, fix units, remove false readings
                  </span>
                </div>
                <div className="divide-y">
                  {results.length === 0 && (
                    <p className="px-4 py-6 text-sm text-muted-foreground">
                      No results yet. Use &quot;Add Result&quot; below to enter them manually.
                    </p>
                  )}
                  {results.map((r, i) => (
                    <div key={i} className="px-4 py-3 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] gap-2 items-center">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
                        <Input
                          className="h-8 text-sm"
                          placeholder="Test name"
                          value={r.originalTestName}
                          onChange={(e) => updateResult(i, { originalTestName: e.target.value, canonicalName: e.target.value || r.canonicalName })}
                        />
                        <div className="flex items-center gap-1">
                          <Input
                            className="w-20 h-8 text-sm"
                            placeholder="value"
                            value={r.originalValue}
                            onChange={(e) => updateResult(i, { originalValue: e.target.value })}
                          />
                          <Input
                            className="w-20 h-8 text-sm"
                            value={r.originalUnit || ""}
                            placeholder="unit"
                            onChange={(e) => updateResult(i, { originalUnit: e.target.value })}
                          />
                        </div>
                      </div>
                      <Input
                        className="w-28 h-8 text-sm"
                        value={r.originalRefRange || ""}
                        placeholder="range"
                        onChange={(e) =>
                          updateResult(i, { originalRefRange: e.target.value || null })
                        }
                      />
                      {r.flag ? (
                        <StatusBadge
                          tone={flagToTone(r.flag)}
                          label={flagToLabel(r.flag)}
                        />
                      ) : (
                        <StatusBadge tone="normal" label="Normal" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeResult(i)}
                        className="text-danger"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border px-4 py-3 flex gap-2">
                  <Button variant="outline" size="sm" type="button" onClick={addResult}>
                    <Plus className="h-4 w-4" /> Add Result
                  </Button>
                  <p className="text-xs text-muted-foreground self-center">
                    {reportTitle ? reportTitle : "Enter the marker, value, unit and reference range from the report."}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => handleSave(false)} disabled={isProcessing}>
                  {isProcessing ? "Saving..." : "Confirm & Save Report"}
                </Button>
                <Button variant="outline" onClick={() => setExtraction(null)}>
                  Back
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
