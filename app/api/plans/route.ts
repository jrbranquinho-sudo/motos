import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { INITIAL_OFFICIAL_PLANS, PlanConfig } from "@/lib/subscription";

export const dynamic = "force-dynamic";

const DATA_DIR = path.resolve(process.cwd(), "data");
const PLANS_FILE = path.join(DATA_DIR, "official_plans.json");

function getStoredPlans(): PlanConfig[] {
  try {
    if (fs.existsSync(PLANS_FILE)) {
      const raw = fs.readFileSync(PLANS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Erro ao ler arquivo de planos:", e);
  }
  return INITIAL_OFFICIAL_PLANS;
}

function saveStoredPlans(plans: PlanConfig[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PLANS_FILE, JSON.stringify(plans, null, 2), "utf-8");
  } catch (e) {
    console.error("Erro ao salvar arquivo de planos:", e);
  }
}

// GET: Return current official SaaS plans
export async function GET() {
  const plans = getStoredPlans();
  return NextResponse.json({ success: true, plans });
}

// POST: Update official SaaS plans (called when SaaS Master alters plans)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plans } = body;

    if (!Array.isArray(plans)) {
      return NextResponse.json(
        { success: false, error: "A lista de planos deve ser um array." },
        { status: 400 }
      );
    }

    saveStoredPlans(plans);

    return NextResponse.json({
      success: true,
      message: "Planos oficiais atualizados com sucesso.",
      plans,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar planos";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
