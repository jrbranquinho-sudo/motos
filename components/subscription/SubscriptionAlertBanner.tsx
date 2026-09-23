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

  // Don't show to SaaS Master owner or if not in warning state
  if (currentUser?.role === "SUPER_ADMIN") return null;
  if (!subInfo || !subInfo.isWarning || subInfo.isExpired) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-amber-500/20 border-b border-amber-500/40 text-amber-200 px-4 py-2.5 shadow-lg shadow-amber-950/30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white uppercase tracking-wider text-[11px] bg-amber-500/30 px-2 py-0.5 rounded">
                Alerta de Vencimento • {subInfo.planName}
              </span>
              <span className="text-amber-300/80 font-medium hidden md:inline">
                Menos de 15% do ciclo restante
              </span>
            </div>
            <p className="text-zinc-200 mt-0.5">
              O plano da oficina vence em{" "}
              <strong className="text-amber-300 font-mono font-bold">
                {subInfo.daysRemaining} {subInfo.daysRemaining === 1 ? "dia" : "dias"} e{" "}
                {subInfo.hoursRemaining}h {subInfo.minutesRemaining}m {subInfo.secondsRemaining}s
              </strong>
              . Renove agora para evitar o bloqueio de acesso à sua equipe.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] bg-black/40 px-3 py-1 rounded-lg border border-amber-500/30 text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{subInfo.formattedTimeRemaining}</span>
          </div>

          <Link
            href="/settings/billing"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow transition-all active:scale-95"
          >
            <span>Renovar Assinatura</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
