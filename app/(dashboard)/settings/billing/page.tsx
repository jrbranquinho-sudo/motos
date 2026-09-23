"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Check,
  Zap,
  ShieldCheck,
  FileText,
  AlertCircle,
  Building2,
  Sparkles,
  AlertTriangle,
  Clock,
  Calendar,
  RefreshCw,
  TrendingUp,
  AlertOctagon,
  HelpCircle,
  Flame,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { OFFICIAL_PLANS, getSubscriptionInfo, SubscriptionInfo } from "@/lib/subscription";

export default function BillingPage() {
  const {
    tenant,
    renewSubscription,
    simulateSubscriptionDays,
    serviceOrders,
    parts,
    users,
    currentUser,
    isMechanic,
  } = useMotoShop();

  const [subInfo, setSubInfo] = useState<SubscriptionInfo>(() => getSubscriptionInfo(tenant));
  const [successMsg, setSuccessMsg] = useState("");
  const [isRenewing, setIsRenewing] = useState(false);

  // Live countdown ticker
  useEffect(() => {
    const update = () => {
      setSubInfo(getSubscriptionInfo(tenant));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [tenant]);

  if (isMechanic) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acesso Restrito a Planos & Faturamento</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Mecânicos não possuem permissão para visualizar planos de assinatura, limites e dados financeiros da oficina.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors shadow-lg shadow-orange-500/20"
        >
          Voltar para Minhas OS
        </Link>
      </div>
    );
  }

  const handleRenew = (planId: "MONTHLY" | "ANNUAL") => {
    setIsRenewing(true);
    setTimeout(() => {
      renewSubscription(tenant.id, planId);
      setIsRenewing(false);
      setSuccessMsg(
        `Assinatura renovada com sucesso no ${OFFICIAL_PLANS[planId].name}! Novo ciclo de ${
          planId === "ANNUAL" ? "365" : "30"
        } dias iniciado.`
      );
      setTimeout(() => setSuccessMsg(""), 5000);
    }, 500);
  };

  const handleSimulate = (days: number, label: string) => {
    simulateSubscriptionDays(tenant.id, days);
    setSuccessMsg(`Simulação aplicada: ${label}`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const currentPlanConfig =
    OFFICIAL_PLANS[subInfo.planId === "ANNUAL" ? "ANNUAL" : "MONTHLY"];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-orange-500" />
            <span>Planos & Assinaturas da Oficina</span>
          </h1>
          <p className="text-sm text-zinc-400">
            Gerencie o ciclo de vigência, contador regressivo e renovação da plataforma
          </p>
        </div>

        {/* Quick Expiration Status Pill */}
        <div className="flex items-center gap-2">
          {subInfo.isExpired ? (
            <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1.5 animate-pulse">
              <AlertOctagon className="w-4 h-4" />
              <span>PLANO VENCIDO</span>
            </span>
          ) : subInfo.isWarning ? (
            <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>AVISO: MENOS DE 15% RESTANTE</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>ASSINATURA EM DIA</span>
            </span>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center gap-2 animate-in fade-in-50">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Warning / Expired Callout */}
      {subInfo.isExpired && (
        <div className="p-5 rounded-2xl bg-red-950/40 border-2 border-red-500/50 text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-red-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 text-red-400">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Assinatura Vencida • Renovação Obrigatória
              </h3>
              <p className="text-xs text-red-300/90 mt-0.5">
                O plano venceu. Usuários da oficina não conseguirão fazer novo login até que a assinatura seja renovada.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleRenew("MONTHLY")}
            className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs shadow-lg transition-all shrink-0"
          >
            Renovar Imediatamente
          </button>
        </div>
      )}

      {subInfo.isWarning && !subInfo.isExpired && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border-2 border-amber-500/50 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Atenção: Menos de 15% de Tempo Restante ({subInfo.daysRemaining} {subInfo.daysRemaining === 1 ? "dia" : "dias"} para expirar)
              </h3>
              <p className="text-xs text-amber-300/90 mt-0.5">
                Renove sua assinatura com antecedência para evitar bloqueio no acesso da equipe mecânica e recepção.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleRenew(subInfo.planId === "ANNUAL" ? "ANNUAL" : "MONTHLY")}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs shadow-lg transition-all shrink-0"
          >
            Renovar Agora
          </button>
        </div>
      )}

      {/* Countdown Card and Current Subscription */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Background glow */}
        <div
          className={`absolute -top-32 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
            subInfo.isExpired
              ? "bg-red-500/10"
              : subInfo.isWarning
              ? "bg-amber-500/15"
              : "bg-orange-500/10"
          }`}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Plano Atual Contratado
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                {tenant.name}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-1.5">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {currentPlanConfig.name}
              </h2>
              <span className="text-xl font-bold text-orange-400">
                {currentPlanConfig.formattedPrice}{" "}
                <span className="text-xs text-zinc-400">{currentPlanConfig.periodLabel}</span>
              </span>
            </div>

            <p className="text-xs text-zinc-400 mt-1">
              Ciclo total: <strong>{subInfo.totalDays} dias</strong> • Limite de aviso (15%):{" "}
              <strong>{subInfo.warningDaysThreshold} dias</strong>
            </p>
          </div>

          {/* Digital Countdown Display */}
          <div className="flex flex-col items-start lg:items-end gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>Contador Regressivo para Vencimento</span>
            </span>

            {/* Countdown Flip Clocks */}
            <div className="flex items-center gap-2 text-center">
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 min-w-[64px]">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {subInfo.isExpired ? "00" : String(subInfo.daysRemaining).padStart(2, "0")}
                </div>
                <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mt-0.5">
                  Dias
                </div>
              </div>

              <span className="text-zinc-600 font-bold text-xl">:</span>

              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {subInfo.isExpired ? "00" : String(subInfo.hoursRemaining).padStart(2, "0")}
                </div>
                <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mt-0.5">
                  Horas
                </div>
              </div>

              <span className="text-zinc-600 font-bold text-xl">:</span>

              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {subInfo.isExpired ? "00" : String(subInfo.minutesRemaining).padStart(2, "0")}
                </div>
                <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mt-0.5">
                  Min
                </div>
              </div>

              <span className="text-zinc-600 font-bold text-xl">:</span>

              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black font-mono text-orange-400">
                  {subInfo.isExpired ? "00" : String(subInfo.secondsRemaining).padStart(2, "0")}
                </div>
                <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mt-0.5">
                  Seg
                </div>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400">
              Vencimento:{" "}
              <strong className="text-zinc-200">
                {subInfo.expiresAt.toLocaleDateString("pt-BR")} às{" "}
                {subInfo.expiresAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </strong>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-400">Tempo de assinatura restante:</span>
            <span
              className={`font-mono font-bold ${
                subInfo.isExpired
                  ? "text-red-400"
                  : subInfo.isWarning
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {subInfo.isExpired ? "0%" : `${subInfo.percentRemaining.toFixed(1)}%`}
            </span>
          </div>

          <div className="w-full h-3 bg-zinc-950 rounded-full p-0.5 border border-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                subInfo.isExpired
                  ? "bg-red-500 w-full opacity-60"
                  : subInfo.isWarning
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : "bg-gradient-to-r from-emerald-500 to-teal-400"
              }`}
              style={{
                width: subInfo.isExpired ? "100%" : `${Math.max(3, subInfo.percentRemaining)}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>Início: {subInfo.startedAt.toLocaleDateString("pt-BR")}</span>
            <span className="text-amber-400/80 font-medium">
              Limite de Alerta (15%): {subInfo.warningDaysThreshold} dias
            </span>
            <span>Término: {subInfo.expiresAt.toLocaleDateString("pt-BR")}</span>
          </div>
        </div>

        {/* Interactive Testing Simulator Bar */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Painel de Testes & Simulação de Prazos (Demonstração)</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Alterne instantaneamente o prazo da oficina para verificar os alertas e o bloqueio de login:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => handleSimulate(subInfo.totalDays === 365 ? 300 : 25, "Plano em dia (>15%)")}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
            >
              ✓ Simular Em Dia ({subInfo.totalDays === 365 ? "300d" : "25d"})
            </button>

            <button
              onClick={() => handleSimulate(subInfo.totalDays === 365 ? 40 : 3.5, "Alerta de 15%")}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
            >
              ⚠️ Simular Alerta 15% ({subInfo.totalDays === 365 ? "40d" : "3.5d"})
            </button>

            <button
              onClick={() => handleSimulate(-2, "Plano Vencido")}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors"
            >
              🚫 Simular Vencido (-2 dias)
            </button>
          </div>
        </div>
      </div>

      {/* 2 Official Plans Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white">Nossos Planos Oficiais</h3>
          <p className="text-xs text-zinc-400">
            Escolha entre a flexibilidade do ciclo mensal ou a máxima economia com o plano anual
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Plan (R$ 280 / 30 dias) */}
          <div
            className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all relative border-2 ${
              subInfo.planId === "MONTHLY"
                ? "bg-zinc-900 border-orange-500 shadow-2xl shadow-orange-950/20"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {subInfo.planId === "MONTHLY" && (
              <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white shadow">
                Seu Plano Atual
              </span>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-2xl font-black text-white">Plano Mensal</h4>
                <span className="text-xs font-bold text-zinc-400 font-mono bg-zinc-800 px-2.5 py-1 rounded-lg">
                  30 dias
                </span>
              </div>

              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                Ideal para oficinas que preferem pagar mês a mês sem fidelidade.
              </p>

              <div className="my-6 pb-6 border-b border-zinc-800">
                <span className="text-4xl sm:text-5xl font-black text-white">R$ 280</span>
                <span className="text-sm text-zinc-400 ml-1.5 font-medium">/ mês</span>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Vigência de 30 dias com contador regressivo e aviso aos 4,5 dias restantes (15%).
                </div>
              </div>

              <div className="space-y-3 text-xs mb-8">
                {OFFICIAL_PLANS.MONTHLY.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-zinc-300">
                    <Check className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleRenew("MONTHLY")}
              disabled={isRenewing}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                subInfo.planId === "MONTHLY"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 active:scale-95"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white"
              }`}
            >
              {isRenewing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : subInfo.planId === "MONTHLY" ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Renovar por +30 Dias (R$ 280)</span>
                </>
              ) : (
                <span>Mudar para o Plano Mensal</span>
              )}
            </button>
          </div>

          {/* Annual Plan (R$ 2.000 / 365 dias) */}
          <div
            className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all relative border-2 ${
              subInfo.planId === "ANNUAL"
                ? "bg-gradient-to-b from-orange-500/10 via-zinc-900 to-zinc-950 border-orange-500 shadow-2xl shadow-orange-950/30"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow flex items-center gap-1">
              <Flame className="w-3 h-3" />
              <span>Economize R$ 1.360/ano</span>
            </span>

            {subInfo.planId === "ANNUAL" && (
              <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow">
                Seu Plano Atual
              </span>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-2xl font-black text-white">Plano Anual</h4>
                <span className="text-xs font-bold text-orange-400 font-mono bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 rounded-lg">
                  365 dias
                </span>
              </div>

              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                Estabilidade operacional garantida o ano inteiro com custo equivalente a ~R$ 166/mês.
              </p>

              <div className="my-6 pb-6 border-b border-zinc-800">
                <span className="text-4xl sm:text-5xl font-black text-white">R$ 2.000</span>
                <span className="text-sm text-zinc-400 ml-1.5 font-medium">/ ano</span>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Economia de R$ 1.360 comparado a 12 meses do plano avulso</span>
                </div>
              </div>

              <div className="space-y-3 text-xs mb-8">
                {OFFICIAL_PLANS.ANNUAL.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleRenew("ANNUAL")}
              disabled={isRenewing}
              className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 active:scale-95"
            >
              {isRenewing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : subInfo.planId === "ANNUAL" ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Renovar por +365 Dias (R$ 2.000)</span>
                </>
              ) : (
                <span>Fazer Upgrade para o Anual (R$ 2.000)</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-400" />
          <span>Histórico de Faturas & Pagamentos</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase">
                <th className="py-2.5">Fatura</th>
                <th className="py-2.5">Plano Contratado</th>
                <th className="py-2.5">Valor</th>
                <th className="py-2.5">Vigência</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Comprovante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              <tr className="text-zinc-300">
                <td className="py-3 font-mono">INV-2026-001</td>
                <td className="py-3 font-semibold text-white">{currentPlanConfig.name}</td>
                <td className="py-3 font-bold text-white">{currentPlanConfig.formattedPrice},00</td>
                <td className="py-3">{subInfo.totalDays} dias</td>
                <td className="py-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    PAGO
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => alert("Comprovante digital gerado com sucesso!")}
                    className="text-orange-400 hover:underline text-xs"
                  >
                    Baixar Recibo
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
