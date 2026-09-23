import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  let connectionString =
    process.env.TURSO_DATABASE_URL ||
    process.env.DATABASE_URL ||
    "file:./prisma/dev.db";

  const authToken = process.env.TURSO_AUTH_TOKEN;
  const isRemote =
    connectionString.startsWith("libsql://") ||
    connectionString.startsWith("https://");

  if (process.env.NODE_ENV !== "production" && !isRemote && connectionString.startsWith("file:")) {
    const rawPath = connectionString.replace(/^file:/, "");
    const resolvedPath = path.isAbsolute(rawPath)
      ? rawPath
      : path.resolve(/*turbopackIgnore: true*/ process.cwd(), rawPath);
    connectionString = `file:${resolvedPath.replace(/\\/g, "/")}`;
  }

  const adapter = new PrismaLibSQL({
    url: connectionString,
    authToken: isRemote ? authToken : undefined,
  });

  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma = getPrismaClient();
