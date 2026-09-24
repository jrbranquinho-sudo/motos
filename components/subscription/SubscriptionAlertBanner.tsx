"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { getSubscriptionInfo, SubscriptionInfo } from "@/lib/subscription";

export default function SubscriptionAlertBanner() {
  const { tenant, currentUser } = useMotoShop();
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    // Tick every second for live countdown
    const update = () => {
      if (!tenant) return;
      setSubInfo(getSubscriptionInfo(tenant));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [tenant]);

  // Don't show to SaaS Master owner or if not in warning/trial state
  if (currentUser?.role === "SUPER_ADMIN") return null;
  if (!subInfo || (!subInfo.isWarning && !subInfo.isTrial) || subInfo.isExpired) return null;

  const isTrial = subInfo.isTrial;

  return (
    <div className={`border-b text-xs px-4 py-2.5 shadow-lg ${
      isTrial
        ? "bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-blue-950/70 border-blue-500/40 text-blue-200 shadow-blue-950/30"
        : "bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-amber-500/20 border-amber-500/40 text-amber-200 shadow-amber-950/30"
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            isTrial
              ? "bg-blue-500/20 border border-blue-500/40 text-blue-400"
              : "bg-amber-500/20 border border-amber-500/40 text-amber-400 animate-pulse"
          }`}>
            {isTrial ? <Sparkles className="w-4 h-4 text-blue-400" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-black uppercase tracking-wider text-[11px] px-2 py-0.5 rounded ${
                isTrial
                  ? "bg-blue-500/30 text-blue-300 border border-blue-500/40"
                  : "bg-amber-500/30 text-white"
              }`}>
                {isTrial ? "Demonstração Gratuita (7 Dias)" : `Alerta de Vencimento • ${subInfo.planName}`}
              </span>
              <span className="text-zinc-400 font-medium hidden md:inline">
                {isTrial ? "Período de testes Mot-OS liberado" : "Menos de 15% do ciclo restante"}
              </span>
            </div>
            <p className="text-zinc-200 mt-0.5">
              {isTrial ? (
                <>
                  Seu período de teste encerra em{" "}
                  <strong className="text-blue-300 font-mono font-bold">
                    {subInfo.daysRemaining} {subInfo.daysRemaining === 1 ? "dia" : "dias"} e{" "}
                    {subInfo.hoursRemaining}h {subInfo.minutesRemaining}m {subInfo.secondsRemaining}s
                  </strong>
                  . Aproveite todos os recursos liberados!
                </>
              ) : (
                <>
                  O plano da oficina vence em{" "}
                  <strong className="text-amber-300 font-mono font-bold">
                    {subInfo.daysRemaining} {subInfo.daysRemaining === 1 ? "dia" : "dias"} e{" "}
                    {subInfo.hoursRemaining}h {subInfo.minutesRemaining}m {subInfo.secondsRemaining}s
                  </strong>
                  . Renove agora para evitar o bloqueio de acesso à sua equipe.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] bg-black/40 px-3 py-1 rounded-lg border border-zinc-700 text-zinc-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{subInfo.formattedTimeRemaining}</span>
          </div>

          <Link
            href="/settings/billing"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white font-bold text-xs shadow transition-all active:scale-95 ${
              isTrial
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            }`}
          >
            <span>{isTrial ? "Contratar Mot-OS" : "Renovar Assinatura"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
