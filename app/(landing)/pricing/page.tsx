"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles, Wrench, ShieldCheck, Flame, Clock } from "lucide-react";
import { OFFICIAL_PLANS } from "@/lib/subscription";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-zinc-100 py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Página Inicial</span>
          </Link>

          <Link href="/dashboard" className="text-xs text-orange-400 font-bold hover:underline">
            Ir para o Painel ➔
          </Link>
        </div>

        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-bold text-orange-400 tracking-wider">
            Planos Oficiais & Assinaturas
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Transparência para a sua Oficina
          </h1>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            Escolha o plano ideal para a sua equipe com contador regressivo transparente e renovação simplificada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          {/* Plano Mensal - R$ 280 / 30 dias */}
          <div className="p-8 rounded-3xl bg-zinc-900/80 border-2 border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-xl">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white">Plano Mensal</h3>
                <span className="text-xs font-bold text-zinc-400 font-mono bg-zinc-800 px-3 py-1 rounded-lg">
                  30 dias
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Flexibilidade e pagamento mês a mês</p>

              <div className="my-6 pb-6 border-b border-zinc-800">
                <span className="text-5xl font-black text-white">R$ 280</span>
                <span className="text-sm text-zinc-400 ml-1.5 font-medium">/ mês</span>
                <div className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Ciclo de 30 dias com contador regressivo e aviso aos 15% (4,5 dias)</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-zinc-300">
                {OFFICIAL_PLANS.MONTHLY.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/login"
              className="mt-8 w-full py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm text-center block transition-colors"
            >
              Começar com Plano Mensal
            </Link>
          </div>

          {/* Plano Anual - R$ 2.000 / 365 dias */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-orange-500/10 via-zinc-900 to-zinc-950 border-2 border-orange-500 flex flex-col justify-between shadow-2xl relative">
            <span className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Economize R$ 1.360/ano</span>
            </span>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white">Plano Anual</h3>
                <span className="text-xs font-bold text-orange-400 font-mono bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded-lg">
                  365 dias
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Garante 1 ano de tranquilidade e maior economia</p>

              <div className="my-6 pb-6 border-b border-zinc-800">
                <span className="text-5xl font-black text-white">R$ 2.000</span>
                <span className="text-sm text-zinc-400 ml-1.5 font-medium">/ ano</span>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Equivalente a apenas ~R$ 166/mês • Aviso aos 15% (54 dias)</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-zinc-300">
                {OFFICIAL_PLANS.ANNUAL.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/login"
              className="mt-8 w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm text-center block shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
            >
              Assinar com Desconto Anual
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
