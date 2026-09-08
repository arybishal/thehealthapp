import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Provide it in the deployment environment (Vercel) or a local .env file."
  );
}

const adapter = new PrismaPg({ connectionString });

if (process.env.NODE_ENV !== "production") {
  const host = connectionString.match(/@([^/]+)/)?.[1]?.split(":")[0] ?? "unknown";
  console.log("[prisma] connecting to database host:", host);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
