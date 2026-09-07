import { findBiomarkerByName } from "./biomarkers";

export interface SummaryResultInput {
  canonicalName: string;
  originalValue: string;
  normalizedValue: number | null;
  originalUnit: string | null;
  referenceLow: number | null;
  referenceHigh: number | null;
  flag: string | null;
  confirmed: boolean;
}

export interface SummaryPoint {
  canonicalName: string;
  status: "high" | "low" | "normal" | "check";
  text: string;
}

export interface ReportSummary {
  headline: string;
  verifiedCount: number;
  totalCount: number;
  points: SummaryPoint[];
  disclaimer: string;
}

export function generateSummary(results: SummaryResultInput[]): ReportSummary {
  const confirmed = results.filter((r) => r.confirmed);
  const points: SummaryPoint[] = [];
  const counts = { high: 0, low: 0, normal: 0, check: 0 };

  for (const r of confirmed) {
    const bm = findBiomarkerByName(r.canonicalName);
    const unit = r.originalUnit ? ` ${r.originalUnit}` : "";
    const ref =
      r.referenceLow !== null && r.referenceHigh !== null
        ? `${r.referenceLow}-${r.referenceHigh}${unit}`
        : "not stated on this report";

    if (r.flag === "H") {
      counts.high++;
      points.push({
        canonicalName: r.canonicalName,
        status: "high",
        text: `${r.canonicalName} is above the reference range (${r.originalValue}${unit}, ref ${ref}). ${
          bm?.description || "This marker is above the typical range."
        }`,
      });
    } else if (r.flag === "L") {
      counts.low++;
      points.push({
        canonicalName: r.canonicalName,
        status: "low",
        text: `${r.canonicalName} is below the reference range (${r.originalValue}${unit}, ref ${ref}). ${
          bm?.description || "This marker is below the typical range."
        }`,
      });
    } else if (r.flag === "H*" || r.flag === "L*") {
      counts.check++;
      points.push({
        canonicalName: r.canonicalName,
        status: "check",
        text: `${r.canonicalName} is borderline (${r.originalValue}${unit}, ref ${ref}). Worth tracking over time.`,
      });
    } else {
      counts.normal++;
      points.push({
        canonicalName: r.canonicalName,
        status: "normal",
        text: `${r.canonicalName} is within range (${r.originalValue}${unit}, ref ${ref}).`,
      });
    }
  }

  const flagged = counts.high + counts.low;
  const headline =
    confirmed.length === 0
      ? "No confirmed results yet."
      : flagged === 0
      ? "All confirmed results are within their reference ranges."
      : counts.high > 0 && counts.low > 0
      ? `${counts.high} above and ${counts.low} below the reference range were flagged.`
      : counts.high > 0
      ? `${counts.high} result${counts.high > 1 ? "s were" : " was"} flagged above the reference range.`
      : `${counts.low} result${counts.low > 1 ? "s were" : " was"} flagged below the reference range.`;

  return {
    headline,
    verifiedCount: confirmed.length,
    totalCount: results.length,
    points,
    disclaimer:
      "This is an automatic plain-language explanation of your numbers, not medical advice. Always discuss results with a qualified clinician.",
  };
}