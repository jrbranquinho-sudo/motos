import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  try {
    const isTursoRemote =
      Boolean(process.env.TURSO_DATABASE_URL?.startsWith("libsql://")) ||
      Boolean(process.env.TURSO_DATABASE_URL?.startsWith("https://"));

    const tenantCount = await prisma.tenant.count();
    const ordersCount = await prisma.serviceOrder.count();
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      database: isTursoRemote ? "Turso LibSQL (Cloud)" : "SQLite Local (dev.db)",
      latencyMs,
      stats: {
        tenants: tenantCount,
        serviceOrders: ordersCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      {
        status: "unhealthy",
        error: errorMessage,
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
