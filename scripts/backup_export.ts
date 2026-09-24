import { prisma } from "../lib/prisma";
import fs from "fs";
import path from "path";

async function backup() {
  const backupDir = path.resolve(process.cwd(), "backup_dados");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        users: true,
        vehicles: true,
        parts: true,
        serviceOrders: {
          include: {
            items: true,
          }
        },
        suppliers: true,
      }
    });

    fs.writeFileSync(
      path.join(backupDir, "full_database_dump.json"),
      JSON.stringify(tenants, null, 2),
      "utf-8"
    );
    console.log(`[Backup Success] Dumped ${tenants.length} tenants with all relations to full_database_dump.json`);
  } catch (error) {
    console.error("[Backup Error]:", error);
  }
}

backup().finally(() => process.exit(0));
