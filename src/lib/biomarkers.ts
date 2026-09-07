export interface BiomarkerDefinition {
  canonicalName: string;
  displayName: string;
  aliases: string[];
  units: string[];
  category: string;
  description: string;
}

export const BIOMARKERS: BiomarkerDefinition[] = [
  {
    canonicalName: "Hemoglobin",
    displayName: "Hemoglobin",
    aliases: ["Hgb", "Hb", "HGB", "Haemoglobin", "HEMOGLOBIN"],
    units: ["g/dL", "g/L", "mmol/L"],
    category: "CBC",
    description:
      "Hemoglobin carries oxygen in red blood cells. Low levels may indicate anemia.",
  },
  {
    canonicalName: "WBC",
    displayName: "WBC (White Blood Cells)",
    aliases: ["WBC", "White Blood Cell", "Leukocytes", "Leucocytes", "WBC Count"],
    units: ["×10⁹/L", "/uL", "/mm³", "K/uL", "10^9/L", "thou/uL"],
    category: "CBC",
    description:
      "White blood cells fight infection. Elevated levels may indicate infection or inflammation.",
  },
  {
    canonicalName: "RBC",
    displayName: "RBC (Red Blood Cells)",
    aliases: ["RBC", "Red Blood Cell", "Erythrocytes", "Red Cell Count"],
    units: ["×10¹²/L", "M/uL", "10^12/L", "million/uL"],
    category: "CBC",
    description:
      "Red blood cells carry oxygen throughout the body.",
  },
  {
    canonicalName: "Platelets",
    displayName: "Platelets",
    aliases: ["PLT", "Platelet", "Thrombocytes", "Platelet Count"],
    units: ["×10⁹/L", "K/uL", "10^9/L", "/uL", "thou/uL"],
    category: "CBC",
    description:
      "Platelets help blood clot. Abnormal levels may affect bleeding or clotting risk.",
  },
  {
    canonicalName: "Hematocrit",
    displayName: "Hematocrit",
    aliases: ["HCT", "Ht", "Packed Cell Volume", "PCV"],
    units: ["%", "L/L"],
    category: "CBC",
    description:
      "Hematocrit measures the proportion of blood made up of red blood cells.",
  },
  {
    canonicalName: "MCV",
    displayName: "MCV (Mean Corpuscular Volume)",
    aliases: ["MCV", "Mean Corpuscular Volume"],
    units: ["fL", "µm³"],
    category: "CBC",
    description:
      "Average red blood cell size. Helps classify types of anemia.",
  },
  {
    canonicalName: "MCH",
    displayName: "MCH (Mean Corpuscular Hemoglobin)",
    aliases: ["MCH", "Mean Corpuscular Hemoglobin"],
    units: ["pg"],
    category: "CBC",
    description:
      "Average amount of hemoglobin per red blood cell.",
  },
  {
    canonicalName: "MCHC",
    displayName: "MCHC (Mean Corpuscular Hemoglobin Concentration)",
    aliases: ["MCHC", "Mean Corpuscular Hemoglobin Conc"],
    units: ["g/dL", "g/L"],
    category: "CBC",
    description:
      "Average hemoglobin concentration in red blood cells.",
  },
  {
    canonicalName: "Neutrophils",
    displayName: "Neutrophils",
    aliases: ["NEUT", "Neutrophil", "NEU", "Abs Neutrophils"],
    units: ["×10⁹/L", "%", "10^9/L"],
    category: "CBC",
    description:
      "Most common white blood cell type. Elevated in bacterial infections.",
  },
  {
    canonicalName: "Lymphocytes",
    displayName: "Lymphocytes",
    aliases: ["LYMPH", "Lymphocyte", "LYM", "Abs Lymphocytes"],
    units: ["×10⁹/L", "%", "10^9/L"],
    category: "CBC",
    description:
      "White blood cells involved in immune response.",
  },
  {
    canonicalName: "Monocytes",
    displayName: "Monocytes",
    aliases: ["MONO", "Monocyte", "MON"],
    units: ["×10⁹/L", "%", "10^9/L"],
    category: "CBC",
    description:
      "White blood cells that help fight infections.",
  },
  {
    canonicalName: "Eosinophils",
    displayName: "Eosinophils",
    aliases: ["EO", "EOS", "Eosinophil"],
    units: ["×10⁹/L", "%", "10^9/L"],
    category: "CBC",
    description:
      "White blood cells involved in allergic reactions and parasite defense.",
  },
  {
    canonicalName: "Basophils",
    displayName: "Basophils",
    aliases: ["BASO", "BA", "Basophil"],
    units: ["×10⁹/L", "%", "10^9/L"],
    category: "CBC",
    description:
      "Least common white blood cell type.",
  },
  {
    canonicalName: "HbA1c",
    displayName: "HbA1c",
    aliases: ["A1C", "A1c", "Glycated Hemoglobin", "Glycated Haemoglobin", "Glycosylated Hemoglobin", "Glycosylated Haemoglobin", "Hemoglobin A1c", "HbA1c", "HBA1C"],
    units: ["%", "mmol/mol", "mmol/L"],
    category: "Diabetes",
    description:
      "Shows average blood sugar over the past 2-3 months. Used to monitor diabetes.",
  },
  {
    canonicalName: "Glucose",
    displayName: "Glucose",
    aliases: ["Glucose", "Blood Sugar", "FBS", "Fasting Blood Sugar", "RBS", "Random Blood Sugar", "PLASMA GLUCOSE", "Sugar"],
    units: ["mg/dL", "mmol/L"],
    category: "Diabetes",
    description:
      "Measures sugar level in blood. Elevated levels may indicate diabetes or prediabetes.",
  },
  {
    canonicalName: "Total Cholesterol",
    displayName: "Total Cholesterol",
    aliases: ["Cholesterol", "Total Cholesterol", "CHOL", "TC"],
    units: ["mg/dL", "mmol/L"],
    category: "Lipid",
    description:
      "Total amount of cholesterol in blood. Elevated levels increase heart disease risk.",
  },
  {
    canonicalName: "LDL Cholesterol",
    displayName: "LDL Cholesterol",
    aliases: ["LDL", "LDL Cholesterol", "Low-Density Lipoprotein", "Bad Cholesterol"],
    units: ["mg/dL", "mmol/L"],
    category: "Lipid",
    description:
      "Bad cholesterol. High levels increase heart disease and stroke risk.",
  },
  {
    canonicalName: "HDL Cholesterol",
    displayName: "HDL Cholesterol",
    aliases: ["HDL", "HDL Cholesterol", "High-Density Lipoprotein", "Good Cholesterol"],
    units: ["mg/dL", "mmol/L"],
    category: "Lipid",
    description:
      "Good cholesterol. Higher levels are associated with lower heart disease risk.",
  },
  {
    canonicalName: "Triglycerides",
    displayName: "Triglycerides",
    aliases: ["TRIG", "Triglyceride", "TG"],
    units: ["mg/dL", "mmol/L"],
    category: "Lipid",
    description:
      "Type of fat in blood. Elevated levels increase heart disease risk.",
  },
  {
    canonicalName: "TSH",
    displayName: "TSH (Thyroid Stimulating Hormone)",
    aliases: ["TSH", "Thyroid Stimulating Hormone", "Thyrotropin"],
    units: ["mIU/L", "uIU/mL", "µIU/mL", "mU/L", "uIU/L"],
    category: "Thyroid",
    description:
      "Controls thyroid hormone production. Abnormal levels indicate thyroid dysfunction.",
  },
  {
    canonicalName: "T3",
    displayName: "T3 (Triiodothyronine)",
    aliases: ["T3", "Triiodothyronine", "Free T3", "FT3"],
    units: ["ng/dL", "pg/mL", "pmol/L", "nmol/L"],
    category: "Thyroid",
    description:
      "Active thyroid hormone. Helps regulate metabolism.",
  },
  {
    canonicalName: "T4",
    displayName: "T4 (Thyroxine)",
    aliases: ["T4", "Thyroxine", "Free T4", "FT4"],
    units: ["µg/dL", "ng/dL", "pmol/L", "nmol/L"],
    category: "Thyroid",
    description:
      "Main thyroid hormone. Regulates metabolism and energy.",
  },
  {
    canonicalName: "ALT",
    displayName: "ALT (Alanine Transaminase)",
    aliases: ["ALT", "SGPT", "Alanine Transaminase", "Alanine Aminotransferase", "GPT"],
    units: ["U/L", "IU/L"],
    category: "Liver",
    description:
      "Liver enzyme. Elevated levels may indicate liver damage.",
  },
  {
    canonicalName: "AST",
    displayName: "AST (Aspartate Transaminase)",
    aliases: ["AST", "SGOT", "Aspartate Transaminase", "Aspartate Aminotransferase", "GOT"],
    units: ["U/L", "IU/L"],
    category: "Liver",
    description:
      "Liver enzyme. Elevated levels may indicate liver or muscle damage.",
  },
  {
    canonicalName: "GGT",
    displayName: "GGT (Gamma-Glutamyl Transferase)",
    aliases: ["GGT", "Gamma-GT", "Gamma Glutamyl Transferase", "GGTP"],
    units: ["U/L", "IU/L"],
    category: "Liver",
    description:
      "Liver enzyme. Elevated levels may indicate bile duct or liver disease.",
  },
  {
    canonicalName: "Alkaline Phosphatase",
    displayName: "Alkaline Phosphatase",
    aliases: ["ALP", "Alkaline Phosphatase", "Alk Phos"],
    units: ["U/L", "IU/L"],
    category: "Liver",
    description:
      "Enzyme found in liver and bone. Elevated levels may indicate liver or bone disease.",
  },
  {
    canonicalName: "Total Bilirubin",
    displayName: "Total Bilirubin",
    aliases: ["Bilirubin", "Total Bilirubin", "TBIL", "BILI"],
    units: ["mg/dL", "µmol/L", "umol/L"],
    category: "Liver",
    description:
      "Waste product from red blood cell breakdown. Elevated levels cause jaundice.",
  },
  {
    canonicalName: "Direct Bilirubin",
    displayName: "Direct Bilirubin",
    aliases: ["Direct Bilirubin", "Conjugated Bilirubin", "DBIL"],
    units: ["mg/dL", "µmol/L", "umol/L"],
    category: "Liver",
    description:
      "Water-soluble form of bilirubin from the liver.",
  },
  {
    canonicalName: "Albumin",
    displayName: "Albumin",
    aliases: ["Albumin", "ALB"],
    units: ["g/dL", "g/L"],
    category: "Liver",
    description:
      "Main protein in blood. Low levels may indicate liver or kidney disease.",
  },
  {
    canonicalName: "Total Protein",
    displayName: "Total Protein",
    aliases: ["Total Protein", "TP", "Serum Protein"],
    units: ["g/dL", "g/L"],
    category: "Liver",
    description:
      "Total protein in blood. May indicate nutritional or liver/kidney issues.",
  },
  {
    canonicalName: "Creatinine",
    displayName: "Creatinine",
    aliases: ["Creatinine", "CREA", "Cr", "Serum Creatinine"],
    units: ["mg/dL", "µmol/L", "umol/L"],
    category: "Kidney",
    description:
      "Waste product filtered by kidneys. Elevated levels indicate reduced kidney function.",
  },
  {
    canonicalName: "BUN",
    displayName: "BUN (Blood Urea Nitrogen)",
    aliases: ["BUN", "Blood Urea Nitrogen", "Urea"],
    units: ["mg/dL", "mmol/L"],
    category: "Kidney",
    description:
      "Waste product from protein breakdown. Elevated levels may indicate kidney issues.",
  },
  {
    canonicalName: "Uric Acid",
    displayName: "Uric Acid",
    aliases: ["Uric Acid", "UA", "Urate"],
    units: ["mg/dL", "µmol/L", "umol/L"],
    category: "Kidney",
    description:
      "Waste from purine breakdown. Elevated levels may cause gout.",
  },
  {
    canonicalName: "Sodium",
    displayName: "Sodium",
    aliases: ["Sodium", "Na", "Na+", "Na+"],
    units: ["mmol/L", "mEq/L"],
    category: "Electrolyte",
    description:
      "Electrolyte that regulates fluid balance and nerve function.",
  },
  {
    canonicalName: "Potassium",
    displayName: "Potassium",
    aliases: ["Potassium", "K", "K+", "K+"],
    units: ["mmol/L", "mEq/L"],
    category: "Electrolyte",
    description:
      "Electrolyte essential for heart and muscle function.",
  },
  {
    canonicalName: "Chloride",
    displayName: "Chloride",
    aliases: ["Chloride", "Cl", "Cl-", "Cl-"],
    units: ["mmol/L", "mEq/L"],
    category: "Electrolyte",
    description:
      "Electrolyte that helps maintain fluid balance.",
  },
  {
    canonicalName: "Calcium",
    displayName: "Calcium",
    aliases: ["Calcium", "Ca", "Ca2+", "Ca+"],
    units: ["mg/dL", "mmol/L"],
    category: "Electrolyte",
    description:
      "Mineral essential for bones, muscles, and nerves.",
  },
  {
    canonicalName: "Phosphorus",
    displayName: "Phosphorus",
    aliases: ["Phosphorus", "Phosphate", "P", "PO4"],
    units: ["mg/dL", "mmol/L"],
    category: "Electrolyte",
    description:
      "Mineral that works with calcium for bone health.",
  },
  {
    canonicalName: "Magnesium",
    displayName: "Magnesium",
    aliases: ["Magnesium", "Mg", "Mg2+"],
    units: ["mg/dL", "mmol/L"],
    category: "Electrolyte",
    description:
      "Mineral essential for muscle and nerve function.",
  },
  {
    canonicalName: "Vitamin D",
    displayName: "Vitamin D (25-OH)",
    aliases: ["Vitamin D", "25-OH Vitamin D", "25 Hydroxy Vitamin D", "25(OH)D", "Vit D", "Calcifediol"],
    units: ["ng/mL", "nmol/L"],
    category: "Vitamin",
    description:
      "Important for bone health and immune function. Low levels are common.",
  },
  {
    canonicalName: "Vitamin B12",
    displayName: "Vitamin B12",
    aliases: ["Vitamin B12", "Vit B12", "B12", "Cobalamin"],
    units: ["pg/mL", "ng/L", "pmol/L"],
    category: "Vitamin",
    description:
      "Essential for nerve function and red blood cell production.",
  },
  {
    canonicalName: "Folate",
    displayName: "Folate",
    aliases: ["Folate", "Folic Acid", "Vitamin B9", "RBC Folate"],
    units: ["ng/mL", "nmol/L", "µg/L"],
    category: "Vitamin",
    description:
      "B vitamin important for cell division and red blood cell production.",
  },
  {
    canonicalName: "Ferritin",
    displayName: "Ferritin",
    aliases: ["Ferritin", "FE", "Serum Ferritin"],
    units: ["ng/mL", "µg/L", "ug/L", "ng/mL"],
    category: "Iron",
    description:
      "Stored form of iron. Low levels indicate iron deficiency.",
  },
  {
    canonicalName: "Iron",
    displayName: "Serum Iron",
    aliases: ["Iron", "Serum Iron", "Fe", "Serum Fe"],
    units: ["µg/dL", "ug/dL", "µmol/L", "umol/L", "mg/dL"],
    category: "Iron",
    description:
      "Amount of iron in blood serum.",
  },
  {
    canonicalName: "TIBC",
    displayName: "TIBC (Total Iron Binding Capacity)",
    aliases: ["TIBC", "Total Iron Binding Capacity"],
    units: ["µg/dL", "ug/dL", "µmol/L", "umol/L"],
    category: "Iron",
    description:
      "Measures how well iron can be transported in blood.",
  },
  {
    canonicalName: "Transferrin Saturation",
    displayName: "Transferrin Saturation",
    aliases: ["Transferrin Saturation", "TSAT", "Iron Saturation"],
    units: ["%"],
    category: "Iron",
    description:
      "Percentage of transferrin saturated with iron.",
  },
  {
    canonicalName: "Insulin",
    displayName: "Insulin",
    aliases: ["Insulin", "Fasting Insulin", "Serum Insulin"],
    units: ["µIU/mL", "uIU/mL", "pmol/L", "mIU/L"],
    category: "Diabetes",
    description:
      "Hormone that regulates blood sugar. Elevated levels may indicate insulin resistance.",
  },
  {
    canonicalName: "CRP",
    displayName: "CRP (C-Reactive Protein)",
    aliases: ["CRP", "C-Reactive Protein", "HS-CRP", "High Sensitivity CRP"],
    units: ["mg/L", "mg/dL"],
    category: "Inflammation",
    description:
      "Marker of inflammation. Elevated levels may indicate infection or inflammation.",
  },
  {
    canonicalName: "ESR",
    displayName: "ESR (Erythrocyte Sedimentation Rate)",
    aliases: ["ESR", "Erythrocyte Sedimentation Rate", "Sedimentation Rate", "Sed Rate"],
    units: ["mm/hr", "mm/h"],
    category: "Inflammation",
    description:
      "Measures inflammation by how fast red blood cells settle.",
  },
  {
    canonicalName: "Creatine Kinase",
    displayName: "Creatine Kinase",
    aliases: ["CK", "Creatine Kinase", "CPK", "Creatine Phosphokinase"],
    units: ["U/L", "IU/L"],
    category: "Muscle",
    description:
      "Enzyme found in muscles. Elevated levels may indicate muscle damage.",
  },
  {
    canonicalName: "Lactate Dehydrogenase",
    displayName: "LDH",
    aliases: ["LDH", "Lactate Dehydrogenase", "LD"],
    units: ["U/L", "IU/L"],
    category: "Other",
    description:
      "Enzyme found throughout the body. Elevated levels may indicate tissue damage.",
  },
  {
    canonicalName: "Amylase",
    displayName: "Amylase",
    aliases: ["Amylase", "AMY"],
    units: ["U/L", "IU/L"],
    category: "Pancreas",
    description:
      "Enzyme from the pancreas. Elevated levels may indicate pancreatitis.",
  },
  {
    canonicalName: "Lipase",
    displayName: "Lipase",
    aliases: ["Lipase", "LPS"],
    units: ["U/L", "IU/L"],
    category: "Pancreas",
    description:
      "Enzyme from the pancreas. Elevated levels may indicate pancreatitis.",
  },
];

export interface NormalizedResult {
  canonicalName: string;
  displayName: string;
  category: string;
  aliases: string[];
  unit: string;
  reference: string;
}

export function normalizeBiomarker(testName: string): NormalizedResult | null {
  const cleaned = testName.trim().toLowerCase();

  for (const bm of BIOMARKERS) {
    for (const alias of bm.aliases) {
      if (cleaned === alias.toLowerCase()) {
        return {
          canonicalName: bm.canonicalName,
          displayName: bm.displayName,
          category: bm.category,
          aliases: bm.aliases,
          unit: bm.units[0],
          reference: "",
        };
      }
    }
  }

  // Fuzzy match: pick the longest alias contained in the test name,
  // so "Glycated Haemoglobin" matches HbA1c, not the generic "Haemoglobin".
  let best: NormalizedResult | null = null;
  let bestLen = 0;
  for (const bm of BIOMARKERS) {
    for (const alias of bm.aliases) {
      const aliasLower = alias.toLowerCase();
      if (
        cleaned.includes(aliasLower) &&
        aliasLower.length > 3 &&
        aliasLower.length > bestLen
      ) {
        bestLen = aliasLower.length;
        best = {
          canonicalName: bm.canonicalName,
          displayName: bm.displayName,
          category: bm.category,
          aliases: bm.aliases,
          unit: bm.units[0],
          reference: "",
        };
      }
    }
  }
  if (best) return best;

  // For "Other Report" fallback
  return {
    canonicalName: testName.trim(),
    displayName: testName.trim(),
    category: "Other",
    aliases: [testName.trim()],
    unit: "",
    reference: "",
  };
}

export function findBiomarkerByName(name: string): BiomarkerDefinition | null {
  return BIOMARKERS.find((b) => b.canonicalName === name) ?? null;
}

export function isAliasOfCanonical(alias: string, canonical: string): boolean {
  const bm = findBiomarkerByName(canonical);
  if (!bm) return false;
  return bm.aliases.some(
    (a) => a.toLowerCase() === alias.trim().toLowerCase()
  );
}

export function suggestCanonicalNames(searchTerm: string): string[] {
  const term = searchTerm.toLowerCase();
  return BIOMARKERS.filter(
    (b) =>
      b.displayName.toLowerCase().includes(term) ||
      b.canonicalName.toLowerCase().includes(term) ||
      b.aliases.some((a) => a.toLowerCase().includes(term))
  ).map((b) => b.canonicalName);
}

export function getBiomarkerCategories(): string[] {
  return [...new Set(BIOMARKERS.map((b) => b.category))];
}

export const REPORT_CATEGORIES = [
  { value: "cbc", label: "CBC (Complete Blood Count)" },
  { value: "lipid", label: "Lipid Profile" },
  { value: "diabetes", label: "Diabetes / Glucose" },
  { value: "hba1c", label: "HbA1c" },
  { value: "thyroid", label: "Thyroid" },
  { value: "liver", label: "Liver Function" },
  { value: "kidney", label: "Kidney Function" },
  { value: "vitamin", label: "Vitamin Test" },
  { value: "iron", label: "Iron Studies" },
  { value: "urine", label: "Urine Test" },
  { value: "general", label: "General Blood Test" },
  { value: "other", label: "Other Laboratory Report" },
];

export function getReportCategoryLabel(reportType: string | null): string {
  if (!reportType) return "Blood test";
  const match = REPORT_CATEGORIES.find((c) => c.value === reportType);
  return match ? match.label : reportType;
}
