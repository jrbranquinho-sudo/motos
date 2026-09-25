import "dotenv/config";
import { prisma } from "../lib/prisma";
import {
  SEED_CUSTOMERS,
  SEED_MAINTENANCE_RECORDS,
  SEED_PARTS,
  SEED_SERVICE_ORDERS,
  SEED_TENANTS,
  SEED_USERS,
  SEED_VEHICLES,
} from "../lib/seedData";

async function main() {
  console.log("🏍️ Iniciando Seed do Banco de Dados Turso / SQLite...");

  // 1. Tenants
  for (const t of SEED_TENANTS) {
    await prisma.tenant.upsert({
      where: { id: t.id },
      update: {
        name: t.name,
        slug: t.slug,
        plan: t.plan,
        phone: t.phone,
        cnpj: t.cnpj,
        address: t.address,
        status: t.status || "ACTIVE",
        totalRevenue: t.totalRevenue || 0,
        ordersCount: t.ordersCount || 0,
        vehiclesCount: t.vehiclesCount || 0,
        activeUsersCount: t.activeUsersCount || 1,
        lastAccessAt: t.lastAccessAt ? new Date(t.lastAccessAt) : null,
        lastAccessUser: t.lastAccessUser,
        lastAccessUserRole: t.lastAccessUserRole,
        subscriptionCycle: t.subscriptionCycle,
        subscriptionPrice: t.subscriptionPrice,
        subscriptionDurationDays: t.subscriptionDurationDays,
        subscriptionStartedAt: t.subscriptionStartedAt ? new Date(t.subscriptionStartedAt) : null,
        subscriptionExpiresAt: t.subscriptionExpiresAt ? new Date(t.subscriptionExpiresAt) : null,
        subscriptionStatus: t.subscriptionStatus,
      },
      create: {
        id: t.id,
        name: t.name,
        slug: t.slug,
        plan: t.plan,
        phone: t.phone,
        cnpj: t.cnpj,
        address: t.address,
        status: t.status || "ACTIVE",
        totalRevenue: t.totalRevenue || 0,
        ordersCount: t.ordersCount || 0,
        vehiclesCount: t.vehiclesCount || 0,
        activeUsersCount: t.activeUsersCount || 1,
        lastAccessAt: t.lastAccessAt ? new Date(t.lastAccessAt) : null,
        lastAccessUser: t.lastAccessUser,
        lastAccessUserRole: t.lastAccessUserRole,
        subscriptionCycle: t.subscriptionCycle,
        subscriptionPrice: t.subscriptionPrice,
        subscriptionDurationDays: t.subscriptionDurationDays,
        subscriptionStartedAt: t.subscriptionStartedAt ? new Date(t.subscriptionStartedAt) : null,
        subscriptionExpiresAt: t.subscriptionExpiresAt ? new Date(t.subscriptionExpiresAt) : null,
        subscriptionStatus: t.subscriptionStatus,
        createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
      },
    });
  }
  console.log(`✅ ${SEED_TENANTS.length} Oficinas (Tenants) inseridas.`);

  // 2. Users (Preserve existing database passwords - never overwrite with seed)
  for (const u of SEED_USERS) {
    const existing = await prisma.user.findUnique({ where: { id: u.id } });
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        name: u.name,
        email: u.email,
        username: u.username,
        // Protect user's password: preserve database password if set
        password: existing?.password || u.password,
        phone: u.phone,
        avatar: u.avatar,
        role: u.role,
        mustChangePassword: existing ? existing.mustChangePassword : false,
        twoFactorEnabled: existing ? existing.twoFactorEnabled : false,
        tenantId: u.tenantId,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        username: u.username,
        password: u.password,
        phone: u.phone,
        avatar: u.avatar,
        role: u.role,
        mustChangePassword: false,
        twoFactorEnabled: u.twoFactorEnabled || false,
        tenantId: u.tenantId,
      },
    });
  }
  console.log(`✅ ${SEED_USERS.length} Usuários inseridos.`);

  // 3. Customers
  for (const c of SEED_CUSTOMERS) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        phone: c.phone,
        email: c.email,
        document: c.document,
        tenantId: c.tenantId,
      },
      create: {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        document: c.document,
        tenantId: c.tenantId,
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
      },
    });
  }
  console.log(`✅ ${SEED_CUSTOMERS.length} Clientes inseridos.`);

  // 4. Vehicles
  for (const v of SEED_VEHICLES) {
    await prisma.vehicle.upsert({
      where: { id: v.id },
      update: {
        plate: v.plate,
        brand: v.brand,
        model: v.model,
        year: v.year,
        color: v.color,
        chassis: v.chassis,
        currentKm: v.currentKm || 0,
        customerId: v.customerId,
        tenantId: v.tenantId,
      },
      create: {
        id: v.id,
        plate: v.plate,
        brand: v.brand,
        model: v.model,
        year: v.year,
        color: v.color,
        chassis: v.chassis,
        currentKm: v.currentKm || 0,
        customerId: v.customerId,
        tenantId: v.tenantId,
        createdAt: v.createdAt ? new Date(v.createdAt) : new Date(),
      },
    });
  }
  console.log(`✅ ${SEED_VEHICLES.length} Veículos inseridos.`);

  // 5. Parts
  for (const p of SEED_PARTS) {
    await prisma.part.upsert({
      where: { id: p.id },
      update: {
        code: p.code,
        name: p.name,
        description: p.description,
        brand: p.brand,
        category: p.category,
        costPrice: p.costPrice,
        salePrice: p.salePrice,
        stockQty: p.stockQty,
        minStock: p.minStock,
        location: p.location,
        tenantId: p.tenantId,
      },
      create: {
        id: p.id,
        code: p.code,
        name: p.name,
        description: p.description,
        brand: p.brand,
        category: p.category,
        costPrice: p.costPrice,
        salePrice: p.salePrice,
        stockQty: p.stockQty,
        minStock: p.minStock,
        location: p.location,
        tenantId: p.tenantId,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      },
    });
  }
  console.log(`✅ ${SEED_PARTS.length} Peças no estoque inseridas.`);

  // 6. Service Orders & Items
  for (const so of SEED_SERVICE_ORDERS) {
    // Apaga itens anteriores da OS se já existiam para evitar duplicatas
    await prisma.oSItem.deleteMany({
      where: { serviceOrderId: so.id },
    });

    await prisma.serviceOrder.upsert({
      where: { id: so.id },
      update: {
        osNumber: so.osNumber,
        status: so.status,
        vehicleId: so.vehicleId,
        mechanicId: so.mechanicId,
        tenantId: so.tenantId,
        kmAtService: so.kmAtService,
        kmNextService: so.kmNextService,
        complaint: so.complaint,
        diagnosis: so.diagnosis,
        notes: so.notes,
        checklistJson: so.checklist ? JSON.stringify(so.checklist) : null,
        totalParts: so.totalParts || 0,
        totalLabor: so.totalLabor || 0,
        totalDiscount: so.totalDiscount || 0,
        totalAmount: so.totalAmount || 0,
        estimatedMinutes: so.estimatedMinutes,
        spentMinutes: so.spentMinutes || 0,
        isTimerRunning: so.isTimerRunning || false,
        timerStartedAt: so.timerStartedAt ? new Date(so.timerStartedAt) : null,
        completedAt: so.completedAt ? new Date(so.completedAt) : null,
        deliveredAt: so.deliveredAt ? new Date(so.deliveredAt) : null,
        items: {
          create: so.items.map((item) => ({
            id: item.id,
            type: item.type,
            partId: item.partId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: item.total,
          })),
        },
      },
      create: {
        id: so.id,
        osNumber: so.osNumber,
        status: so.status,
        vehicleId: so.vehicleId,
        mechanicId: so.mechanicId,
        tenantId: so.tenantId,
        kmAtService: so.kmAtService,
        kmNextService: so.kmNextService,
        complaint: so.complaint,
        diagnosis: so.diagnosis,
        notes: so.notes,
        checklistJson: so.checklist ? JSON.stringify(so.checklist) : null,
        totalParts: so.totalParts || 0,
        totalLabor: so.totalLabor || 0,
        totalDiscount: so.totalDiscount || 0,
        totalAmount: so.totalAmount || 0,
        estimatedMinutes: so.estimatedMinutes,
        spentMinutes: so.spentMinutes || 0,
        isTimerRunning: so.isTimerRunning || false,
        timerStartedAt: so.timerStartedAt ? new Date(so.timerStartedAt) : null,
        completedAt: so.completedAt ? new Date(so.completedAt) : null,
        deliveredAt: so.deliveredAt ? new Date(so.deliveredAt) : null,
        createdAt: so.createdAt ? new Date(so.createdAt) : new Date(),
        updatedAt: so.updatedAt ? new Date(so.updatedAt) : new Date(),
        items: {
          create: so.items.map((item) => ({
            id: item.id,
            type: item.type,
            partId: item.partId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: item.total,
          })),
        },
      },
    });
  }
  console.log(`✅ ${SEED_SERVICE_ORDERS.length} Ordens de Serviço inseridas.`);

  // 7. Maintenance Records
  for (const mr of SEED_MAINTENANCE_RECORDS) {
    await prisma.maintenanceRecord.upsert({
      where: { id: mr.id },
      update: {
        vehicleId: mr.vehicleId,
        osId: mr.osId,
        km: mr.km,
        description: mr.description,
        cost: mr.cost || 0,
        date: mr.date ? new Date(mr.date) : new Date(),
        tenantId: mr.tenantId,
      },
      create: {
        id: mr.id,
        vehicleId: mr.vehicleId,
        osId: mr.osId,
        km: mr.km,
        description: mr.description,
        cost: mr.cost || 0,
        date: mr.date ? new Date(mr.date) : new Date(),
        tenantId: mr.tenantId,
      },
    });
  }
  console.log(`✅ ${SEED_MAINTENANCE_RECORDS.length} Históricos de Manutenção inseridos.`);

  console.log("🎉 Seed do banco de dados concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
