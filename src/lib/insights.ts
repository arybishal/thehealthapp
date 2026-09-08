import { findBiomarkerByName } from "./biomarkers";

export interface InsightResultInput {
  canonicalName: string;
  originalValue: string;
  originalUnit: string | null;
  normalizedValue: number | null;
  referenceLow: number | null;
  referenceHigh: number | null;
  flag: string | null;
  resultDate: Date | null;
}

export interface InsightSeriesInput {
  canonicalName: string;
  originalValue: string;
  originalUnit: string | null;
  normalizedValue: number | null;
  referenceLow: number | null;
  referenceHigh: number | null;
  flag?: string | null;
  resultDate: Date | null;
}

export interface Insight {
  summary: string;
  points: string[];
  questions: string[];
  disclaimer: string;
}

const DISCLAIMER =
  "This is an informational, AI-generated interpretation of your recorded numbers. It is not a diagnosis and not medical advice. A healthcare professional should interpret your results using the full report and your clinical context.";

function formatValue(v: number, unit: string | null): string {
  const n = Math.round(v * 100) / 100;
  return unit ? `${n} ${unit}` : String(n);
}

function rangeLabel(low: number | null, high: number | null, unit: string | null): string {
  if (low !== null && high !== null) return `${low}\u2013${high}${unit ? ` ${unit}` : ""}`;
  if (low !== null) return `higher than ${low}${unit ? ` ${unit}` : ""}`;
  if (high !== null) return `lower than ${high}${unit ? ` ${unit}` : ""}`;
  return "not stated on the report";
}

function dateLabel(d: Date | null): string {
  if (!d) return "recorded";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Plain-language interpretation for a single lab result, compared against the
 * report's own reference range and (when available) the previous measurement.
 * Safety: descriptive statements only, never a diagnosis.
 */
export function buildResultInsight(
  current: InsightResultInput,
  previous: InsightSeriesInput | null
): Insight {
  const points: string[] = [];
  const questions: string[] = [];
  const bm = findBiomarkerByName(current.canonicalName);
  const unit = current.originalUnit ?? null;

  if (bm?.description) {
    points.push(
      `${bm.description}`
    );
  }

  if (current.normalizedValue !== null) {
    const ref = rangeLabel(current.referenceLow, current.referenceHigh, unit);
    if (current.flag === "H") {
      points.push(
        `Your ${current.canonicalName} result is above the reference range shown on the report (result ${current.originalValue}${unit ? ` ${unit}` : ""}, reference ${ref}).`
      );
      questions.push(
        "Consider discussing this result with your healthcare professional."
      );
    } else if (current.flag === "L") {
      points.push(
        `Your ${current.canonicalName} result is below the reference range shown on the report (result ${current.originalValue}${unit ? ` ${unit}` : ""}, reference ${ref}).`
      );
      questions.push(
        "Consider discussing this result with your healthcare professional."
      );
    } else if (
      current.referenceLow !== null ||
      current.referenceHigh !== null
    ) {
      points.push(
        `Your ${current.canonicalName} result is within the reference range shown on the report (result ${current.originalValue}${unit ? ` ${unit}` : ""}, reference ${ref}).`
      );
    } else {
      points.push(
        `Your ${current.canonicalName} result is ${current.originalValue}${unit ? ` ${unit}` : ""}. This report does not state a reference range, so it cannot be compared against one.`
      );
    }
  }

  if (
    previous &&
    previous.normalizedValue !== null &&
    current.normalizedValue !== null &&
    current.normalizedValue !== previous.normalizedValue
  ) {
    const diff = current.normalizedValue - previous.normalizedValue;
    const deltaText = `${diff >= 0 ? "increase" : "decrease"} of ${formatValue(
      Math.abs(diff),
      unit
    )}`;
    const pct =
      previous.normalizedValue !== 0
        ? ` (${Math.round(Math.abs(diff / previous.normalizedValue) * 1000) / 10}%)`
        : "";
    points.push(
      `Compared with the previous measurement on ${dateLabel(previous.resultDate)}, your ${current.canonicalName} changed by a ${deltaText}${pct}.`
    );
    questions.push(
      "If this change is unexpected, consider whether recent lifestyle, medication, or other factors might be relevant, and discuss it with your healthcare professional."
    );
  }

  if (points.length === 0) {
    points.push(
      `Your ${current.canonicalName} result is recorded as ${current.originalValue}${unit ? ` ${unit}` : ""} on ${dateLabel(current.resultDate)}.`
    );
  }

  const summary =
    (bm?.description ? `${bm.description} ` : "") +
    points[0];

  return {
    summary,
    points,
    questions,
    disclaimer: DISCLAIMER,
  };
}

/**
 * Observational pattern summary across one biomarker's history.
 */
export function buildTrendInsight(series: InsightSeriesInput[]): Insight {
  const points: string[] = [];
  const questions: string[] = [];
  const sorted = [...series]
    .filter((s) => s.normalizedValue !== null)
    .sort((a, b) => (a.resultDate?.getTime() ?? 0) - (b.resultDate?.getTime() ?? 0));

  if (sorted.length < 2) {
    return {
      summary: "Not enough data yet to identify a pattern.",
      points: ["Upload another report to build up a trend over time."],
      questions: [],
      disclaimer: DISCLAIMER,
    };
  }

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const values = sorted.map((s) => s.normalizedValue as number);
  const firstValue = first.normalizedValue as number;
  const lastValue = last.normalizedValue as number;
  const trend = lastValue - firstValue;

  if (Math.abs(trend) < 1e-6) {
    points.push(
      `Your ${last.canonicalName} has remained effectively stable at ${formatValue(lastValue, last.originalUnit)} over ${sorted.length} recorded measurements.`
    );
  } else {
    points.push(
      `Across ${sorted.length} recorded measurements, your ${last.canonicalName} values range from ${formatValue(
        Math.min(...values),
        last.originalUnit
      )} to ${formatValue(Math.max(...values), last.originalUnit)}.`
    );
  }

  if (last.flag === "H" || last.flag === "L") {
    points.push(
      `Your most recent ${last.canonicalName} result is ${last.flag === "H" ? "above" : "below"} the reference range shown on that report.`
    );
    questions.push(
      "Consider discussing this result with your healthcare professional."
    );
  }

  questions.push(
    "A healthcare professional can help interpret whether these changes are clinically meaningful."
  );

  return {
    summary: points[0],
    points,
    questions,
    disclaimer: DISCLAIMER,
  };
}

/**
 * Multi-marker comparison insight. Describes co-occurrence observationally only.
 * Never claims causation.
 */
export function buildCompareInsight(seriesMap: Record<string, InsightSeriesInput[]>): Insight {
  const keys = Object.keys(seriesMap);
  const points: string[] = [];
  if (keys.length < 2) {
    return {
      summary: "Select at least two biomarkers to compare.",
      points: [],
      questions: [],
      disclaimer: DISCLAIMER,
    };
  }

  const trendDirections: string[] = [];
  for (const key of keys) {
    const sorted = seriesMap[key].filter((s) => s.normalizedValue !== null);
    if (sorted.length >= 2) {
      const first = sorted[0].normalizedValue as number;
      const last = sorted[sorted.length - 1].normalizedValue as number;
      const dir = last > first ? "increased" : last < first ? "decreased" : "stayed stable";
      trendDirections.push(`${key} ${dir} across the shared timeline`);
    } else {
      trendDirections.push(`${key} has fewer than two measurements in this period`);
    }
  }
  points.push(
    `Comparing ${keys.join(", ")}: ${trendDirections.join("; ")}.`
  );
  points.push(
    "These values changed during the same period. This is an observation from the available data and does not imply a cause-and-effect relationship."
  );

  return {
    summary: points[0],
    points,
    questions: [
      "A healthcare professional can help interpret whether these changes are clinically meaningful.",
    ],
    disclaimer: DISCLAIMER,
  };
}