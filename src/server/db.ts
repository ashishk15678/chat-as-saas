import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30_000,
});
const adapter = new PrismaPg(pool);

const make = () =>
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

const g = globalThis as unknown as { prisma?: ReturnType<typeof make> };

export const db = g.prisma ?? make();

if (process.env.NODE_ENV !== "production") {
  g.prisma = db;
}
