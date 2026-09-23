import "dotenv/config";
import { createClient } from "@libsql/client";
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

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error("❌ Erro: TURSO_DATABASE_URL e TURSO_AUTH_TOKEN precisam estar definidos no .env");
  process.exit(1);
}

const DDL_STATEMENTS = `
-- CreateTable
CREATE TABLE IF NOT EXISTS "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "phone" TEXT,
    "cnpj" TEXT,
    "email" TEXT,
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "totalRevenue" REAL NOT NULL DEFAULT 0,
    "ordersCount" INTEGER NOT NULL DEFAULT 0,
    "vehiclesCount" INTEGER NOT NULL DEFAULT 0,
    "activeUsersCount" INTEGER NOT NULL DEFAULT 1,
    "lastAccessAt" DATETIME,
    "lastAccessUser" TEXT,
    "lastAccessUserRole" TEXT,
    "subscriptionCycle" TEXT DEFAULT 'MONTHLY',
    "subscriptionPrice" REAL DEFAULT 79,
    "subscriptionDurationDays" INTEGER DEFAULT 30,
    "subscriptionStartedAt" DATETIME,
    "subscriptionExpiresAt" DATETIME,
    "subscriptionStatus" TEXT DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MECHANIC',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "document" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plate" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT,
    "chassis" TEXT,
    "currentKm" INTEGER NOT NULL DEFAULT 0,
    "customerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vehicle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vehicle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ServiceOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "osNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "vehicleId" TEXT NOT NULL,
    "mechanicId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "kmAtService" INTEGER NOT NULL,
    "kmNextService" INTEGER,
    "complaint" TEXT NOT NULL,
    "diagnosis" TEXT,
    "notes" TEXT,
    "checklistJson" TEXT,
    "totalParts" REAL NOT NULL DEFAULT 0,
    "totalLabor" REAL NOT NULL DEFAULT 0,
    "totalDiscount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "estimatedMinutes" INTEGER,
    "spentMinutes" INTEGER DEFAULT 0,
    "isTimerRunning" BOOLEAN NOT NULL DEFAULT false,
    "timerStartedAt" DATETIME,
    "completedAt" DATETIME,
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceOrder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServiceOrder_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServiceOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "OSItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceOrderId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "partId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    CONSTRAINT "OSItem_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OSItem_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Part" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "category" TEXT NOT NULL,
    "costPrice" REAL NOT NULL,
    "salePrice" REAL NOT NULL,
    "unit" TEXT DEFAULT 'UN',
    "stockQty" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT,
    "tenantId" TEXT NOT NULL,
    "supplierId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Part_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Part_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partId" TEXT NOT NULL,
    "partName" TEXT,
    "type" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "reason" TEXT,
    "osId" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MaintenanceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "osId" TEXT,
    "km" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "cost" REAL NOT NULL DEFAULT 0,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,
    CONSTRAINT "MaintenanceRecord_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "tenantId" TEXT NOT NULL,
    CONSTRAINT "Supplier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_slug_key" ON "Tenant"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_tenantId_key" ON "User"("email", "tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "Vehicle_plate_tenantId_key" ON "Vehicle"("plate", "tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceOrder_osNumber_tenantId_key" ON "ServiceOrder"("osNumber", "tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "Part_code_tenantId_key" ON "Part"("code", "tenantId");
`;

async function main() {
  console.log("🚀 Conectando ao Turso na nuvem...");
  console.log(`📍 URL: ${TURSO_URL}`);

  const client = createClient({
    url: TURSO_URL!,
    authToken: TURSO_TOKEN!,
  });

  console.log("⚡ Executando DDL para criação das tabelas e índices no Turso...");
  await client.executeMultiple(DDL_STATEMENTS);
  
  // Safe incremental column additions for existing Turso tables
  try {
    await client.execute('ALTER TABLE "Tenant" ADD COLUMN "email" TEXT');
  } catch (e) {
    // Column may already exist
  }
  try {
    await client.execute('ALTER TABLE "Part" ADD COLUMN "unit" TEXT DEFAULT "UN"');
  } catch (e) {
    // Column may already exist
  }

  console.log("✅ Tabelas e índices criados com sucesso no Turso!");

  console.log("🏍️ Populando dados iniciais (Seed) via Prisma + Turso Adapter...");

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
        email: t.email,
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
        email: t.email,
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
  console.log(`✅ ${SEED_TENANTS.length} Oficinas (Tenants) inseridas no Turso.`);

  // 2. Users
  for (const u of SEED_USERS) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        name: u.name,
        email: u.email,
        username: u.username,
        password: u.password,
        phone: u.phone,
        avatar: u.avatar,
        role: u.role,
        mustChangePassword: u.mustChangePassword || false,
        twoFactorEnabled: u.twoFactorEnabled || false,
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
        mustChangePassword: u.mustChangePassword || false,
        twoFactorEnabled: u.twoFactorEnabled || false,
        tenantId: u.tenantId,
      },
    });
  }
  console.log(`✅ ${SEED_USERS.length} Usuários inseridos no Turso.`);

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
  console.log(`✅ ${SEED_CUSTOMERS.length} Clientes inseridos no Turso.`);

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
  console.log(`✅ ${SEED_VEHICLES.length} Veículos inseridos no Turso.`);

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
        unit: p.unit || "UN",
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
        unit: p.unit || "UN",
        stockQty: p.stockQty,
        minStock: p.minStock,
        location: p.location,
        tenantId: p.tenantId,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      },
    });
  }
  console.log(`✅ ${SEED_PARTS.length} Peças no estoque inseridas no Turso.`);

  // 6. Service Orders & Items
  for (const so of SEED_SERVICE_ORDERS) {
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
  console.log(`✅ ${SEED_SERVICE_ORDERS.length} Ordens de Serviço inseridas no Turso.`);

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
  console.log(`✅ ${SEED_MAINTENANCE_RECORDS.length} Históricos de Manutenção inseridos no Turso.`);

  // Verificação final
  const tenantsCount = await prisma.tenant.count();
  const ordersCount = await prisma.serviceOrder.count();
  const vehiclesCount = await prisma.vehicle.count();

  console.log("\n=======================================================");
  console.log("🎉 BANCO TURSO NA NUVEM CRIADO E POPULADO COM SUCESSO!");
  console.log(`📊 Oficinas cadastradas no Turso: ${tenantsCount}`);
  console.log(`📊 Ordens de Serviço no Turso:   ${ordersCount}`);
  console.log(`📊 Veículos cadastrados no Turso: ${vehiclesCount}`);
  console.log("=======================================================\n");
}

main()
  .catch((err) => {
    console.error("❌ Falha na sincronização com o Turso:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
