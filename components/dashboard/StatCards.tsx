"use client";

import React from "react";
import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Wrench,
  Send,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export function StatCards() {
  const { metrics, currentUser, canViewFinancials } = useMotoShop();
  const isMechanic = currentUser.role === "MECHANIC";

  const cards = isMechanic
    ? [
        {
          title: "Minha Fila de Bancada",
          value: metrics.openOrders + metrics.inProgressOrders,
          subtext: `${metrics.openOrders} aguardando início • ${metrics.inProgressOrders} na bancada`,
          icon: Clock,
          color: "from-blue-500/20 to-blue-600/5",
          border: "border-blue-500/30",
          iconColor: "text-blue-400",
          href: "/orders",
        },
        {
          title: "Executadas Hoje por Mim",
          value: metrics.completedToday,
          subtext: "Devolvidas para recepção finalizar",
          icon: CheckCircle2,
          color: "from-emerald-500/20 to-emerald-600/5",
          border: "border-emerald-500/30",
          iconColor: "text-emerald-400",
          href: "/orders",
        },
        {
          title: "Aguardando Peças",
          value: metrics.waitingOrders,
          subtext: "Paradas aguardando peças/estoque",
          icon: Wrench,
          color: "from-amber-500/20 to-amber-600/5",
          border: "border-amber-500/30",
          iconColor: "text-amber-400",
          href: "/orders",
        },
        {
          title: "Estoque em Alerta",
          value: metrics.lowStockCount,
          subtext: "Peças em falta no estoque",
          icon: AlertTriangle,
          color: metrics.lowStockCount > 0 ? "from-red-500/20 to-rose-600/5" : "from-zinc-800 to-zinc-900",
          border: metrics.lowStockCount > 0 ? "border-red-500/30" : "border-zinc-800",
          iconColor: metrics.lowStockCount > 0 ? "text-red-400" : "text-zinc-400",
          href: "/stock",
          highlight: metrics.lowStockCount > 0,
        },
      ]
    : [
        {
          title: "OS em Andamento",
          value: metrics.openOrders + metrics.inProgressOrders,
          subtext: `${metrics.openOrders} abertas • ${metrics.inProgressOrders} na bancada`,
          icon: Clock,
          color: "from-blue-500/20 to-blue-600/5",
          border: "border-blue-500/30",
          iconColor: "text-blue-400",
          href: "/orders",
        },
        {
          title: "Concluídas Hoje",
          value: metrics.completedToday,
          subtext: "Motos prontas para entrega",
          icon: CheckCircle2,
          color: "from-emerald-500/20 to-emerald-600/5",
          border: "border-emerald-500/30",
          iconColor: "text-emerald-400",
          href: "/orders",
        },
        {
          title: "Faturamento no Mês",
          value: formatCurrency(metrics.monthlyRevenue),
          subtext: `Lucro líquido: ${formatCurrency(metrics.totalProfit)}`,
          icon: DollarSign,
          color: "from-orange-500/20 to-amber-600/5",
          border: "border-orange-500/30",
          iconColor: "text-orange-400",
          href: "/reports",
        },
        {
          title: "Estoque em Alerta",
          value: metrics.lowStockCount,
          subtext: "Peças abaixo do estoque mínimo",
          icon: AlertTriangle,
          color: metrics.lowStockCount > 0 ? "from-red-500/20 to-rose-600/5" : "from-zinc-800 to-zinc-900",
          border: metrics.lowStockCount > 0 ? "border-red-500/30" : "border-zinc-800",
          iconColor: metrics.lowStockCount > 0 ? "text-red-400" : "text-zinc-400",
          href: "/stock",
          highlight: metrics.lowStockCount > 0,
        },
      ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Link
            key={i}
            href={card.href}
            className={`p-5 rounded-xl bg-gradient-to-br ${card.color} bg-zinc-900/60 border ${card.border} hover:scale-[1.02] transition-all flex flex-col justify-between group shadow-lg`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center ${card.iconColor} group-hover:bg-zinc-800 transition-colors`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
                {card.value}
              </div>
              <p className="text-xs text-zinc-400 flex items-center justify-between">
                <span>{card.subtext}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
