import { generateSummary } from "./summary";

const base = {
  originalValue: "0",
  originalUnit: "mg/dL",
  normalizedValue: 0,
  referenceLow: 0,
  referenceHigh: 100,
  flag: null,
  confirmed: true,
};

function git(s: Awaited<ReturnType<typeof generateSummary>>) {
  return [s.headline, s.points.map((p) => `${p.status}:${p.text.slice(0, 30)}`)];
}

const high = generateSummary([
  { ...base, canonicalName: "Glucose", originalValue: "140", normalizedValue: 140, flag: "H", referenceHigh: 110 },
]);
const low = generateSummary([
  { ...base, canonicalName: "Vitamin D", originalValue: "18", normalizedValue: 18, flag: "L", referenceHigh: null },
]);
const unconfirmedSkipped = generateSummary([
  { ...base, canonicalName: "Glucose", confirmed: false },
  { ...base, canonicalName: "TSH", originalValue: "2.0", normalizedValue: 2, flag: null },
]);
const allNormal = generateSummary([
  { ...base, canonicalName: "Sodium", originalValue: "140", normalizedValue: 140, flag: null },
]);

console.assert(high.points[0].status === "high", "high flag maps to high point");
console.assert(high.headline.includes("above"), "headline mentions above range");
console.assert(low.points[0].status === "low", "low flag maps to low point");
console.assert(
  low.headline.includes("below"),
  "headline mentions below range"
);
console.assert(
  unconfirmedSkipped.verifiedCount === 1,
  "unconfirmed results are excluded from summary"
);
console.assert(
  unconfirmedSkipped.points.length === 1 &&
    unconfirmedSkipped.points[0].status === "normal",
  "only confirmed results get points"
);
console.assert(
  allNormal.headline.includes("within"),
  "all-normal headline says within range"
);

console.log(git(high));
console.log(git(low));
console.log("summary self-check passed");