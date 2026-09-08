import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Provide it in the deployment environment or a local .env file."
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@thebloodtracker.com";
const DEMO_PASSWORD = "demo1234";

interface DemoResult {
  co: string;
  o: string;
  v: number;
  u: string;
  lo: number | null;
  hi: number | null;
}

interface DemoReport {
  title: string;
  reportType: string;
  laboratoryName: string;
  labLocation: string;
  doctorName: string | null;
  reportDate: Date;
  reportNumber: string;
  results: DemoResult[];
}

interface DemoVital {
  type: string;
  value: number;
  unit: string;
  date: Date;
  note?: string;
}

interface DemoPatient {
  name: string;
  relationship: string;
  dob: Date;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  height: number;
  weight: number;
  allergies: string;
  conditions: string;
  medications: string;
  surgeries: string;
  familyHistory: string;
  notes: string;
  reports: DemoReport[];
  vitals: DemoVital[];
}

const D = (
  co: string,
  o: string,
  v: number,
  u: string,
  lo: number | null,
  hi: number | null
): DemoResult => ({ co, o, v, u, lo, hi });

const flagOf = (v: number, lo: number | null, hi: number | null): string | null => {
  if (hi !== null && v > hi) return "H";
  if (lo !== null && v < lo) return "L";
  return null;
};

const patients: DemoPatient[] = [
  {
    name: "Hari Shrestha",
    relationship: "Self",
    dob: new Date("1982-03-14"),
    gender: "male",
    bloodGroup: "O+",
    phone: "+977-9841-238017",
    email: "hari.shrestha@example.com",
    address: "Baneshwor, Kathmandu",
    emergencyContact: "Maina Shrestha (mother) +977-9851-122084",
    height: 173,
    weight: 76,
    allergies: "Grass pollen, dust mites",
    conditions: "Seasonal allergic rhinitis",
    medications: "None",
    surgeries: "Appendectomy (2015)",
    familyHistory: "Father - hypertension; Mother - hypothyroidism",
    notes: "Sample demo record. No real medical history.",
    reports: [
      {
        title: "Full Blood Count - Jun 2026",
        reportType: "cbc",
        laboratoryName: "MetroLab Pathology",
        labLocation: "Kathmandu",
        doctorName: "Dr. S. Adhikari",
        reportDate: new Date("2026-06-10"),
        reportNumber: "TB-2026-04011",
        results: [
          D("Hemoglobin", "Hemoglobin", 14.8, "g/dL", 13, 17),
          D("Hematocrit", "HCT", 43.9, "%", 38, 54),
          D("RBC", "RBC Count", 5.1, "x10^12/L", 4.5, 5.5),
          D("WBC", "WBC Count", 6.4, "x10^9/L", 4, 11),
          D("Platelets", "Platelets", 262, "x10^9/L", 150, 450),
          D("Neutrophils", "Neutrophils", 58, "%", 40, 75),
          D("Lymphocytes", "Lymphocytes", 33, "%", 20, 45),
        ],
      },
      {
        title: "Lipid Profile - Jun 2026",
        reportType: "lipid",
        laboratoryName: "MetroLab Pathology",
        labLocation: "Kathmandu",
        doctorName: "Dr. S. Adhikari",
        reportDate: new Date("2026-06-10"),
        reportNumber: "TB-2026-04012",
        results: [
          D("Total Cholesterol", "Total Cholesterol", 204, "mg/dL", null, 200),
          D("LDL Cholesterol", "LDL Cholesterol", 132, "mg/dL", null, 100),
          D("HDL Cholesterol", "HDL Cholesterol", 47, "mg/dL", 40, 60),
          D("Triglycerides", "Triglycerides", 142, "mg/dL", null, 150),
          D("VLDL", "VLDL", 28, "mg/dL", 5, 40),
        ],
      },
      {
        title: "HbA1c & Glucose - Jul 2026",
        reportType: "diabetes",
        laboratoryName: "Sunrise Diagnostic Centre",
        labLocation: "Patan",
        doctorName: "Dr. R. Sharma",
        reportDate: new Date("2026-07-22"),
        reportNumber: "TB-2026-04788",
        results: [
          D("HbA1c", "HbA1c", 5.9, "%", 4, 5.6),
          D("Glucose", "Fasting Blood Sugar", 112, "mg/dL", 70, 110),
        ],
      },
      {
        title: "Vitamin D & B12 - Aug 2026",
        reportType: "vitamins",
        laboratoryName: "City General Diagnostics",
        labLocation: "Lalitpur",
        doctorName: "Dr. P. Koirala",
        reportDate: new Date("2026-08-05"),
        reportNumber: "TB-2026-05203",
        results: [
          D("Vitamin D", "Vitamin D (25-OH)", 34, "ng/mL", 30, 100),
          D("Vitamin B12", "Vitamin B12", 456, "pg/mL", 200, 900),
        ],
      },
      {
        title: "Liver Function Test - Sep 2026",
        reportType: "liver",
        laboratoryName: "Lumbini Pathlab",
        labLocation: "Butwal",
        doctorName: null,
        reportDate: new Date("2026-09-14"),
        reportNumber: "TB-2026-05844",
        results: [
          D("ALT", "ALT (SGPT)", 31, "U/L", 7, 45),
          D("AST", "AST (SGOT)", 28, "U/L", 10, 40),
          D("ALP", "Alkaline Phosphatase", 84, "U/L", 40, 130),
          D("Bilirubin Total", "Bilirubin - Total", 0.9, "mg/dL", null, 1.2),
          D("Albumin", "Albumin", 4.4, "g/dL", 3.5, 5.2),
        ],
      },
      {
        title: "Kidney Function Test - Sep 2026",
        reportType: "kidney",
        laboratoryName: "Lumbini Pathlab",
        labLocation: "Butwal",
        doctorName: null,
        reportDate: new Date("2026-09-14"),
        reportNumber: "TB-2026-05845",
        results: [
          D("Creatinine", "Serum Creatinine", 1.05, "mg/dL", 0.7, 1.3),
          D("eGFR", "eGFR", 84, "mL/min/1.73m2", 60, null),
          D("Urea", "Blood Urea", 32, "mg/dL", 15, 45),
          D("Sodium", "Sodium", 141, "mmol/L", 135, 145),
          D("Potassium", "Potassium", 4.2, "mmol/L", 3.5, 5),
        ],
      },
      {
        title: "Lipid Profile Follow-up - Oct 2026",
        reportType: "lipid",
        laboratoryName: "Sunrise Diagnostic Centre",
        labLocation: "Patan",
        doctorName: "Dr. R. Sharma",
        reportDate: new Date("2026-10-08"),
        reportNumber: "TB-2026-06411",
        results: [
          D("Total Cholesterol", "Total Cholesterol", 192, "mg/dL", null, 200),
          D("LDL Cholesterol", "LDL Cholesterol", 124, "mg/dL", null, 100),
          D("HDL Cholesterol", "HDL Cholesterol", 49, "mg/dL", 40, 60),
          D("Triglycerides", "Triglycerides", 138, "mg/dL", null, 150),
        ],
      },
      {
        title: "HbA1c Follow-up - Oct 2026",
        reportType: "diabetes",
        laboratoryName: "City General Diagnostics",
        labLocation: "Lalitpur",
        doctorName: "Dr. P. Koirala",
        reportDate: new Date("2026-10-12"),
        reportNumber: "TB-2026-06503",
        results: [
          D("HbA1c", "HbA1c", 5.7, "%", 4, 5.6),
          D("Glucose", "Fasting Blood Sugar", 104, "mg/dL", 70, 110),
          D("Glucose", "Post-meal Blood Sugar", 138, "mg/dL", null, 140),
        ],
      },
    ],
    vitals: [
      { type: "weight", value: 76.2, unit: "kg", date: new Date("2026-06-15") },
      { type: "blood_pressure", value: 124, unit: "mmHg", date: new Date("2026-06-15") },
      { type: "heart_rate", value: 72, unit: "bpm", date: new Date("2026-06-15") },
      { type: "blood_sugar", value: 108, unit: "mg/dL", date: new Date("2026-06-17"), note: "Fasting, morning" },
      { type: "temperature", value: 36.5, unit: "C", date: new Date("2026-06-15") },
      { type: "bmi", value: 25.4, unit: "kg/m2", date: new Date("2026-06-15") },
      { type: "weight", value: 76.0, unit: "kg", date: new Date("2026-07-15") },
      { type: "blood_pressure", value: 122, unit: "mmHg", date: new Date("2026-07-15") },
      { type: "heart_rate", value: 70, unit: "bpm", date: new Date("2026-07-15") },
      { type: "blood_sugar", value: 102, unit: "mg/dL", date: new Date("2026-07-20"), note: "Fasting, morning" },
      { type: "temperature", value: 36.4, unit: "C", date: new Date("2026-07-15") },
      { type: "bmi", value: 25.3, unit: "kg/m2", date: new Date("2026-07-15") },
      { type: "weight", value: 75.6, unit: "kg", date: new Date("2026-08-15") },
      { type: "blood_pressure", value: 120, unit: "mmHg", date: new Date("2026-08-15") },
      { type: "heart_rate", value: 71, unit: "bpm", date: new Date("2026-08-15") },
      { type: "temperature", value: 36.6, unit: "C", date: new Date("2026-08-15") },
      { type: "bmi", value: 25.1, unit: "kg/m2", date: new Date("2026-08-15") },
      { type: "weight", value: 75.2, unit: "kg", date: new Date("2026-09-20") },
      { type: "blood_pressure", value: 118, unit: "mmHg", date: new Date("2026-09-20") },
      { type: "heart_rate", value: 68, unit: "bpm", date: new Date("2026-09-20") },
      { type: "blood_sugar", value: 99, unit: "mg/dL", date: new Date("2026-09-21"), note: "Fasting, morning" },
      { type: "temperature", value: 36.5, unit: "C", date: new Date("2026-09-20") },
      { type: "bmi", value: 24.9, unit: "kg/m2", date: new Date("2026-09-20") },
      { type: "weight", value: 74.9, unit: "kg", date: new Date("2026-10-10") },
      { type: "blood_pressure", value: 118, unit: "mmHg", date: new Date("2026-10-10") },
      { type: "heart_rate", value: 69, unit: "bpm", date: new Date("2026-10-10") },
      { type: "blood_sugar", value: 96, unit: "mg/dL", date: new Date("2026-10-12"), note: "Fasting, morning" },
      { type: "temperature", value: 36.5, unit: "C", date: new Date("2026-10-10") },
      { type: "bmi", value: 24.8, unit: "kg/m2", date: new Date("2026-10-10") },
    ],
  },
  {
    name: "Krishna Shrestha",
    relationship: "Father",
    dob: new Date("1955-05-30"),
    gender: "male",
    bloodGroup: "B+",
    phone: "+977-9851-122084",
    email: "krishna.shrestha@example.com",
    address: "Baneshwor, Kathmandu",
    emergencyContact: "Hari Shrestha (son) +977-9841-238017",
    height: 170,
    weight: 68,
    allergies: "Penicillin",
    conditions: "Hypertension, Type 2 diabetes (sample record)",
    medications: "Amlodipine 5mg daily, Metformin 500mg twice daily",
    surgeries: "None",
    familyHistory: "Father - coronary heart disease",
    notes: "Sample demo record. Health conditions are fictional sample data.",
    reports: [
      {
        title: "Full Blood Count - Aug 2026",
        reportType: "cbc",
        laboratoryName: "Himalayan Medical Laboratory",
        labLocation: "Lalitpur",
        doctorName: "Dr. K. Basnet",
        reportDate: new Date("2026-08-18"),
        reportNumber: "TB-2026-05602",
        results: [
          D("Hemoglobin", "Hemoglobin", 14.1, "g/dL", 13, 17),
          D("Hematocrit", "HCT", 41.5, "%", 38, 54),
          D("RBC", "RBC Count", 4.8, "x10^12/L", 4.5, 5.5),
          D("WBC", "WBC Count", 5.9, "x10^9/L", 4, 11),
          D("Platelets", "Platelets", 231, "x10^9/L", 150, 450),
        ],
      },
      {
        title: "Kidney Function - Aug 2026",
        reportType: "kidney",
        laboratoryName: "Himalayan Medical Laboratory",
        labLocation: "Lalitpur",
        doctorName: "Dr. K. Basnet",
        reportDate: new Date("2026-08-18"),
        reportNumber: "TB-2026-05603",
        results: [
          D("Creatinine", "Serum Creatinine", 1.31, "mg/dL", 0.7, 1.3),
          D("eGFR", "eGFR", 52, "mL/min/1.73m2", 60, null),
          D("Urea", "Blood Urea", 34, "mg/dL", 15, 45),
          D("Sodium", "Sodium", 140, "mmol/L", 135, 145),
          D("Potassium", "Potassium", 4.5, "mmol/L", 3.5, 5),
        ],
      },
      {
        title: "HbA1c & Glucose - Aug 2026",
        reportType: "diabetes",
        laboratoryName: "City General Diagnostics",
        labLocation: "Lalitpur",
        doctorName: "Dr. M. Gurung",
        reportDate: new Date("2026-08-21"),
        reportNumber: "TB-2026-05661",
        results: [
          D("HbA1c", "HbA1c", 6.9, "%", 4, 5.6),
          D("Glucose", "Fasting Blood Sugar", 152, "mg/dL", 70, 110),
          D("Glucose", "Post-meal Blood Sugar", 178, "mg/dL", null, 140),
        ],
      },
      {
        title: "Lipid Profile - Sep 2026",
        reportType: "lipid",
        laboratoryName: "MetroLab Pathology",
        labLocation: "Kathmandu",
        doctorName: "Dr. M. Gurung",
        reportDate: new Date("2026-09-05"),
        reportNumber: "TB-2026-05890",
        results: [
          D("Total Cholesterol", "Total Cholesterol", 186, "mg/dL", null, 200),
          D("LDL Cholesterol", "LDL Cholesterol", 112, "mg/dL", null, 100),
          D("HDL Cholesterol", "HDL Cholesterol", 41, "mg/dL", 40, 60),
          D("Triglycerides", "Triglycerides", 152, "mg/dL", null, 150),
        ],
      },
      {
        title: "HbA1c Review - Sep 2026",
        reportType: "diabetes",
        laboratoryName: "City General Diagnostics",
        labLocation: "Lalitpur",
        doctorName: "Dr. M. Gurung",
        reportDate: new Date("2026-09-20"),
        reportNumber: "TB-2026-06023",
        results: [
          D("HbA1c", "HbA1c", 6.8, "%", 4, 5.6),
          D("Glucose", "Fasting Blood Sugar", 148, "mg/dL", 70, 110),
          D("Glucose", "Post-meal Blood Sugar", 172, "mg/dL", null, 140),
        ],
      },
      {
        title: "Lipid Follow-up - Oct 2026",
        reportType: "lipid",
        laboratoryName: "MetroLab Pathology",
        labLocation: "Kathmandu",
        doctorName: "Dr. M. Gurung",
        reportDate: new Date("2026-10-15"),
        reportNumber: "TB-2026-06540",
        results: [
          D("Total Cholesterol", "Total Cholesterol", 181, "mg/dL", null, 200),
          D("LDL Cholesterol", "LDL Cholesterol", 107, "mg/dL", null, 100),
          D("HDL Cholesterol", "HDL Cholesterol", 43, "mg/dL", 40, 60),
          D("Triglycerides", "Triglycerides", 147, "mg/dL", null, 150),
        ],
      },
      {
        title: "HbA1c Follow-up - Oct 2026",
        reportType: "diabetes",
        laboratoryName: "City General Diagnostics",
        labLocation: "Lalitpur",
        doctorName: "Dr. M. Gurung",
        reportDate: new Date("2026-10-16"),
        reportNumber: "TB-2026-06541",
        results: [
          D("HbA1c", "HbA1c", 6.7, "%", 4, 5.6),
          D("Glucose", "Fasting Blood Sugar", 144, "mg/dL", 70, 110),
          D("Glucose", "Post-meal Blood Sugar", 170, "mg/dL", null, 140),
        ],
      },
    ],
    vitals: [
      { type: "weight", value: 68.0, unit: "kg", date: new Date("2026-08-20") },
      { type: "blood_pressure", value: 142, unit: "mmHg", date: new Date("2026-08-20") },
      { type: "heart_rate", value: 78, unit: "bpm", date: new Date("2026-08-20") },
      { type: "blood_sugar", value: 158, unit: "mg/dL", date: new Date("2026-08-21"), note: "Fasting, morning" },
      { type: "temperature", value: 36.6, unit: "C", date: new Date("2026-08-20") },
      { type: "bmi", value: 23.5, unit: "kg/m2", date: new Date("2026-08-20") },
      { type: "weight", value: 67.8, unit: "kg", date: new Date("2026-09-08") },
      { type: "blood_pressure", value: 140, unit: "mmHg", date: new Date("2026-09-08") },
      { type: "heart_rate", value: 76, unit: "bpm", date: new Date("2026-09-08") },
      { type: "blood_sugar", value: 154, unit: "mg/dL", date: new Date("2026-09-15"), note: "Fasting, morning" },
      { type: "temperature", value: 36.5, unit: "C", date: new Date("2026-09-08") },
      { type: "bmi", value: 23.4, unit: "kg/m2", date: new Date("2026-09-08") },
      { type: "weight", value: 67.6, unit: "kg", date: new Date("2026-09-22") },
      { type: "blood_pressure", value: 138, unit: "mmHg", date: new Date("2026-09-22") },
      { type: "heart_rate", value: 75, unit: "bpm", date: new Date("2026-09-22") },
      { type: "blood_sugar", value: 151, unit: "mg/dL", date: new Date("2026-09-22"), note: "Fasting, morning" },
      { type: "bmi", value: 23.4, unit: "kg/m2", date: new Date("2026-09-22") },
      { type: "weight", value: 67.4, unit: "kg", date: new Date("2026-10-12") },
      { type: "blood_pressure", value: 136, unit: "mmHg", date: new Date("2026-10-12") },
      { type: "heart_rate", value: 74, unit: "bpm", date: new Date("2026-10-12") },
      { type: "blood_sugar", value: 146, unit: "mg/dL", date: new Date("2026-10-13"), note: "Fasting, morning" },
      { type: "temperature", value: 36.5, unit: "C", date: new Date("2026-10-12") },
      { type: "bmi", value: 23.3, unit: "kg/m2", date: new Date("2026-10-12") },
    ],
  },
  {
    name: "Maina Shrestha",
    relationship: "Mother",
    dob: new Date("1960-11-02"),
    gender: "female",
    bloodGroup: "A+",
    phone: "+977-9841-722031",
    email: "maina.shrestha@example.com",
    address: "Baneshwor, Kathmandu",
    emergencyContact: "Hari Shrestha (son) +977-9841-238017",
    height: 158,
    weight: 62,
    allergies: "None known",
    conditions: "Hypothyroidism (sample record)",
    medications: "Levothyroxine 50mcg daily",
    surgeries: "None",
    familyHistory: "Mother - hypothyroidism",
    notes: "Sample demo record. Health conditions are fictional sample data.",
    reports: [
      {
        title: "Lipid Profile - Dec 2025",
        reportType: "lipid",
        laboratoryName: "Himalayan Medical Laboratory",
        labLocation: "Lalitpur",
        doctorName: "Dr. S. Poudel",
        reportDate: new Date("2025-12-16"),
        reportNumber: "TB-2025-03320",
        results: [
          D("Total Cholesterol", "Total Cholesterol", 210, "mg/dL", null, 200),
          D("LDL Cholesterol", "LDL Cholesterol", 138, "mg/dL", null, 100),
          D("HDL Cholesterol", "HDL Cholesterol", 54, "mg/dL", 40, 60),
          D("Triglycerides", "Triglycerides", 132, "mg/dL", null, 150),
        ],
      },
      {
        title: "Thyroid Profile - Feb 2026",
        reportType: "thyroid",
        laboratoryName: "MetroLab Pathology",
        labLocation: "Kathmandu",
        doctorName: "Dr. S. Poudel",
        reportDate: new Date("2026-02-10"),
        reportNumber: "TB-2026-03552",
        results: [
          D("TSH", "TSH", 4.6, "mIU/L", 0.4, 4),
          D("T3", "Free T3", 3.0, "pg/mL", 2.3, 4.2),
          D("T4", "Free T4", 0.9, "ng/dL", 0.8, 1.8),
        ],
      },
      {
        title: "Vitamin D - Mar 2026",
        reportType: "vitamins",
        laboratoryName: "Sunrise Diagnostic Centre",
        labLocation: "Patan",
        doctorName: "Dr. U. Thapa",
        reportDate: new Date("2026-03-18"),
        reportNumber: "TB-2026-03821",
        results: [
          D("Vitamin D", "Vitamin D (25-OH)", 22, "ng/mL", 30, 100),
          D("Calcium", "Calcium", 9.0, "mg/dL", 8.5, 10.5),
        ],
      },
      {
        title: "Full Blood Count & HbA1c - May 2026",
        reportType: "cbc",
        laboratoryName: "City General Diagnostics",
        labLocation: "Lalitpur",
        doctorName: "Dr. U. Thapa",
        reportDate: new Date("2026-05-06"),
        reportNumber: "TB-2026-04466",
        results: [
          D("Hemoglobin", "Hemoglobin", 13.1, "g/dL", 12, 15.5),
          D("Hematocrit", "HCT", 39.0, "%", 36, 46),
          D("RBC", "RBC Count", 4.4, "x10^12/L", 3.8, 5),
          D("WBC", "WBC Count", 5.6, "x10^9/L", 4, 11),
          D("Platelets", "Platelets", 248, "x10^9/L", 150, 450),
          D("HbA1c", "HbA1c", 5.6, "%", 4, 5.6),
        ],
      },
      {
        title: "Liver Function - Jul 2026",
        reportType: "liver",
        laboratoryName: "Lumbini Pathlab",
        labLocation: "Butwal",
        doctorName: null,
        reportDate: new Date("2026-07-21"),
        reportNumber: "TB-2026-05430",
        results: [
          D("ALT", "ALT (SGPT)", 26, "U/L", 7, 45),
          D("AST", "AST (SGOT)", 24, "U/L", 10, 40),
          D("ALP", "Alkaline Phosphatase", 96, "U/L", 40, 130),
          D("Bilirubin Total", "Bilirubin - Total", 0.8, "mg/dL", null, 1.2),
          D("Albumin", "Albumin", 4.2, "g/dL", 3.5, 5.2),
        ],
      },
      {
        title: "Kidney Function - Jul 2026",
        reportType: "kidney",
        laboratoryName: "Lumbini Pathlab",
        labLocation: "Butwal",
        doctorName: null,
        reportDate: new Date("2026-07-21"),
        reportNumber: "TB-2026-05431",
        results: [
          D("Creatinine", "Serum Creatinine", 0.72, "mg/dL", 0.6, 1.1),
          D("eGFR", "eGFR", 90, "mL/min/1.73m2", 60, null),
          D("Urea", "Blood Urea", 28, "mg/dL", 15, 45),
          D("Sodium", "Sodium", 139, "mmol/L", 135, 145),
          D("Potassium", "Potassium", 4.1, "mmol/L", 3.5, 5),
        ],
      },
      {
        title: "Thyroid Follow-up - Aug 2026",
        reportType: "thyroid",
        laboratoryName: "MetroLab Pathology",
        labLocation: "Kathmandu",
        doctorName: "Dr. S. Poudel",
        reportDate: new Date("2026-08-12"),
        reportNumber: "TB-2026-05644",
        results: [
          D("TSH", "TSH", 3.9, "mIU/L", 0.4, 4),
          D("T3", "Free T3", 3.1, "pg/mL", 2.3, 4.2),
          D("T4", "Free T4", 1.0, "ng/dL", 0.8, 1.8),
        ],
      },
      {
        title: "Vitamin D & B12 - Sep 2026",
        reportType: "vitamins",
        laboratoryName: "Sunrise Diagnostic Centre",
        labLocation: "Patan",
        doctorName: "Dr. U. Thapa",
        reportDate: new Date("2026-09-09"),
        reportNumber: "TB-2026-06054",
        results: [
          D("Vitamin D", "Vitamin D (25-OH)", 34, "ng/mL", 30, 100),
          D("Vitamin B12", "Vitamin B12", 489, "pg/mL", 200, 900),
          D("Ferritin", "Ferritin", 88, "ng/mL", 12, 150),
        ],
      },
      {
        title: "Thyroid Review - Oct 2026",
        reportType: "thyroid",
        laboratoryName: "MetroLab Pathology",
        labLocation: "Kathmandu",
        doctorName: "Dr. S. Poudel",
        reportDate: new Date("2026-10-14"),
        reportNumber: "TB-2026-06602",
        results: [
          D("TSH", "TSH", 3.6, "mIU/L", 0.4, 4),
          D("T3", "Free T3", 3.2, "pg/mL", 2.3, 4.2),
          D("T4", "Free T4", 1.1, "ng/dL", 0.8, 1.8),
        ],
      },
      {
        title: "HbA1c & Glucose - Oct 2026",
        reportType: "diabetes",
        laboratoryName: "City General Diagnostics",
        labLocation: "Lalitpur",
        doctorName: "Dr. U. Thapa",
        reportDate: new Date("2026-10-26"),
        reportNumber: "TB-2026-06734",
        results: [
          D("HbA1c", "HbA1c", 5.5, "%", 4, 5.6),
          D("Glucose", "Fasting Blood Sugar", 98, "mg/dL", 70, 110),
        ],
      },
      {
        title: "Lipid Follow-up - Oct 2026",
        reportType: "lipid",
        laboratoryName: "Himalayan Medical Laboratory",
        labLocation: "Lalitpur",
        doctorName: "Dr. S. Poudel",
        reportDate: new Date("2026-10-28"),
        reportNumber: "TB-2026-06788",
        results: [
          D("Total Cholesterol", "Total Cholesterol", 196, "mg/dL", null, 200),
          D("LDL Cholesterol", "LDL Cholesterol", 121, "mg/dL", null, 100),
          D("HDL Cholesterol", "HDL Cholesterol", 56, "mg/dL", 40, 60),
          D("Triglycerides", "Triglycerides", 128, "mg/dL", null, 150),
        ],
      },
    ],
    vitals: [
      { type: "weight", value: 62.5, unit: "kg", date: new Date("2025-12-20") },
      { type: "blood_pressure", value: 128, unit: "mmHg", date: new Date("2025-12-20") },
      { type: "heart_rate", value: 74, unit: "bpm", date: new Date("2025-12-20") },
      { type: "temperature", value: 36.5, unit: "C", date: new Date("2025-12-20") },
      { type: "bmi", value: 25.0, unit: "kg/m2", date: new Date("2025-12-20") },
      { type: "weight", value: 62.3, unit: "kg", date: new Date("2026-02-12") },
      { type: "blood_pressure", value: 126, unit: "mmHg", date: new Date("2026-02-12") },
      { type: "heart_rate", value: 72, unit: "bpm", date: new Date("2026-02-12") },
      { type: "blood_sugar", value: 108, unit: "mg/dL", date: new Date("2026-02-12"), note: "Fasting, morning" },
      { type: "temperature", value: 36.4, unit: "C", date: new Date("2026-02-12") },
      { type: "bmi", value: 25.0, unit: "kg/m2", date: new Date("2026-02-12") },
      { type: "weight", value: 62.0, unit: "kg", date: new Date("2026-05-08") },
      { type: "blood_pressure", value: 124, unit: "mmHg", date: new Date("2026-05-08") },
      { type: "heart_rate", value: 73, unit: "bpm", date: new Date("2026-05-08") },
      { type: "blood_sugar", value: 104, unit: "mg/dL", date: new Date("2026-05-08"), note: "Fasting, morning" },
      { type: "temperature", value: 36.5, unit: "C", date: new Date("2026-05-08") },
      { type: "bmi", value: 24.9, unit: "kg/m2", date: new Date("2026-05-08") },
      { type: "weight", value: 61.8, unit: "kg", date: new Date("2026-07-23") },
      { type: "blood_pressure", value: 122, unit: "mmHg", date: new Date("2026-07-23") },
      { type: "heart_rate", value: 71, unit: "bpm", date: new Date("2026-07-23") },
      { type: "temperature", value: 36.4, unit: "C", date: new Date("2026-07-23") },
      { type: "bmi", value: 24.8, unit: "kg/m2", date: new Date("2026-07-23") },
      { type: "weight", value: 61.5, unit: "kg", date: new Date("2026-09-10") },
      { type: "blood_pressure", value: 121, unit: "mmHg", date: new Date("2026-09-10") },
      { type: "heart_rate", value: 72, unit: "bpm", date: new Date("2026-09-10") },
      { type: "blood_sugar", value: 100, unit: "mg/dL", date: new Date("2026-09-10"), note: "Fasting, morning" },
      { type: "temperature", value: 36.5, unit: "C", date: new Date("2026-09-10") },
      { type: "bmi", value: 24.7, unit: "kg/m2", date: new Date("2026-09-10") },
      { type: "weight", value: 61.3, unit: "kg", date: new Date("2026-10-16") },
      { type: "blood_pressure", value: 120, unit: "mmHg", date: new Date("2026-10-16") },
      { type: "heart_rate", value: 71, unit: "bpm", date: new Date("2026-10-16") },
      { type: "blood_sugar", value: 98, unit: "mg/dL", date: new Date("2026-10-16"), note: "Fasting, morning" },
      { type: "temperature", value: 36.4, unit: "C", date: new Date("2026-10-16") },
      { type: "bmi", value: 24.6, unit: "kg/m2", date: new Date("2026-10-16") },
    ],
  },
  {
    name: "Ishneha Shrestha",
    relationship: "Sister",
    dob: new Date("1998-08-21"),
    gender: "female",
    bloodGroup: "AB+",
    phone: "+977-9818-455709",
    email: "ishneha.shrestha@example.com",
    address: "Baneshwor, Kathmandu",
    emergencyContact: "Hari Shrestha (brother) +977-9841-238017",
    height: 160,
    weight: 55,
    allergies: "Sulfa drugs",
    conditions: "Iron deficiency anemia - resolved (sample record)",
    medications: "Iron supplement (completed course)",
    surgeries: "None",
    familyHistory: "Mother - hypothyroidism",
    notes: "Sample demo record. Health conditions are fictional sample data.",
    reports: [
      {
        title: "Vitamin D - Mar 2026",
        reportType: "vitamins",
        laboratoryName: "Sunrise Diagnostic Centre",
        labLocation: "Patan",
        doctorName: null,
        reportDate: new Date("2026-03-25"),
        reportNumber: "TB-2026-03904",
        results: [
          D("Vitamin D", "Vitamin D (25-OH)", 14, "ng/mL", 30, 100),
          D("Calcium", "Calcium", 9.1, "mg/dL", 8.5, 10.5),
        ],
      },
      {
        title: "Full Blood Count - Apr 2026",
        reportType: "cbc",
        laboratoryName: "MetroLab Pathology",
        labLocation: "Kathmandu",
        doctorName: "Dr. N. Karki",
        reportDate: new Date("2026-04-15"),
        reportNumber: "TB-2026-04170",
        results: [
          D("Hemoglobin", "Hemoglobin", 11.8, "g/dL", 12, 15.5),
          D("Hematocrit", "HCT", 35.5, "%", 36, 46),
          D("RBC", "RBC Count", 4.1, "x10^12/L", 3.8, 5),
          D("WBC", "WBC Count", 6.1, "x10^9/L", 4, 11),
          D("Platelets", "Platelets", 255, "x10^9/L", 150, 450),
          D("MCV", "MCV", 79, "fL", 80, 100),
        ],
      },
      {
        title: "Iron Studies - May 2026",
        reportType: "iron",
        laboratoryName: "City General Diagnostics",
        labLocation: "Lalitpur",
        doctorName: "Dr. N. Karki",
        reportDate: new Date("2026-05-19"),
        reportNumber: "TB-2026-04555",
        results: [
          D("Ferritin", "Ferritin", 18, "ng/mL", 12, 150),
          D("Serum Iron", "Serum Iron", 45, "ug/dL", 50, 170),
          D("TIBC", "TIBC", 380, "ug/dL", 250, 425),
          D("Transferrin Saturation", "Transferrin Saturation", 17, "%", 15, 45),
        ],
      },
      {
        title: "Vitamin D Follow-up - Jul 2026",
        reportType: "vitamins",
        laboratoryName: "Sunrise Diagnostic Centre",
        labLocation: "Patan",
        doctorName: null,
        reportDate: new Date("2026-07-14"),
        reportNumber: "TB-2026-05277",
        results: [
          D("Vitamin D", "Vitamin D (25-OH)", 28, "ng/mL", 30, 100),
          D("Calcium", "Calcium", 9.2, "mg/dL", 8.5, 10.5),
        ],
      },
      {
        title: "Thyroid Profile - Aug 2026",
        reportType: "thyroid",
        laboratoryName: "MetroLab Pathology",
        labLocation: "Kathmandu",
        doctorName: "Dr. N. Karki",
        reportDate: new Date("2026-08-13"),
        reportNumber: "TB-2026-05734",
        results: [
          D("TSH", "TSH", 2.8, "mIU/L", 0.4, 4),
          D("T3", "Free T3", 3.3, "pg/mL", 2.3, 4.2),
          D("T4", "Free T4", 1.2, "ng/dL", 0.8, 1.8),
        ],
      },
      {
        title: "General Health Screening - Sep 2026",
        reportType: "general",
        laboratoryName: "City General Diagnostics",
        labLocation: "Lalitpur",
        doctorName: "Dr. A. Joshi",
        reportDate: new Date("2026-09-22"),
        reportNumber: "TB-2026-06188",
        results: [
          D("Glucose", "Fasting Blood Sugar", 88, "mg/dL", 70, 110),
          D("HbA1c", "HbA1c", 5.2, "%", 4, 5.6),
          D("Total Cholesterol", "Total Cholesterol", 172, "mg/dL", null, 200),
          D("LDL Cholesterol", "LDL Cholesterol", 96, "mg/dL", null, 100),
          D("HDL Cholesterol", "HDL Cholesterol", 58, "mg/dL", 40, 60),
          D("Triglycerides", "Triglycerides", 110, "mg/dL", null, 150),
          D("Vitamin D", "Vitamin D (25-OH)", 33, "ng/mL", 30, 100),
        ],
      },
      {
        title: "Iron Follow-up - Oct 2026",
        reportType: "iron",
        laboratoryName: "City General Diagnostics",
        labLocation: "Lalitpur",
        doctorName: "Dr. A. Joshi",
        reportDate: new Date("2026-10-20"),
        reportNumber: "TB-2026-06694",
        results: [
          D("Ferritin", "Ferritin", 27, "ng/mL", 12, 150),
          D("Hemoglobin", "Hemoglobin", 12.4, "g/dL", 12, 15.5),
          D("MCV", "MCV", 82, "fL", 80, 100),
        ],
      },
    ],
    vitals: [
      { type: "weight", value: 55.0, unit: "kg", date: new Date("2026-04-01") },
      { type: "blood_pressure", value: 112, unit: "mmHg", date: new Date("2026-04-01") },
      { type: "heart_rate", value: 76, unit: "bpm", date: new Date("2026-04-01") },
      { type: "temperature", value: 36.4, unit: "C", date: new Date("2026-04-01") },
      { type: "bmi", value: 21.5, unit: "kg/m2", date: new Date("2026-04-01") },
      { type: "weight", value: 54.8, unit: "kg", date: new Date("2026-05-05") },
      { type: "blood_pressure", value: 110, unit: "mmHg", date: new Date("2026-05-05") },
      { type: "heart_rate", value: 74, unit: "bpm", date: new Date("2026-05-05") },
      { type: "temperature", value: 36.5, unit: "C", date: new Date("2026-05-05") },
      { type: "bmi", value: 21.4, unit: "kg/m2", date: new Date("2026-05-05") },
      { type: "weight", value: 54.6, unit: "kg", date: new Date("2026-06-10") },
      { type: "blood_pressure", value: 111, unit: "mmHg", date: new Date("2026-06-10") },
      { type: "heart_rate", value: 73, unit: "bpm", date: new Date("2026-06-10") },
      { type: "blood_sugar", value: 92, unit: "mg/dL", date: new Date("2026-06-10"), note: "Fasting, morning" },
      { type: "bmi", value: 21.3, unit: "kg/m2", date: new Date("2026-06-10") },
      { type: "weight", value: 54.9, unit: "kg", date: new Date("2026-08-15") },
      { type: "blood_pressure", value: 109, unit: "mmHg", date: new Date("2026-08-15") },
      { type: "heart_rate", value: 72, unit: "bpm", date: new Date("2026-08-15") },
      { type: "blood_sugar", value: 90, unit: "mg/dL", date: new Date("2026-08-15"), note: "Fasting, morning" },
      { type: "temperature", value: 36.4, unit: "C", date: new Date("2026-08-15") },
      { type: "bmi", value: 21.4, unit: "kg/m2", date: new Date("2026-08-15") },
      { type: "weight", value: 55.2, unit: "kg", date: new Date("2026-09-25") },
      { type: "blood_pressure", value: 108, unit: "mmHg", date: new Date("2026-09-25") },
      { type: "heart_rate", value: 71, unit: "bpm", date: new Date("2026-09-25") },
      { type: "temperature", value: 36.5, unit: "C", date: new Date("2026-09-25") },
      { type: "bmi", value: 21.5, unit: "kg/m2", date: new Date("2026-09-25") },
      { type: "weight", value: 55.4, unit: "kg", date: new Date("2026-10-22") },
      { type: "blood_pressure", value: 109, unit: "mmHg", date: new Date("2026-10-22") },
      { type: "heart_rate", value: 70, unit: "bpm", date: new Date("2026-10-22") },
      { type: "blood_sugar", value: 88, unit: "mg/dL", date: new Date("2026-10-22"), note: "Fasting, morning" },
      { type: "bmi", value: 21.6, unit: "kg/m2", date: new Date("2026-10-22") },
    ],
  },
  {
    name: "Baibhav Shrestha",
    relationship: "Brother",
    dob: new Date("1994-12-05"),
    gender: "male",
    bloodGroup: "O-",
    phone: "+977-9860-771293",
    email: "baibhav.shrestha@example.com",
    address: "Baneshwor, Kathmandu",
    emergencyContact: "Hari Shrestha (brother) +977-9841-238017",
    height: 178,
    weight: 80,
    allergies: "None known",
    conditions: "None",
    medications: "None",
    surgeries: "None",
    familyHistory: "Father - hypertension",
    notes: "Sample demo record.",
    reports: [
      {
        title: "Full Blood Count - Jul 2026",
        reportType: "cbc",
        laboratoryName: "Himalayan Medical Laboratory",
        labLocation: "Lalitpur",
        doctorName: "Dr. B. Lama",
        reportDate: new Date("2026-07-16"),
        reportNumber: "TB-2026-05301",
        results: [
          D("Hemoglobin", "Hemoglobin", 15.2, "g/dL", 13, 17),
          D("Hematocrit", "HCT", 44.5, "%", 38, 54),
          D("RBC", "RBC Count", 5.2, "x10^12/L", 4.5, 5.5),
          D("WBC", "WBC Count", 6.8, "x10^9/L", 4, 11),
          D("Platelets", "Platelets", 288, "x10^9/L", 150, 450),
        ],
      },
      {
        title: "Vitamin D - Jul 2026",
        reportType: "vitamins",
        laboratoryName: "Sunrise Diagnostic Centre",
        labLocation: "Patan",
        doctorName: null,
        reportDate: new Date("2026-07-16"),
        reportNumber: "TB-2026-05314",
        results: [
          D("Vitamin D", "Vitamin D (25-OH)", 26, "ng/mL", 30, 100),
        ],
      },
      {
        title: "Metabolic Screening - Aug 2026",
        reportType: "general",
        laboratoryName: "Sunrise Diagnostic Centre",
        labLocation: "Patan",
        doctorName: "Dr. B. Lama",
        reportDate: new Date("2026-08-27"),
        reportNumber: "TB-2026-05742",
        results: [
          D("Glucose", "Fasting Blood Sugar", 101, "mg/dL", 70, 110),
          D("HbA1c", "HbA1c", 5.4, "%", 4, 5.6),
          D("Total Cholesterol", "Total Cholesterol", 188, "mg/dL", null, 200),
          D("LDL Cholesterol", "LDL Cholesterol", 118, "mg/dL", null, 100),
          D("HDL Cholesterol", "HDL Cholesterol", 44, "mg/dL", 40, 60),
          D("Triglycerides", "Triglycerides", 150, "mg/dL", null, 150),
        ],
      },
      {
        title: "Vitamin D Follow-up - Sep 2026",
        reportType: "vitamins",
        laboratoryName: "MetroLab Pathology",
        labLocation: "Kathmandu",
        doctorName: null,
        reportDate: new Date("2026-09-10"),
        reportNumber: "TB-2026-05988",
        results: [
          D("Vitamin D", "Vitamin D (25-OH)", 34, "ng/mL", 30, 100),
        ],
      },
      {
        title: "General Health Screening - Oct 2026",
        reportType: "general",
        laboratoryName: "City General Diagnostics",
        labLocation: "Lalitpur",
        doctorName: "Dr. B. Lama",
        reportDate: new Date("2026-10-22"),
        reportNumber: "TB-2026-06702",
        results: [
          D("Glucose", "Fasting Blood Sugar", 93, "mg/dL", 70, 110),
          D("HbA1c", "HbA1c", 5.3, "%", 4, 5.6),
          D("Hemoglobin", "Hemoglobin", 15.0, "g/dL", 13, 17),
          D("ALT", "ALT (SGPT)", 33, "U/L", 7, 45),
          D("Creatinine", "Serum Creatinine", 0.98, "mg/dL", 0.7, 1.3),
        ],
      },
    ],
    vitals: [
      { type: "weight", value: 81.0, unit: "kg", date: new Date("2026-07-18") },
      { type: "blood_pressure", value: 128, unit: "mmHg", date: new Date("2026-07-18") },
      { type: "heart_rate", value: 68, unit: "bpm", date: new Date("2026-07-18") },
      { type: "blood_sugar", value: 104, unit: "mg/dL", date: new Date("2026-07-18"), note: "Fasting, morning" },
      { type: "temperature", value: 36.6, unit: "C", date: new Date("2026-07-18") },
      { type: "bmi", value: 25.6, unit: "kg/m2", date: new Date("2026-07-18") },
      { type: "weight", value: 80.6, unit: "kg", date: new Date("2026-08-20") },
      { type: "blood_pressure", value: 126, unit: "mmHg", date: new Date("2026-08-20") },
      { type: "heart_rate", value: 66, unit: "bpm", date: new Date("2026-08-20") },
      { type: "blood_sugar", value: 99, unit: "mg/dL", date: new Date("2026-08-20"), note: "Fasting, morning" },
      { type: "temperature", value: 36.5, unit: "C", date: new Date("2026-08-20") },
      { type: "bmi", value: 25.5, unit: "kg/m2", date: new Date("2026-08-20") },
      { type: "weight", value: 80.3, unit: "kg", date: new Date("2026-09-21") },
      { type: "blood_pressure", value: 124, unit: "mmHg", date: new Date("2026-09-21") },
      { type: "heart_rate", value: 67, unit: "bpm", date: new Date("2026-09-21") },
      { type: "blood_sugar", value: 96, unit: "mg/dL", date: new Date("2026-09-21"), note: "Fasting, morning" },
      { type: "temperature", value: 36.6, unit: "C", date: new Date("2026-09-21") },
      { type: "bmi", value: 25.4, unit: "kg/m2", date: new Date("2026-09-21") },
      { type: "weight", value: 80.1, unit: "kg", date: new Date("2026-10-24") },
      { type: "blood_pressure", value: 122, unit: "mmHg", date: new Date("2026-10-24") },
      { type: "heart_rate", value: 65, unit: "bpm", date: new Date("2026-10-24") },
      { type: "blood_sugar", value: 92, unit: "mg/dL", date: new Date("2026-10-24"), note: "Fasting, morning" },
      { type: "bmi", value: 25.3, unit: "kg/m2", date: new Date("2026-10-24") },
    ],
  },
];

async function main() {
  console.log("Seeding demo account...");

  const demo = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: "Hari Shrestha" },
    create: {
      email: DEMO_EMAIL,
      name: "Hari Shrestha",
      password: await bcrypt.hash(DEMO_PASSWORD, 12),
      profile: { create: {} },
    },
  });
  console.log(`Demo user ready: ${demo.email} (${demo.id})`);

  // Rebuild demo data idempotently: remove previous demo data, scoped strictly
  // to the demo user (never touches other users).
  console.log("Clearing previous demo data...");
  const demoPatientIds = (
    await prisma.patient.findMany({
      where: { userId: demo.id },
      select: { id: true },
    })
  ).map((p) => p.id);

  await prisma.auditLogRoleAccess.deleteMany({ where: { userId: demo.id } });
  await prisma.exportLog.deleteMany({ where: { userId: demo.id } });
  await prisma.shareLink.deleteMany({ where: { userId: demo.id } });
  await prisma.reminder.deleteMany({ where: { userId: demo.id } });
  await prisma.referenceRange.deleteMany({
    where: { patientId: { in: demoPatientIds } },
  });
  await prisma.healthMeasurement.deleteMany({ where: { userId: demo.id } });
  await prisma.report.deleteMany({ where: { userId: demo.id } });
  await prisma.patient.deleteMany({ where: { userId: demo.id } });

  let reportCount = 0;
  let resultCount = 0;
  let vitalCount = 0;

  for (const p of patients) {
    const patient = await prisma.patient.create({
      data: {
        userId: demo.id,
        name: p.name,
        relationship: p.relationship,
        dob: p.dob,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        phone: p.phone,
        email: p.email,
        address: p.address,
        emergencyContact: p.emergencyContact,
        height: p.height,
        weight: p.weight,
        allergies: p.allergies,
        conditions: p.conditions,
        medications: p.medications,
        surgeries: p.surgeries,
        familyHistory: p.familyHistory,
        notes: p.notes,
      },
    });

    for (const r of p.reports) {
      const report = await prisma.report.create({
        data: {
          userId: demo.id,
          patientId: patient.id,
          title: r.title,
          reportType: r.reportType,
          laboratoryName: r.laboratoryName,
          labLocation: r.labLocation,
          doctorName: r.doctorName,
          reportDate: r.reportDate,
          patientName: p.name,
          reportNumber: r.reportNumber,
          fileName: `${r.reportNumber}.pdf`,
          filePath: "demo",
          fileType: "application/pdf",
          fileSize: 0,
          pageCount: 1,
          language: "en",
          processingStatus: "confirmed",
          results: {
            create: r.results.map((x) => ({
              canonicalName: x.co,
              originalTestName: x.o,
              originalValue: `${x.v} ${x.u}`,
              originalUnit: x.u,
              normalizedValue: x.v,
              normalizedUnit: x.u,
              referenceLow: x.lo,
              referenceHigh: x.hi,
              originalRefRange:
                x.lo !== null && x.hi !== null ? `${x.lo}-${x.hi}` : null,
              flag: flagOf(x.v, x.lo, x.hi),
              resultDate: r.reportDate,
              confidence: "high",
              confirmed: true,
              confirmedAt: r.reportDate,
            })),
          },
        },
      });
      reportCount += 1;
      resultCount += r.results.length;
      console.log(`  report: ${report.title}`);
    }

    for (const v of p.vitals) {
      await prisma.healthMeasurement.create({
        data: {
          userId: demo.id,
          patientId: patient.id,
          type: v.type,
          value: v.value,
          unit: v.unit,
          note: v.note,
          date: v.date,
          category: "vitals",
          source: "manual",
        },
      });
      vitalCount += 1;
    }

    // Sample reminders demonstrate the reminders feature.
    await prisma.reminder.createMany({
      data: [
        {
          userId: demo.id,
          patientId: patient.id,
          testName: "Annual blood test",
          date: new Date("2026-11-15"),
          recurrence: "yearly",
          status: "active",
        },
        {
          userId: demo.id,
          patientId: patient.id,
          testName: "3-month check-up",
          date: new Date("2026-11-01"),
          recurrence: "3Months",
          status: "active",
        },
      ],
    });

    console.log(`  patient ready: ${p.name} (${p.relationship})`);
  }

  console.log("---");
  console.log(`Demo account seeded: 5 patients, ${reportCount} reports, ${resultCount} lab results, ${vitalCount} vitals.`);
  console.log(`Sign in: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("SEED FAILED:", e.message);
    await prisma.$disconnect();
    process.exit(1);
  });