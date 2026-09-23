import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

    const tenants = await prisma.tenant.findMany({
      where: tenantId ? { id: tenantId } : undefined,
      orderBy: { createdAt: "desc" },
    });

    const users = await prisma.user.findMany({
      where: tenantId ? { tenantId } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        avatar: true,
        role: true,
        mustChangePassword: true,
        twoFactorEnabled: true,
        tenantId: true,
        createdAt: true,
      },
    });

    const customers = await prisma.customer.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: "desc" },
    });

    const vehicles = await prisma.vehicle.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    });

    const parts = await prisma.part.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { name: "asc" },
    });

    const serviceOrders = await prisma.serviceOrder.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: {
        items: true,
        vehicle: true,
        mechanic: true,
      },
      orderBy: { osNumber: "desc" },
    });

    const maintenanceRecords = await prisma.maintenanceRecord.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { date: "desc" },
    });

    const stockMovements = await prisma.stockMovement.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        tenants,
        users,
        customers,
        vehicles,
        parts,
        serviceOrders,
        maintenanceRecords,
        stockMovements,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao carregar dados";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
