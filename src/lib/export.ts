export interface ExportableResult {
  canonicalName: string;
  originalTestName: string;
  originalValue: string;
  originalUnit: string | null;
  normalizedValue: number | null;
  referenceLow: number | null;
  referenceHigh: number | null;
  flag: string | null;
  reportDate: string | null;
  reportTitle: string | null;
  laboratoryName: string | null;
  confirmed: boolean;
}

export interface ExportableMeasurement {
  type: string;
  value: number;
  unit: string | null;
  note: string | null;
  date: string;
  source: string;
}

function esc(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).replace(/"/g, '""');
}

export function toCSV(results: ExportableResult[]): string {
  const header = [
    "Biomarker",
    "Original Name",
    "Value",
    "Unit",
    "Normalized Value",
    "Reference Low",
    "Reference High",
    "Flag",
    "Report Date",
    "Report",
    "Laboratory",
    "Confirmed",
  ];
  const rows = results.map((r) =>
    [
      r.canonicalName,
      r.originalTestName,
      r.originalValue,
      r.originalUnit,
      r.normalizedValue,
      r.referenceLow,
      r.referenceHigh,
      r.flag,
      r.reportDate,
      r.reportTitle,
      r.laboratoryName,
      r.confirmed ? "yes" : "no",
    ]
      .map(esc)
      .join(",")
  );
  return [header.join(","), ...rows].join("\n");
}

export function toJSON(results: ExportableResult[]): string {
  return JSON.stringify(results, null, 2);
}

export function measurementsToCSV(measurements: ExportableMeasurement[]): string {
  const header = ["Type", "Value", "Unit", "Note", "Date", "Source"];
  const rows = measurements.map((m) =>
    [m.type, m.value, m.unit, m.note, m.date, m.source].map(esc).join(",")
  );
  return [header.join(","), ...rows].join("\n");
}

function dl(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCSV(content: string, filename: string) {
  dl(content, filename, "text/csv;charset=utf-8;");
}

export function downloadJSON(content: string, filename: string) {
  dl(content, filename, "application/json;charset=utf-8;");
}