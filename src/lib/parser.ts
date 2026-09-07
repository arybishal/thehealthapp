import { normalizeBiomarker } from "./biomarkers";
import {
  extractNumeric,
  isNumeric,
  normalizeUnit,
  getFlag,
  parseReferenceRange,
  determineConfidence,
} from "./units";

export interface ParsedResult {
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
  confidence: "high" | "medium" | "low";
}

export interface ParsedReport {
  laboratoryName: string | null;
  reportDate: string | null;
  patientName: string | null;
  reportNumber: string | null;
  reportType: string | null;
  results: ParsedResult[];
  rawText: string;
}

const LAB_PATTERNS = [
  /(?:laboratory|labs?|diagnostics|pathology|clinic|hospital)[:\s]*([^\n]+)/i,
  /(?:laboratory name|lab name)[:\s]*([^\n]+)/i,
];

const DATE_PATTERNS = [
  /(?:date|collected|sample|report)[:\s]*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i,
  /(?:date|collected|sample|report)[:\s]*([A-Za-z]{3,9}[,\.\s]+)?(\d{1,2})?[,\.\s]+([A-Za-z]{3,9}|[0-9]{1,2})\s*[,.\s]*(\d{2,4})/i,
];

const PATIENT_PATTERNS = [
  /(?:patient|name)[:\s]*([A-Z][^\n,;]{2,50})/i,
  /(?:patient name|pt\.? name)[:\s]*([A-Z][^\n,;]{2,50})/i,
];

const REPORT_NUM_PATTERNS = [
  /(?:report|accession|id|number|ref)[:\s]*([A-Z0-9\-]{5,20})/i,
];

const TITLE_PATTERNS = [
  /(complete blood count|cbc|lipid profile|thyroid function|liver function|kidney function|renal function|diabetes|hba1c|glucose|vitamin|iron studies|urine analysis|urinalysis|blood test)/i,
];

// Common report line patterns: "Test Name      Value Unit     Reference Range"
function parseResultLines(lines: string[]): ParsedResult[] {
  const results: ParsedResult[] = [];
  const skipped = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip header and metadata lines
    if (/^(test|parameter|result|unit|ref(erence)?|range|biolog|component|analyte|name)\s/i.test(trimmed))
      continue;
    if (/^(patient|date|time|doctor|lab|collected|received|reported|specimen|sample|age|sex|gender)/i.test(trimmed))
      continue;
    if (/^[-=—_*•·.]+$/.test(trimmed))
      continue;

    const id = trimmed.toLowerCase();
    if (skipped.has(id)) continue;
    skipped.add(id);

    let testName: string | null = null;
    let rawValue: string | null = null;
    let unit = "";
    let refRangeStr: string | null = null;

    // Column-aligned lines use 2+ spaces as separator: "Test      31.5    ng/mL    (30-100)"
    const columns = trimmed.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
    if (columns.length >= 3 && isNumeric(columns[1])) {
      testName = columns[0];
      rawValue = columns[1];
      unit = /^[\d.,\s<>≤≥+-]+$/.test(columns[2]) || isNumeric(columns[2]) ? "" : columns[2];
      const rangeCols = columns.slice(2).find((c) => c !== unit);
      if (rangeCols) {
        const rangeMatch = rangeCols.match(/\(?\s*([<>≤≥]?\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)\s*[A-Za-z%\/µμg³⁹¹²]*\s*\)?/);
        if (rangeMatch) refRangeStr = `${rangeMatch[1]}-${rangeMatch[2]}`;
      }
    } else {
      // Single-space path: "HbA1c 5.7 % 4.0-5.6 %"
      const testMatch = trimmed.match(
        /^([A-Za-z][A-Za-z\s\-\(\)\.'\u00b0&]*?)\s+([<>≤≥]?\d+(?:\.\d+)?)\s*([^\d\s][A-Za-z%\/µμg³⁹¹²⁺⁻+]*)?\s*(?:\(?\s*([<>≤≥]?\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)\s*[A-Za-z%\/µμg³⁹¹²]*\s*\)?)?/i
      );
      if (testMatch) {
        testName = testMatch[1].trim();
        rawValue = testMatch[2];
        unit = (testMatch[3] || "").trim();
        if (testMatch[4] && testMatch[5]) refRangeStr = `${testMatch[4]}-${testMatch[5]}`;
      }
    }

    if (!testName || !rawValue || !isNumeric(rawValue)) continue;

    refRangeStr = refRangeStr ?? findReferenceRangeOnLine(trimmed);
    const parsed = normalizeBiomarker(testName);
    const numericValue = extractNumeric(rawValue);
    const refRange = parseReferenceRange(refRangeStr || "");

    let normalizedUnit = unit || null;
    if (unit && parsed) {
      const conv = normalizeUnit(parsed.canonicalName, unit);
      if (conv) normalizedUnit = conv.normalizedUnit;
    }

    const flag = getFlag(numericValue, refRange?.low ?? null, refRange?.high ?? null);

    const confidence = determineConfidence(
      numericValue !== null,
      refRange !== null,
      parsed?.aliases.some((a) => a.toLowerCase() === testName.toLowerCase()) ?? false
    );

    results.push({
      originalTestName: testName,
      canonicalName: parsed?.canonicalName ?? testName,
      originalValue: rawValue + (unit ? ` ${unit}` : ""),
      originalUnit: unit || null,
      normalizedValue: numericValue,
      normalizedUnit: normalizedUnit,
      referenceLow: refRange?.low ?? null,
      referenceHigh: refRange?.high ?? null,
      originalRefRange: refRangeStr || null,
      flag,
      confidence,
    });
  }

  return deduplicateResults(results);
}

function findReferenceRangeOnLine(line: string): string | null {
  // Pattern: (... X-Y ...) or "X - Y" in the remaining text
  const parenRange = line.match(/\(([^()]*\d+(?:\.\d+)?\s*[-–—]\s*\d+(?:\.\d+)?[^()]*)\)/);
  if (parenRange) return parenRange[1].trim();

  const rangeAfterValue = line.match(
    /(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)\s*[A-Za-z%\/]*/
  );
  if (rangeAfterValue) return `${rangeAfterValue[1]}-${rangeAfterValue[2]}`;

  return null;
}

function deduplicateResults(results: ParsedResult[]): ParsedResult[] {
  const seen = new Map<string, ParsedResult>();
  for (const r of results) {
    const key = `${r.canonicalName.toLowerCase()}|${r.originalValue}`;
    if (!seen.has(key)) {
      seen.set(key, r);
    }
  }
  return Array.from(seen.values());
}

function extractMeta(text: string): {
  laboratoryName: string | null;
  reportDate: string | null;
  patientName: string | null;
  reportNumber: string | null;
  reportType: string | null;
} {
  let laboratoryName: string | null = null;
  let reportDate: string | null = null;
  let patientName: string | null = null;
  let reportNumber: string | null = null;
  let reportType: string | null = null;

  // Extract laboratory name
  for (const pattern of LAB_PATTERNS) {
    const m = text.match(pattern);
    if (m && m[1].trim().length > 2 && m[1].trim().length < 100) {
      laboratoryName = m[1].trim();
      break;
    }
  }

  // If lab not found by pattern, check for common lab keywords as header
  if (!laboratoryName) {
    const firstLines = text.split("\n").slice(0, 10).join("\n");
    const headerMatch = firstLines.match(/^([A-Z][A-Za-z\s&\-'\.]{5,60}(?:LAB|LABORATORY|DIAGNOSTICS|CLINIC|HOSPITAL|HEALTHCARE)[A-Za-z\s&\-'\.]*)/im);
    if (headerMatch) {
      laboratoryName = headerMatch[1].trim();
    }
  }

  // Extract report date
  const dateMatch = text.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (dateMatch) {
    const d = parseInt(dateMatch[1]);
    const m = parseInt(dateMatch[2]);
    const y = parseInt(dateMatch[3]);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const fullYear = y < 100 ? (y < 50 ? 2000 + y : 1900 + y) : y;
      reportDate = `${fullYear}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }

  // Try month-name dates if numeric didn't work
  if (!reportDate) {
    const monthDateMatch = text.match(
      /(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s*,?\s*(\d{4})/i
    ) || text.match(
      /(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?,?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i
    );
    if (monthDateMatch) {
      const months: Record<string, string> = {
        jan: "01", january: "01", feb: "02", february: "02", mar: "03", march: "03",
        apr: "04", april: "04", may: "05", jun: "06", june: "06",
        jul: "07", july: "07", aug: "08", august: "08", sep: "09",
        sept: "09", september: "09", oct: "10", october: "10", nov: "11",
        november: "11", dec: "12", december: "12",
      };
      const monthName = monthDateMatch[2] || monthDateMatch[1];
      const monthNum = months[monthName.toLowerCase()];
      const day = monthDateMatch[3] || monthDateMatch[2] || "01";
      const year = monthDateMatch[4] || monthDateMatch[3];
      if (monthNum && year) {
        reportDate = `${year}-${monthNum}-${String(parseInt(day)).padStart(2, "0")}`;
      }
    }
  }

  // Extract patient name
  for (const pattern of PATIENT_PATTERNS) {
    const m = text.match(pattern);
    if (m && m[1].trim().length > 1) {
      patientName = m[1].trim().split(/\s{2,}/)[0];
      break;
    }
  }

  // Extract report number
  for (const pattern of REPORT_NUM_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      reportNumber = m[1].trim();
      break;
    }
  }

  // Determine report type
  for (const pattern of TITLE_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      const type = m[1].toLowerCase();
      if (type.includes("cbc")) reportType = "cbc";
      else if (type.includes("lipid")) reportType = "lipid";
      else if (type.includes("hba1c")) reportType = "hba1c";
      else if (type.includes("diabetes") || type.includes("glucose")) reportType = "diabetes";
      else if (type.includes("thyroid")) reportType = "thyroid";
      else if (type.includes("liver")) reportType = "liver";
      else if (type.includes("kidney") || type.includes("renal")) reportType = "kidney";
      else if (type.includes("vitamin")) reportType = "vitamin";
      else if (type.includes("iron")) reportType = "iron";
      else if (type.includes("urine")) reportType = "urine";
      else reportType = "general";
      break;
    }
  }

  return {
    laboratoryName,
    reportDate,
    patientName,
    reportNumber,
    reportType,
  };
}

/**
 * Parse extracted text from an OCR/image/PDF report into structured results.
 */
export function parseReportText(text: string): ParsedReport {
  const lines = text.split("\n");
  const meta = extractMeta(text);

  // For OCR text that may come as single-line blocks (each test on its own line),
  // or as tab/space-separated values, process lines carefully
  const results = parseResultLines(lines);

  return {
    laboratoryName: meta.laboratoryName,
    reportDate: meta.reportDate,
    patientName: meta.patientName,
    reportNumber: meta.reportNumber,
    reportType: meta.reportType,
    results,
    rawText: text,
  };
}
