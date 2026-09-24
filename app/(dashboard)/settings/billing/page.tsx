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
  Plus,
  Edit3,
  Power,
  Trash2,
  X,
  Eye,
  EyeOff,
  Crown,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { PlanConfig, getSubscriptionInfo, SubscriptionInfo } from "@/lib/subscription";

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
    isSaasOwner,
    plans,
    addPlan,
    updatePlan,
    togglePlanStatus,
    deletePlan,
  } = useMotoShop();

  const [subInfo, setSubInfo] = useState<SubscriptionInfo>(() =>
    getSubscriptionInfo(tenant, new Date(), plans)
  );
  const [successMsg, setSuccessMsg] = useState("");
  const [isRenewing, setIsRenewing] = useState(false);

  // Plan Management Modal State (SaaS Master)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState<number>(280);
  const [formDurationDays, setFormDurationDays] = useState<number>(30);
  const [formPeriodLabel, setFormPeriodLabel] = useState("/ mês");
  const [formBadge, setFormBadge] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFeaturesText, setFormFeaturesText] = useState("");
  const [formPopular, setFormPopular] = useState(false);
  const [formActive, setFormActive] = useState(true);

  // Live countdown ticker
  useEffect(() => {
    const update = () => {
      setSubInfo(getSubscriptionInfo(tenant, new Date(), plans));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [tenant, plans]);

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

  const handleRenew = (planId: string) => {
    setIsRenewing(true);
    setTimeout(() => {
      renewSubscription(tenant.id, planId);
      setIsRenewing(false);
      const targetPlan = plans.find((p) => p.id === planId);
      setSuccessMsg(
        `Assinatura atualizada com sucesso para "${targetPlan?.name || planId}"! Novo ciclo de ${
          targetPlan?.durationDays || 30
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

  // Open modal to create a new plan
  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setFormName("");
    setFormPrice(350);
    setFormDurationDays(30);
    setFormPeriodLabel("/ mês");
    setFormBadge("");
    setFormDescription("Acesso completo a todas as ferramentas operacionais do sistema.");
    setFormFeaturesText(
      "Ordens de Serviço e Kanban ilimitados\nControle total de estoque e peças\nProntuário por Placa do veículo\nImpressão térmica 80mm e folha A4\nNotificações automáticas via WhatsApp\nSuporte prioritário"
    );
    setFormPopular(false);
    setFormActive(true);
    setIsPlanModalOpen(true);
  };

  // Open modal to edit existing plan
  const handleOpenEditPlan = (plan: PlanConfig) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormPrice(plan.price);
    setFormDurationDays(plan.durationDays);
    setFormPeriodLabel(plan.periodLabel);
    setFormBadge(plan.badge || "");
    setFormDescription(plan.description);
    setFormFeaturesText(plan.features.join("\n"));
    setFormPopular(!!plan.popular);
    setFormActive(plan.active);
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Informe o nome do plano.");
      return;
    }

    const features = formFeaturesText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingPlan) {
      updatePlan(editingPlan.id, {
        name: formName.trim(),
        price: Number(formPrice),
        formattedPrice: `R$ ${Number(formPrice).toLocaleString("pt-BR")}`,
        durationDays: Number(formDurationDays),
        periodLabel: formPeriodLabel.trim(),
        badge: formBadge.trim() || undefined,
        description: formDescription.trim(),
        features,
        popular: formPopular,
        active: formActive,
      });
      setSuccessMsg(`Plano "${formName}" atualizado com sucesso!`);
    } else {
      const created = addPlan({
        name: formName.trim(),
        price: Number(formPrice),
        formattedPrice: `R$ ${Number(formPrice).toLocaleString("pt-BR")}`,
        durationDays: Number(formDurationDays),
        periodLabel: formPeriodLabel.trim(),
        badge: formBadge.trim() || undefined,
        description: formDescription.trim(),
        features,
        popular: formPopular,
        active: formActive,
      });
      setSuccessMsg(`Novo plano "${created.name}" cadastrado com sucesso!`);
    }

    setIsPlanModalOpen(false);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const handleTogglePlan = (plan: PlanConfig) => {
    togglePlanStatus(plan.id);
    const newStatus = !plan.active ? "reativado" : "desativado";
    setSuccessMsg(`Plano "${plan.name}" ${newStatus} com sucesso!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleDeletePlan = (plan: PlanConfig) => {
    if (confirm(`Tem certeza que deseja remover o plano "${plan.name}"?`)) {
      deletePlan(plan.id);
      setSuccessMsg(`Plano "${plan.name}" removido com sucesso.`);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  // Active plans for tenants vs All plans for SaaS Master
  const displayPlans = isSaasOwner ? plans : plans.filter((p) => p.active);

  const currentPlanConfig =
    plans.find((p) => p.id === subInfo.planId) ||
    plans[0] || {
      id: "MONTHLY",
      name: "Plano Mensal",
      price: 280,
      formattedPrice: "R$ 280",
      periodLabel: "/ mês",
      durationDays: 30,
      description: "Plano Operacional",
      features: [],
      active: true,
    };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-orange-500" />
            <span>Planos & Assinaturas</span>
          </h1>
          <p className="text-sm text-zinc-400">
            Gerencie o ciclo de vigência, contador regressivo e planos da plataforma
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
            onClick={() => handleRenew(subInfo.planId || "MONTHLY")}
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
            onClick={() => handleRenew(subInfo.planId || "MONTHLY")}
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

            <div className="flex flex-wrap items-baseline gap-3 mt-1.5">
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
            <div className="flex items-center gap-1.5 sm:gap-2 text-center">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-950 border border-zinc-800 min-w-[56px] sm:min-w-[64px]">
                <div className="text-xl sm:text-3xl font-black font-mono text-white">
                  {subInfo.isExpired ? "00" : String(subInfo.daysRemaining).padStart(2, "0")}
                </div>
                <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mt-0.5">
                  Dias
                </div>
              </div>

              <span className="text-zinc-600 font-bold text-lg sm:text-xl">:</span>

              <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-950 border border-zinc-800 min-w-[52px] sm:min-w-[60px]">
                <div className="text-xl sm:text-3xl font-black font-mono text-white">
                  {subInfo.isExpired ? "00" : String(subInfo.hoursRemaining).padStart(2, "0")}
                </div>
                <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mt-0.5">
                  Horas
                </div>
              </div>

              <span className="text-zinc-600 font-bold text-lg sm:text-xl">:</span>

              <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-950 border border-zinc-800 min-w-[52px] sm:min-w-[60px]">
                <div className="text-xl sm:text-3xl font-black font-mono text-white">
                  {subInfo.isExpired ? "00" : String(subInfo.minutesRemaining).padStart(2, "0")}
                </div>
                <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mt-0.5">
                  Min
                </div>
              </div>

              <span className="text-zinc-600 font-bold text-lg sm:text-xl">:</span>

              <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-950 border border-zinc-800 min-w-[52px] sm:min-w-[60px]">
                <div className="text-xl sm:text-3xl font-black font-mono text-orange-400">
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-zinc-500">
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

      {/* ========================================================= */}
      {/* NOSSOS PLANOS OFICIAIS (COM CRIAÇÃO/EDIÇÃO/DESATIVAÇÃO)    */}
      {/* ========================================================= */}
      <div id="planos" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-white">Nossos Planos Oficiais</h3>
              {isSaasOwner && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Gestão SaaS Master
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {isSaasOwner
                ? `Você tem ${plans.length} planos cadastrados (${plans.filter((p) => p.active).length} ativos, ${plans.filter((p) => !p.active).length} desativados). Você pode criar, alterar, desativar e reativar quando desejar.`
                : "Escolha o ciclo de contratação ideal para sua oficina mecânica e aproveite todas as funcionalidades."}
            </p>
          </div>

          {/* Master Action: Create Plan Button */}
          {isSaasOwner && (
            <button
              onClick={handleOpenCreatePlan}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Criar Novo Plano</span>
            </button>
          )}
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPlans.map((plan) => {
            const isCurrent = subInfo.planId === plan.id;
            const isInactive = !plan.active;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all relative border-2 ${
                  isInactive
                    ? "bg-zinc-950/60 border-zinc-800/80 opacity-75"
                    : isCurrent
                    ? "bg-zinc-900 border-orange-500 shadow-2xl shadow-orange-950/30"
                    : plan.popular
                    ? "bg-gradient-to-b from-orange-500/10 via-zinc-900 to-zinc-950 border-orange-500/80 shadow-xl"
                    : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {/* Status Badges */}
                <div className="absolute -top-3 left-6 right-6 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    {isCurrent && (
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white shadow">
                        Plano Atual
                      </span>
                    )}
                    {isInactive && isSaasOwner && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40">
                        Desativado
                      </span>
                    )}
                    {!isInactive && isSaasOwner && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Ativo
                      </span>
                    )}
                  </div>

                  {plan.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      <span>{plan.badge}</span>
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2 mt-1">
                    <h4 className="text-xl sm:text-2xl font-black text-white">{plan.name}</h4>
                    <span className="text-xs font-bold text-zinc-400 font-mono bg-zinc-800 px-2.5 py-1 rounded-lg">
                      {plan.durationDays} dias
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mb-5 leading-relaxed min-h-[32px]">
                    {plan.description}
                  </p>

                  <div className="my-4 pb-5 border-b border-zinc-800">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      {plan.formattedPrice}
                    </span>
                    <span className="text-xs sm:text-sm text-zinc-400 ml-1.5 font-medium">
                      {plan.periodLabel}
                    </span>
                    {plan.savings && (
                      <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{plan.savings}</span>
                      </div>
                    )}
                  </div>

                  {/* Features list */}
                  <div className="space-y-2.5 text-xs mb-6">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-zinc-300">
                        <Check className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  {/* SaaS Master Action Controls */}
                  {isSaasOwner && (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditPlan(plan)}
                        className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePlan(plan)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                          plan.active
                            ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{plan.active ? "Desativar" : "Reativar"}</span>
                      </button>
                    </div>
                  )}

                  {/* Renew / Hire Button */}
                  <button
                    onClick={() => handleRenew(plan.id)}
                    disabled={isRenewing || (!plan.active && !isSaasOwner)}
                    className={`w-full py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                      isCurrent
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 active:scale-95"
                        : "bg-zinc-800 hover:bg-zinc-700 text-white"
                    } disabled:opacity-50`}
                  >
                    {isRenewing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processando...</span>
                      </>
                    ) : isCurrent ? (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Renovar por +{plan.durationDays} Dias ({plan.formattedPrice})</span>
                      </>
                    ) : (
                      <span>Contratar {plan.name}</span>
                    )}
                  </button>

                  {/* Custom Plan Delete Button (SaaS Master only) */}
                  {isSaasOwner && plan.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(plan)}
                      className="w-full py-1 text-[11px] text-zinc-500 hover:text-red-400 flex items-center justify-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Excluir Plano Personalizado</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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

      {/* ========================================================= */}
      {/* MODAL: CRIAR / EDITAR PLANO OFICIAL (SAAS MASTER)         */}
      {/* ========================================================= */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center font-bold">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingPlan ? "Alterar Plano Oficial" : "Criar Novo Plano Oficial"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Configure os parâmetros comerciais e vigência para as oficinas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Nome do Plano *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Plano Trimestral Pro, Semestral, etc."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm font-mono focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Vigência (Dias) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formDurationDays}
                    onChange={(e) => setFormDurationDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm font-mono focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Rótulo Período
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: / mês, / ano"
                    value={formPeriodLabel}
                    onChange={(e) => setFormPeriodLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Badge de Destaque (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mais Popular, Econômico, Lançamento"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Descrição Curta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Para oficinas que buscam máxima economia no longo prazo."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Recursos & Benefícios (Um por linha)
                </label>
                <textarea
                  rows={4}
                  value={formFeaturesText}
                  onChange={(e) => setFormFeaturesText(e.target.value)}
                  placeholder="Ordens de Serviço ilimitadas&#10;Controle de estoque completo&#10;Impressão térmica 80mm"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs leading-relaxed focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-zinc-800">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-500 bg-zinc-950 border-zinc-700 focus:ring-0"
                  />
                  <span>Plano Ativo (visível para contratação de oficinas)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formPopular}
                    onChange={(e) => setFormPopular(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-500 bg-zinc-950 border-zinc-700 focus:ring-0"
                  />
                  <span>Destacar como Mais Popular</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
                >
                  {editingPlan ? "Salvar Alterações" : "Criar Plano"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
