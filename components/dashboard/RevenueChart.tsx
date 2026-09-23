"use client";

import React, { useState } from "react";
import { TrendingUp, BarChart2, DollarSign, Wrench } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useMotoShop } from "@/lib/store";

export function RevenueChart() {
  const { serviceOrders } = useMotoShop();
  const [period, setPeriod] = useState<"week" | "month">("month");

  // Sample aggregated data for visualization
  const monthlyData = [
    { label: "Mai", revenue: 4850, parts: 2900, labor: 1950 },
    { label: "Jun", revenue: 6200, parts: 3700, labor: 2500 },
    { label: "Jul", revenue: 5900, parts: 3400, labor: 2500 },
    { label: "Ago", revenue: 8100, parts: 4900, labor: 3200 },
    { label: "Set (Atual)", revenue: 9450, parts: 5700, labor: 3750 },
  ];

  const maxVal = Math.max(...monthlyData.map((d) => d.revenue));

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 shadow-xl flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-lg text-white">Evolução do Faturamento</h3>
          </div>
          <p className="text-xs text-zinc-400">
            Comparativo de receita bruta (Peças vendidas vs. Mão de Obra)
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
          <button
            onClick={() => setPeriod("month")}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              period === "month"
                ? "bg-orange-500 text-white font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setPeriod("week")}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              period === "week"
                ? "bg-orange-500 text-white font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Semanal
          </button>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="space-y-4 pt-2">
        <div className="h-44 sm:h-52 flex items-end justify-between gap-3 sm:gap-6 pt-6 px-2 border-b border-zinc-800">
          {monthlyData.map((item, idx) => {
            const heightPercent = Math.round((item.revenue / maxVal) * 100);
            const partsPercent = Math.round((item.parts / item.revenue) * 100);
            const laborPercent = 100 - partsPercent;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                {/* Tooltip on Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-200 mb-2 whitespace-nowrap shadow-xl pointer-events-none">
                  <div className="font-bold text-orange-400">{formatCurrency(item.revenue)}</div>
                  <div className="text-[10px] text-zinc-400">
                    Peças: {formatCurrency(item.parts)} • MO: {formatCurrency(item.labor)}
                  </div>
                </div>

                {/* Stacked bar */}
                <div
                  className="w-full max-w-[48px] rounded-t-lg overflow-hidden flex flex-col justify-end bg-zinc-800/40 border border-zinc-700/50 group-hover:border-orange-500 transition-all"
                  style={{ height: `${heightPercent}%` }}
                >
                  <div
                    className="w-full bg-gradient-to-t from-orange-600 to-amber-500 transition-all"
                    style={{ height: `${partsPercent}%` }}
                    title={`Peças: ${formatCurrency(item.parts)}`}
                  />
                  <div
                    className="w-full bg-emerald-600/80 transition-all"
                    style={{ height: `${laborPercent}%` }}
                    title={`Mão de obra: ${formatCurrency(item.labor)}`}
                  />
                </div>

                <span className="text-xs font-semibold text-zinc-400 mt-2 group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-gradient-to-tr from-orange-600 to-amber-500" />
            <span>Peças do Estoque</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-emerald-600" />
            <span>Serviços / Mão de Obra</span>
          </div>
        </div>
      </div>
    </div>
  );
}
