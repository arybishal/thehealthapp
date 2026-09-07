import { parseReportText } from "./parser";
import { normalizeBiomarker } from "./biomarkers";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exitCode = 1;
  }
}

// 1. CBC report
const cbc = parseReportText(`LABORATORY DIAGNOSTICS
Patient: John Smith
Date: 12/08/2026

Test                  Result   Unit      Reference
Hemoglobin            14.2     g/dL      13.0-17.0
WBC                   7.2      x10^9/L   4.0-11.0
Platelets             245      x10^9/L   150-450
HbA1c                 5.7      %         4.0-5.6`);
assert(cbc.results.length === 4, `CBC: expected 4 results, got ${cbc.results.length}`);
assert(cbc.reportDate === "2026-08-12", `CBC: date parsed as ${cbc.reportDate}`);
assert(cbc.patientName?.includes("John") === true, `CBC: patient parsed as ${cbc.patientName}`);
assert(
  cbc.results.find((r) => r.canonicalName === "Hemoglobin")?.originalValue === "14.2 g/dL",
  "CBC: hemoglobin value"
);
assert(
  cbc.results.find((r) => r.canonicalName === "HbA1c")?.referenceHigh === 5.6,
  "CBC: HbA1c ref high"
);

// 2. Vitamin D with parens ref range
const vit = parseReportText(`Vitamin D, 25-OH      31.5       ng/mL     (30.0-100.0)`);
assert(vit.results.length === 1, `VitD: expected 1 result, got ${vit.results.length}`);
const vitD = vit.results[0];
assert(vitD.canonicalName === "Vitamin D", `VitD: canonical = ${vitD.canonicalName}`);
assert(vitD.referenceLow === 30, `VitD: refLow = ${vitD.referenceLow}`);
assert(vitD.referenceHigh === 100, `VitD: refHigh = ${vitD.referenceHigh}`);
assert(vitD.normalizedValue === 31.5, `VitD: value = ${vitD.normalizedValue}`);

// 3. Blood sugar glucose
const sugar = parseReportText(`Fasting Blood Sugar   98        mg/dL     70-110`);
assert(sugar.results.length === 1, `Sugar: expected 1 result, got ${sugar.results.length}`);
assert(
  sugar.results[0].canonicalName === "Glucose",
  `Sugar: canonical = ${sugar.results[0].canonicalName}`
);
assert(sugar.results[0].originalValue === "98 mg/dL", `Sugar: value`);

// 4. Original value preserved
assert(cbc.results[0].originalValue === "14.2 g/dL", "Original value preserved");

// 5. Normalization alias
const nb = normalizeBiomarker("A1C");
assert(nb?.canonicalName === "HbA1c", `Alias A1C -> ${nb?.canonicalName}`);
const nb2 = normalizeBiomarker("Glycated Haemoglobin");
assert(nb2?.canonicalName === "HbA1c", `Alias Glycated Haemoglobin -> ${nb2?.canonicalName}`);
const nb3 = normalizeBiomarker("SGPT");
assert(nb3?.canonicalName === "ALT", `Alias SGPT -> ${nb3?.canonicalName}`);

console.log(process.exitCode ? "PARSER TESTS FAILED" : "PARSER TESTS PASSED");