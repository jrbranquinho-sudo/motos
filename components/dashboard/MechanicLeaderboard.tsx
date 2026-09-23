"use client";

import React from "react";
import { Award, UserCheck, Clock, Flame, ChevronRight } from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export function MechanicLeaderboard() {
  const { users, tenant, serviceOrders, parts } = useMotoShop();

  const mechanics = users.filter((u) => u.tenantId === tenant.id && u.role === "MECHANIC");

  const mechanicStats = mechanics.map((m) => {
    const orders = serviceOrders.filter((o) => o.mechanicId === m.id);
    const completed = orders.filter((o) => o.status === "COMPLETED" || o.status === "DELIVERED");
    const totalLabor = completed.reduce((sum, o) => sum + (o.totalLabor || 0), 0);
    const avgTime = completed.length > 0
      ? Math.round(
          completed.reduce((acc, o) => acc + (o.spentMinutes || o.estimatedMinutes || 60), 0) /
            completed.length
        )
      : 0;

    return {
      mechanic: m,
      totalOrders: orders.length,
      completedOrders: completed.length,
      totalLabor,
      avgTime,
    };
  }).sort((a, b) => b.completedOrders - a.completedOrders);

  // Top parts with low stock flag
  const topParts = [...parts]
    .filter((p) => p.tenantId === tenant.id)
    .sort((a, b) => b.salePrice - a.salePrice)
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Mechanic Ranking */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-lg text-white">Produtividade dos Mecânicos</h3>
            </div>
            <span className="text-xs font-semibold text-zinc-500 uppercase">Mês Atual</span>
          </div>

          <div className="space-y-3">
            {mechanicStats.map((item, idx) => (
              <div
                key={item.mechanic.id}
                className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400 text-sm">
                      {item.mechanic.name.slice(0, 2).toUpperCase()}
                    </div>
                    {idx === 0 && (
                      <span className="absolute -top-1 -right-1 text-xs">🥇</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-100">{item.mechanic.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {item.avgTime} min médio
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">
                        {formatCurrency(item.totalLabor)} em MO
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-white">
                    {item.completedOrders}
                  </span>
                  <p className="text-[10px] text-zinc-500 uppercase font-semibold">OS Concluídas</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-zinc-800 flex justify-end">
          <Link
            href="/reports"
            className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
          >
            <span>Ver relatório de equipe completo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Top Parts & Quick Inventory overview */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-lg text-white">Giro Rápido no Estoque</h3>
            </div>
            <Link
              href="/stock"
              className="text-xs text-zinc-400 hover:text-orange-400 transition-colors"
            >
              Ver Todas
            </Link>
          </div>

          <div className="space-y-2.5">
            {topParts.map((part) => {
              const isLow = part.stockQty <= part.minStock;
              return (
                <div
                  key={part.id}
                  className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded">
                        {part.code}
                      </span>
                      <span className="font-semibold text-zinc-200 truncate">{part.name}</span>
                    </div>
                    <span className="text-zinc-500 text-[11px]">{part.category}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-zinc-100">{formatCurrency(part.salePrice)}</div>
                    <div
                      className={`text-[11px] font-semibold ${
                        isLow ? "text-red-400 animate-pulse" : "text-zinc-400"
                      }`}
                    >
                      {part.stockQty} em estoque {isLow && "(Mín: " + part.minStock + ")"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-500">Dedução automática ao faturar OS</span>
          <Link
            href="/stock"
            className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
          >
            <span>Gerenciar Inventário</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
