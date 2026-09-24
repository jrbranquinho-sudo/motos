"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertOctagon,
  CalendarX,
  CreditCard,
  ShieldAlert,
  Check,
  Sparkles,
  ArrowRight,
  LogOut,
  RefreshCw,
  PhoneCall,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { getSubscriptionInfo, OFFICIAL_PLANS } from "@/lib/subscription";

export default function SubscriptionExpiredModal() {
  const router = useRouter();
  const { tenant, currentUser, renewSubscription } = useMotoShop();
  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewedSuccess, setRenewedSuccess] = useState(false);

  // Never block the SaaS Master owner
  if (currentUser?.role === "SUPER_ADMIN") return null;
  if (!tenant) return null;

  const subInfo = getSubscriptionInfo(tenant);
  if (!subInfo.isExpired) return null;

  const handleRenew = () => {
    setIsRenewing(true);
    setTimeout(() => {
      renewSubscription(tenant.id, selectedPlan);
      setIsRenewing(false);
      setRenewedSuccess(true);
      setTimeout(() => {
        setRenewedSuccess(false);
      }, 1800);
    }, 800);
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-950 border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/50 text-zinc-100 relative my-8">
        {/* Glow accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-red-500/15 blur-3xl rounded-full pointer-events-none" />

        <div className="relative space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-500/20 animate-bounce">
              <CalendarX className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>{subInfo.isTrial ? "Demonstração de 7 Dias Expirada" : "Acesso Suspenso • Plano Vencido"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {subInfo.isTrial
                ? `Período de testes da ${tenant.name} encerrado`
                : `O plano da oficina ${tenant.name} expirou`}
            </h2>

            <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
              {subInfo.isTrial
                ? "Sua semana de degustação gratuita do Mot-OS foi concluída! Para continuar utilizando o sistema, gerando ordens de serviço e acompanhando seu estoque, escolha um plano abaixo para liberar o sistema."
                : "O período contratado da assinatura chegou ao fim. Para que sua equipe (recepção e mecânicos) continue utilizando o sistema e registrando ordens de serviço, é necessário renovar o plano."}
            </p>
          </div>

          {/* Alert Callout */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-start gap-3 text-xs text-zinc-300">
            <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white font-bold mb-0.5">
                Todos os dados e ordens de serviço continuam salvos
              </strong>
              Seus veículos, clientes, histórico de bancada e lançamentos estão preservados com segurança. Ao contratar, seu sistema é liberado imediatamente.
            </div>
          </div>

          {/* Plan Choice Cards */}
          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-3 uppercase tracking-wider">
              Selecione o plano para liberação imediata do Mot-OS:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Monthly Plan */}
              <button
                type="button"
                onClick={() => setSelectedPlan("MONTHLY")}
                className={`text-left p-5 rounded-2xl border transition-all relative ${
                  selectedPlan === "MONTHLY"
                    ? "bg-zinc-900 border-orange-500 ring-2 ring-orange-500/30 shadow-lg shadow-orange-500/10"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">Plano Mensal</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedPlan === "MONTHLY"
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-zinc-700"
                    }`}
                  >
                    {selectedPlan === "MONTHLY" && <Check className="w-3 h-3" />}
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-2xl font-black text-white">R$ 180</span>
                  <span className="text-xs text-zinc-400 ml-1">/ mês</span>
                </div>

                <p className="text-[11px] text-zinc-400">
                  Renovação com ciclo de 30 dias de acesso completo para a oficina.
                </p>
              </button>

              {/* Annual Plan */}
              <button
                type="button"
                onClick={() => setSelectedPlan("ANNUAL")}
                className={`text-left p-5 rounded-2xl border transition-all relative ${
                  selectedPlan === "ANNUAL"
                    ? "bg-gradient-to-b from-orange-500/10 to-zinc-900 border-orange-500 ring-2 ring-orange-500/40 shadow-xl shadow-orange-500/20"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-500 text-white shadow">
                  Economize R$ 960
                </span>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">Plano Anual</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedPlan === "ANNUAL"
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-zinc-700"
                    }`}
                  >
                    {selectedPlan === "ANNUAL" && <Check className="w-3 h-3" />}
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-2xl font-black text-white">R$ 1.200</span>
                  <span className="text-xs text-zinc-400 ml-1">/ ano</span>
                </div>

                <p className="text-[11px] text-zinc-400">
                  Garante 365 dias de estabilidade sem preocupação mensal (~R$ 100/mês).
                </p>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={isRenewing}
              onClick={handleRenew}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base shadow-xl shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isRenewing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Processando Renovação...</span>
                </>
              ) : renewedSuccess ? (
                <>
                  <Check className="w-5 h-5 text-emerald-300" />
                  <span>Plano Renovado com Sucesso! Reativando...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>
                    Renovar Agora • {selectedPlan === "ANNUAL" ? "R$ 1.200 (365 dias)" : "R$ 180 (30 dias)"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <a
              href={`https://wa.me/5511999998888?text=${encodeURIComponent(
                `Olá, gostaria de contratar e liberar o sistema Mot-OS para a oficina ${tenant.name} (Plano ${selectedPlan === "ANNUAL" ? "Anual R$ 1.200" : "Mensal R$ 180"}). Meu usuário é ${currentUser?.name || "Admin"}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Contratar via WhatsApp com Consultor Mot-OS</span>
            </a>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500 pt-2 border-t border-zinc-800">
              <span>Atendimento Direto: (11) 99999-8888</span>
              <button
                type="button"
                onClick={handleLogout}
                className="hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair e voltar para o Login</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
