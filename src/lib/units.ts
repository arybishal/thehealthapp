export interface UnitConversion {
  aliases: string[];
  toStandard: string;
  factor: number;
}

const UNIT_MAPS: Record<string, UnitConversion[]> = {
  "Vitamin D (25-OH)": [
    { aliases: ["ng/mL", "ng/ml", "ug/L", "µg/L"], toStandard: "ng/mL", factor: 1 },
    { aliases: ["nmol/L", "nmol/l"], toStandard: "ng/mL", factor: 0.4007 },
  ],
  "HbA1c": [
    { aliases: ["%", "percent", "pct"], toStandard: "%", factor: 1 },
    { aliases: ["mmol/mol", "mmol/mol"], toStandard: "%", factor: 0.0915 },
  ],
  "Glucose": [
    { aliases: ["mg/dL", "mg/dl"], toStandard: "mg/dL", factor: 1 },
    { aliases: ["mmol/L", "mmol/l", "mM"], toStandard: "mg/dL", factor: 18.018 },
  ],
  "Total Cholesterol": [
    { aliases: ["mg/dL", "mg/dl"], toStandard: "mg/dL", factor: 1 },
    { aliases: ["mmol/L", "mmol/l", "mM"], toStandard: "mg/dL", factor: 38.67 },
  ],
  "LDL Cholesterol": [
    { aliases: ["mg/dL", "mg/dl"], toStandard: "mg/dL", factor: 1 },
    { aliases: ["mmol/L", "mmol/l", "mM"], toStandard: "mg/dL", factor: 38.67 },
  ],
  "HDL Cholesterol": [
    { aliases: ["mg/dL", "mg/dl"], toStandard: "mg/dL", factor: 1 },
    { aliases: ["mmol/L", "mmol/l", "mM"], toStandard: "mg/dL", factor: 38.67 },
  ],
  "Triglycerides": [
    { aliases: ["mg/dL", "mg/dl"], toStandard: "mg/dL", factor: 1 },
    { aliases: ["mmol/L", "mmol/l", "mM"], toStandard: "mg/dL", factor: 88.57 },
  ],
  "Creatinine": [
    { aliases: ["mg/dL", "mg/dl"], toStandard: "mg/dL", factor: 1 },
    { aliases: ["µmol/L", "umol/L", "µmol/l", "umol/l"], toStandard: "mg/dL", factor: 0.011312 },
  ],
  "Uric Acid": [
    { aliases: ["mg/dL", "mg/dl"], toStandard: "mg/dL", factor: 1 },
    { aliases: ["µmol/L", "umol/L", "µmol/l", "umol/l"], toStandard: "mg/dL", factor: 0.01681 },
  ],
  "Sodium": [
    { aliases: ["mmol/L", "mmol/l", "mEq/L", "mEq/l"], toStandard: "mmol/L", factor: 1 },
  ],
  "Potassium": [
    { aliases: ["mmol/L", "mmol/l", "mEq/L", "mEq/l"], toStandard: "mmol/L", factor: 1 },
  ],
  "Chloride": [
    { aliases: ["mmol/L", "mmol/l", "mEq/L", "mEq/l"], toStandard: "mmol/L", factor: 1 },
  ],
  "Calcium": [
    { aliases: ["mg/dL", "mg/dl"], toStandard: "mg/dL", factor: 1 },
    { aliases: ["mmol/L", "mmol/l", "mM"], toStandard: "mg/dL", factor: 4.008 },
  ],
  "TSH": [
    { aliases: ["mIU/L", "mIU/l", "mU/L", "mU/l"], toStandard: "mIU/L", factor: 1 },
    { aliases: ["uIU/mL", "µIU/mL", "uIU/ml", "µIU/ml"], toStandard: "mIU/L", factor: 1 },
  ],
  "T3": [
    { aliases: ["ng/dL", "ng/dl"], toStandard: "ng/dL", factor: 1 },
    { aliases: ["pmol/L", "pmol/l"], toStandard: "ng/dL", factor: 0.0651 },
  ],
  "T4": [
    { aliases: ["µg/dL", "ug/dL", "µg/dl", "ug/dl"], toStandard: "µg/dL", factor: 1 },
    { aliases: ["ng/dL", "ng/dl"], toStandard: "µg/dL", factor: 0.001 },
    { aliases: ["pmol/L", "pmol/l"], toStandard: "µg/dL", factor: 0.0000777 },
  ],
  "BUN": [
    { aliases: ["mg/dL", "mg/dl"], toStandard: "mg/dL", factor: 1 },
    { aliases: ["mmol/L", "mmol/l"], toStandard: "mg/dL", factor: 2.801 },
  ],
  "Ferritin": [
    { aliases: ["ng/mL", "ng/ml", "µg/L", "ug/L"], toStandard: "ng/mL", factor: 1 },
  ],
  "Vitamin B12": [
    { aliases: ["pg/mL", "pg/ml", "ng/L", "ng/l"], toStandard: "pg/mL", factor: 1 },
    { aliases: ["pmol/L", "pmol/l"], toStandard: "pg/mL", factor: 1.355 },
  ],
  "Folate": [
    { aliases: ["ng/mL", "ng/ml", "µg/L", "ug/L"], toStandard: "ng/mL", factor: 1 },
    { aliases: ["nmol/L", "nmol/l"], toStandard: "ng/mL", factor: 0.4413 },
  ],
  "Hemoglobin": [
    { aliases: ["g/dL", "g/dl", "gm/dL", "gm/dl"], toStandard: "g/dL", factor: 1 },
    { aliases: ["g/L", "g/l", "gm/L"], toStandard: "g/dL", factor: 0.1 },
    { aliases: ["mmol/L", "mmol/l"], toStandard: "g/dL", factor: 1.611 },
  ],
  "WBC": [
    { aliases: ["×10⁹/L", "×10⁹/l", "10^9/L", "x10^9/L", "K/uL", "K/µL", "thousand/uL"], toStandard: "×10⁹/L", factor: 1 },
    { aliases: ["/mm³", "/uL"], toStandard: "×10⁹/L", factor: 0.001 },
  ],
  "RBC": [
    { aliases: ["×10¹²/L", "10^12/L", "M/uL", "million/uL", "mil/uL"], toStandard: "×10¹²/L", factor: 1 },
  ],
  "Platelets": [
    { aliases: ["×10⁹/L", "10^9/L", "x10^9/L", "K/uL", "K/µL", "thou/uL"], toStandard: "×10⁹/L", factor: 1 },
    { aliases: ["/uL"], toStandard: "×10⁹/L", factor: 0.001 },
  ],
  "ALT": [
    { aliases: ["U/L", "IU/L"], toStandard: "U/L", factor: 1 },
  ],
  "AST": [
    { aliases: ["U/L", "IU/L"], toStandard: "U/L", factor: 1 },
  ],
  "GGT": [
    { aliases: ["U/L", "IU/L"], toStandard: "U/L", factor: 1 },
  ],
  "Alkaline Phosphatase": [
    { aliases: ["U/L", "IU/L"], toStandard: "U/L", factor: 1 },
  ],
  "Total Bilirubin": [
    { aliases: ["mg/dL", "mg/dl"], toStandard: "mg/dL", factor: 1 },
    { aliases: ["µmol/L", "umol/L", "µmol/l", "umol/l"], toStandard: "mg/dL", factor: 0.05847 },
  ],
  "CRP": [
    { aliases: ["mg/L", "mg/l"], toStandard: "mg/L", factor: 1 },
    { aliases: ["mg/dL", "mg/dl"], toStandard: "mg/L", factor: 10 },
  ],
  "ESR": [
    { aliases: ["mm/hr", "mm/h", "mm/hr"], toStandard: "mm/hr", factor: 1 },
  ],
};

export function isNumeric(value: string): boolean {
  const cleaned = value.replace(/[,\s]/g, "").replace(/>|<|≥|≤/g, "");
  return cleaned !== "" && !isNaN(Number(cleaned));
}

export function extractNumeric(value: string): number | null {
  const cleaned = value.replace(/[,\s]/g, "").replace(/[><≥≤]/g, "");
  const num = Number(cleaned);
  return isNaN(num) ? null : num;
}

export function normalizeUnit(
  canonicalName: string,
  unit: string
): { value: number | null; normalizedUnit: string } | null {
  const conversions = UNIT_MAPS[canonicalName];
  if (!conversions) return null;

  const unitLower = unit.trim().toLowerCase();

  for (const conv of conversions) {
    if (conv.aliases.map((a) => a.toLowerCase()).includes(unitLower)) {
      return { value: null, normalizedUnit: conv.toStandard };
    }
  }

  return null;
}

export function convertValue(
  canonicalName: string,
  value: number,
  unit: string
): { value: number; normalizedUnit: string } | null {
  const conversions = UNIT_MAPS[canonicalName];
  if (!conversions) return null;

  const unitLower = unit.trim().toLowerCase();

  for (const conv of conversions) {
    if (conv.aliases.map((a) => a.toLowerCase()).includes(unitLower)) {
      return {
        value: Number((value * conv.factor).toFixed(2)),
        normalizedUnit: conv.toStandard,
      };
    }
  }

  return null;
}

export function parseReferenceRange(
  refStr: string
): { low: number | null; high: number | null } | null {
  if (!refStr || refStr.trim() === "") return null;

  // Match patterns like "4.0-5.6", "4.0 – 5.6", "4.0 to 5.6", "<5.6", ">4.0"
  const cleaned = refStr.trim();

  // Range: X-Y
  const rangeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*[-–—to]\s*(\d+(?:\.\d+)?)/i);
  if (rangeMatch) {
    return {
      low: parseFloat(rangeMatch[1]),
      high: parseFloat(rangeMatch[2]),
    };
  }

  // Upper bound only: <X or ≤X
  const upperMatch = cleaned.match(/[<≤]\s*(\d+(?:\.\d+)?)/);
  if (upperMatch) {
    return { low: null, high: parseFloat(upperMatch[1]) };
  }

  // Lower bound only: >X or ≥X
  const lowerMatch = cleaned.match(/[>≥]\s*(\d+(?:\.\d+)?)/);
  if (lowerMatch) {
    return { low: parseFloat(lowerMatch[1]), high: null };
  }

  // Single number with some modifier: "X to Y"
  const toMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*to\s*(\d+(?:\.\d+)?)/i);
  if (toMatch) {
    return {
      low: parseFloat(toMatch[1]),
      high: parseFloat(toMatch[2]),
    };
  }

  return null;
}

export function getFlag(
  value: number | null,
  low: number | null,
  high: number | null
): string | null {
  if (value === null || value === undefined) return null;
  if (low !== null && value < low) return "L";
  if (high !== null && value > high) return "H";
  return null;
}

export function determineConfidence(
  hasValue: boolean,
  hasRange: boolean,
  isKnownBiomarker: boolean
): "high" | "medium" | "low" {
  if (hasValue && isKnownBiomarker) return "high";
  if (hasValue && !isKnownBiomarker) return "medium";
  return "low";
}
