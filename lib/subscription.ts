import { Plan, Tenant } from "./types";

export interface PlanConfig {
  id: "MONTHLY" | "ANNUAL" | "TRIAL";
  name: string;
  badge?: string;
  price: number;
  formattedPrice: string;
  periodLabel: string;
  durationDays: number;
  description: string;
  features: string[];
  savings?: string;
  popular?: boolean;
}

export const OFFICIAL_PLANS: Record<"MONTHLY" | "ANNUAL" | "TRIAL", PlanConfig> = {
  TRIAL: {
    id: "TRIAL",
    name: "Demonstração (1 Semana)",
    badge: "Teste Gratuito 7 Dias",
    price: 0,
    formattedPrice: "Grátis (7 Dias)",
    periodLabel: " / 7 dias",
    durationDays: 7,
    description: "Período de testes completo de 7 dias para conhecer o Mot-OS na prática.",
    features: [
      "Acesso completo a todas as ferramentas por 7 dias",
      "Segmentado para seu tipo de oficina (Motos, Carros, etc.)",
      "Ordens de Serviço, Kanban e Impressão térmica/A4",
      "Controle de estoque com baixa automática",
      "Notificações em 1 clique via WhatsApp",
      "Suporte e consultoria para contratação definitiva",
    ],
  },
  MONTHLY: {
    id: "MONTHLY",
    name: "Plano Mensal",
    badge: "Recorrente",
    price: 280,
    formattedPrice: "R$ 280",
    periodLabel: "/ mês",
    durationDays: 30,
    description: "Flexibilidade mês a mês para oficinas mecânicas e centros automotivos.",
    features: [
      "Ordens de Serviço e Kanban ilimitados",
      "Controle total de estoque e peças",
      "Cadastro de veículos do seu segmento e histórico",
      "Impressão térmica 80mm e folha A4",
      "Acesso simultâneo para toda a equipe",
      "Notificações automáticas via WhatsApp",
      "Suporte prioritário via WhatsApp e e-mail",
    ],
  },
  ANNUAL: {
    id: "ANNUAL",
    name: "Plano Anual",
    badge: "Melhor Custo-Benefício",
    popular: true,
    price: 2000,
    formattedPrice: "R$ 2.000",
    periodLabel: "/ ano",
    durationDays: 365,
    savings: "Economize R$ 1.360/ano (Equivalente a ~R$ 166/mês)",
    description: "Máxima economia e estabilidade operacional garantida por 365 dias.",
    features: [
      "Tudo incluído no Plano Mensal",
      "Economia de R$ 1.360 em relação ao ciclo mensal",
      "Congelamento de tabela por 12 meses",
      "Backup diário na nuvem com restauração rápida",
      "Treinamento online inicial para recepção e mecânicos",
      "Gerente de conta dedicado",
      "SLA de suporte prioritário 99.9%",
    ],
  },
};

export interface SubscriptionInfo {
  planId: "MONTHLY" | "ANNUAL" | "TRIAL" | Plan;
  planName: string;
  price: number;
  totalDays: number;
  startedAt: Date;
  expiresAt: Date;
  msRemaining: number;
  totalMs: number;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  percentRemaining: number;
  isExpired: boolean;
  isWarning: boolean; // True if <= 15% of total time remains
  warningDaysThreshold: number; // 4.5 days for 30d, 54.75 days for 365d
  formattedTimeRemaining: string;
  statusText: string;
  statusColor: "emerald" | "amber" | "red";
  isTrial: boolean;
}

/**
 * Calculates current subscription state and countdown metrics for a tenant
 */
export function getSubscriptionInfo(tenant: Tenant, referenceDate: Date = new Date()): SubscriptionInfo {
  const isTrial = tenant.plan === "TRIAL" || tenant.isTrial === true || tenant.subscriptionCycle === "TRIAL";
  const isAnnual =
    !isTrial && (
      tenant.subscriptionCycle === "ANNUAL" ||
      tenant.plan === "ANNUAL" ||
      tenant.subscriptionDurationDays === 365
    );

  const planId: "MONTHLY" | "ANNUAL" | "TRIAL" = isTrial ? "TRIAL" : isAnnual ? "ANNUAL" : "MONTHLY";
  const planConfig = OFFICIAL_PLANS[planId];
  const totalDays = isTrial ? (tenant.subscriptionDurationDays || 7) : isAnnual ? 365 : 30;
  const warningDaysThreshold = isTrial ? 2 : totalDays * 0.15;
  const price = tenant.subscriptionPrice ?? planConfig.price;

  // Derive dates
  let expiresAt: Date;
  let startedAt: Date;

  if (tenant.subscriptionExpiresAt) {
    expiresAt = new Date(tenant.subscriptionExpiresAt);
    startedAt = tenant.subscriptionStartedAt
      ? new Date(tenant.subscriptionStartedAt)
      : new Date(expiresAt.getTime() - totalDays * 24 * 60 * 60 * 1000);
  } else {
    // Default fallback based on tenant creation
    const created = new Date(tenant.createdAt || referenceDate);
    startedAt = created;
    expiresAt = new Date(created.getTime() + totalDays * 24 * 60 * 60 * 1000);
  }

  const nowMs = referenceDate.getTime();
  const expiresMs = expiresAt.getTime();
  const startedMs = startedAt.getTime();
  const totalMs = Math.max(1000, expiresMs - startedMs);
  const msRemaining = expiresMs - nowMs;

  const isExpired = msRemaining <= 0;

  // Percentage remaining (clamped 0 to 100)
  const percentRemaining = isExpired
    ? 0
    : Math.min(100, Math.max(0, (msRemaining / totalMs) * 100));

  // Warning is triggered when remaining is <= 15% of total subscription duration
  const isWarning = !isExpired && (percentRemaining <= 15 || msRemaining <= warningDaysThreshold * 24 * 60 * 60 * 1000);

  // Time components
  const absoluteMs = Math.max(0, msRemaining);
  const totalSeconds = Math.floor(absoluteMs / 1000);
  const secondsRemaining = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutesRemaining = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hoursRemaining = totalHours % 24;
  const daysRemaining = Math.floor(totalHours / 24);

  let formattedTimeRemaining = "";
  if (isExpired) {
    const overdueMs = Math.abs(msRemaining);
    const overdueDays = Math.ceil(overdueMs / (1000 * 60 * 60 * 24));
    formattedTimeRemaining = `Vencido há ${overdueDays} ${overdueDays === 1 ? "dia" : "dias"}`;
  } else if (daysRemaining > 0) {
    formattedTimeRemaining = `${daysRemaining}d ${hoursRemaining}h ${minutesRemaining}m ${secondsRemaining}s`;
  } else {
    formattedTimeRemaining = `${hoursRemaining}h ${minutesRemaining}m ${secondsRemaining}s`;
  }

  let statusText = "Ativo e Regular";
  let statusColor: "emerald" | "amber" | "red" = "emerald";

  if (isExpired) {
    statusText = isTrial ? "Período de Teste Expirado" : "Plano Vencido";
    statusColor = "red";
  } else if (isTrial) {
    statusText = "Em Período de Teste (7 Dias)";
    statusColor = isWarning ? "amber" : "emerald";
  } else if (isWarning) {
    statusText = "Vencimento Próximo";
    statusColor = "amber";
  }

  return {
    planId,
    planName: planConfig.name,
    price,
    totalDays,
    startedAt,
    expiresAt,
    msRemaining,
    totalMs,
    daysRemaining,
    hoursRemaining,
    minutesRemaining,
    secondsRemaining,
    percentRemaining,
    isExpired,
    isWarning,
    warningDaysThreshold,
    formattedTimeRemaining,
    statusText,
    statusColor,
    isTrial,
  };
}

/**
 * Generates ISO strings for renewal
 */
export function calculateRenewalDates(plan: "MONTHLY" | "ANNUAL"): {
  subscriptionStartedAt: string;
  subscriptionExpiresAt: string;
  subscriptionDurationDays: number;
  subscriptionPrice: number;
} {
  const now = new Date();
  const durationDays = plan === "ANNUAL" ? 365 : 30;
  const expires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  return {
    subscriptionStartedAt: now.toISOString(),
    subscriptionExpiresAt: expires.toISOString(),
    subscriptionDurationDays: durationDays,
    subscriptionPrice: OFFICIAL_PLANS[plan].price,
  };
}
