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

async function main() {
  const email = "demo@thebloodtracker.com";
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const hashed = await bcrypt.hash("demo1234", 12);
    user = await prisma.user.create({
      data: {
        name: "Arybishal",
        email,
        password: hashed,
        profile: { create: {} },
        patients: {
          create: {
            name: "Arybishal",
            dob: new Date("1992-01-15"),
            gender: "male",
            bloodGroup: "O+",
            height: 175,
            weight: 70,
          },
        },
      },
      include: { patients: true },
    });
    console.log(`Demo user created: ${email}`);
    console.log(`Password: demo1234`);
    console.log(`User ID: ${user.id}`);
  } else {
    console.log(`Demo user already exists: ${email}`);
  }

  let patient = await prisma.patient.findFirst({
    where: { userId: user.id },
  });
  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        userId: user.id,
        name: "Arybishal",
        dob: new Date("1992-01-15"),
        gender: "male",
        bloodGroup: "O+",
        height: 175,
        weight: 70,
      },
    });
  }

  const hasReports = await prisma.report.count({ where: { userId: user.id } });
  if (hasReports > 0) {
    console.log("Demo reports already exist - skipping");
    return;
  }

  const mk = (
    canonicalName: string,
    originalTestName: string,
    value: number,
    unit: string,
    refLow: number | null,
    refHigh: number | null,
    date: Date
  ) => ({
    canonicalName,
    originalTestName,
    originalValue: `${value} ${unit}`,
    originalUnit: unit,
    normalizedValue: value,
    normalizedUnit: unit,
    referenceLow: refLow,
    referenceHigh: refHigh,
    originalRefRange:
      refLow !== null && refHigh !== null ? `${refLow}-${refHigh}` : null,
    flag:
      refHigh !== null && value > refHigh
        ? "H"
        : refLow !== null && value < refLow
        ? "L"
        : null,
    confidence: "high" as const,
    confirmed: true,
    confirmedAt: new Date(),
    resultDate: date,
  });

  const base = new Date(2026, 7, 15);
  const m1 = new Date(2026, 4, 20);
  const m2 = new Date(2026, 1, 10);

  const cbc = [
    mk("Hemoglobin", "Hemoglobin", 14.2, "g/dL", 13, 17, base),
    mk("WBC", "WBC", 7.2, "x10^9/L", 4, 11, base),
    mk("Platelets", "Platelets", m2 > m1 ? 245 : 250, "x10^9/L", 150, 450, base),
    mk("Hematocrit", "HCT", 42, "%", 38, 54, base),
  ];

  const diabetes = [
    mk("HbA1c", "HbA1c", 5.8, "%", 4, 5.6, base),
    mk("Glucose", "Fasting Blood Sugar", 98, "mg/dL", 70, 110, base),
  ];

  const lipid = [
    mk("Total Cholesterol", "Total Cholesterol", 198, "mg/dL", 0, 200, m1),
    mk("LDL Cholesterol", "LDL Cholesterol", 128, "mg/dL", 0, 100, m1),
    mk("HDL Cholesterol", "HDL Cholesterol", 52, "mg/dL", 40, 60, m1),
    mk("Triglycerides", "Triglycerides", 145, "mg/dL", 0, 150, m1),
  ];

  const thyroid = [
    mk("TSH", "TSH", 2.4, "mIU/L", 0.4, 4.0, m2),
    mk("T3", "Free T3", 3.2, "pg/mL", 2.3, 4.2, m2),
    mk("T4", "Free T4", 1.3, "ng/dL", 0.8, 1.8, m2),
  ];

  const reports = [
    { title: "Annual Health Checkup", reportType: "cbc", results: [...cbc, ...diabetes], date: base },
    { title: "Lipid Profile", reportType: "lipid", results: lipid, date: m1 },
    { title: "Thyroid Function Panel", reportType: "thyroid", results: thyroid, date: m2 },
  ];

  for (const r of reports) {
    await prisma.report.create({
      data: {
        userId: user.id,
        patientId: patient.id,
        title: r.title,
        reportType: r.reportType,
        laboratoryName: "City General Diagnostics",
        reportDate: r.date,
        fileName: `${r.title.toLowerCase().replace(/\s+/g, "-")}.pdf`,
        filePath: "demo",
        fileType: "application/pdf",
        fileSize: 0,
        results: { create: r.results },
      },
    });
    console.log(`Demo report created: ${r.title}`);
  }

  console.log(`Demo data ready for ${email} (password: demo1234)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("SEED FAILED:", e.message);
    await prisma.$disconnect();
    process.exit(1);
  });