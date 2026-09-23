"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Award,
  DollarSign,
  Clock,
  Package,
  Wrench,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const { tenant, serviceOrders, parts, users, currentUser, isMechanic } = useMotoShop();

  const isSaasOwner = currentUser.role === "SUPER_ADMIN";

  if (isSaasOwner) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acesso Restrito ao Dono do SaaS</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Como administrador da plataforma SaaS, as métricas e telemetria das oficinas contratantes estão consolidadas no seu Painel SaaS Master.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors shadow-lg shadow-orange-500/20"
        >
          Voltar para o Painel SaaS Master
        </Link>
      </div>
    );
  }

  if (isMechanic) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acesso Restrito a Relatórios</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Mecânicos não possuem permissão para visualizar relatórios financeiros e de lucratividade da oficina.
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

  const tenantOrders = serviceOrders.filter((o) => o.tenantId === tenant.id);
  const completedOrders = tenantOrders.filter(
    (o) => o.status === "COMPLETED" || o.status === "DELIVERED"
  );

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalLabor = completedOrders.reduce((sum, o) => sum + o.totalLabor, 0);
  const totalParts = completedOrders.reduce((sum, o) => sum + o.totalParts, 0);

  const mechanics = users.filter((u) => u.tenantId === tenant.id && u.role === "MECHANIC");

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-orange-500" />
          <span>Relatórios de Produtividade & Lucratividade</span>
        </h1>
        <p className="text-sm text-zinc-400">
          Análise financeira detalhada da oficina, ticket médio e desempenho dos mecânicos
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg">
          <span className="text-xs font-semibold text-zinc-400 uppercase">Receita Realizada</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            +18% em relação ao mês anterior
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg">
          <span className="text-xs font-semibold text-zinc-400 uppercase">Ticket Médio por OS</span>
          <div className="text-2xl sm:text-3xl font-black text-orange-400 mt-1">
            {completedOrders.length > 0
              ? formatCurrency(totalRevenue / completedOrders.length)
              : formatCurrency(0)}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Média de peças + mão de obra
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg">
          <span className="text-xs font-semibold text-zinc-400 uppercase">Faturamento Mão de Obra</span>
          <div className="text-2xl sm:text-3xl font-black text-zinc-200 mt-1">
            {formatCurrency(totalLabor)}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {(totalRevenue > 0 ? (totalLabor / totalRevenue) * 100 : 0).toFixed(0)}% da receita total
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg">
          <span className="text-xs font-semibold text-zinc-400 uppercase">Venda de Autopeças</span>
          <div className="text-2xl sm:text-3xl font-black text-zinc-200 mt-1">
            {formatCurrency(totalParts)}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {(totalRevenue > 0 ? (totalParts / totalRevenue) * 100 : 0).toFixed(0)}% da receita total
          </p>
        </div>
      </div>

      {/* Mechanics Performance Table */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-lg text-white">
            Desempenho Individual por Mecânico
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-xs font-bold text-zinc-400 uppercase">
                <th className="py-3 px-4">Mecânico</th>
                <th className="py-3 px-4 text-center">OS Totais</th>
                <th className="py-3 px-4 text-center">OS Concluídas</th>
                <th className="py-3 px-4 text-center">Tempo Médio</th>
                <th className="py-3 px-4 text-right">Mão de Obra Gerada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {mechanics.map((m) => {
                const orders = tenantOrders.filter((o) => o.mechanicId === m.id);
                const comp = orders.filter(
                  (o) => o.status === "COMPLETED" || o.status === "DELIVERED"
                );
                const laborSum = comp.reduce((s, o) => s + o.totalLabor, 0);
                const avgMinutes =
                  comp.length > 0
                    ? Math.round(
                        comp.reduce(
                          (s, o) => s + (o.spentMinutes || o.estimatedMinutes || 60),
                          0
                        ) / comp.length
                      )
                    : 0;

                return (
                  <tr key={m.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{m.name}</p>
                          <p className="text-xs text-zinc-500">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-zinc-300">
                      {orders.length}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                      {comp.length}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-zinc-400">
                      {avgMinutes} min
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {formatCurrency(laborSum)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parts Sales Breakdown */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-400" />
          <h3 className="font-bold text-lg text-white">
            Rentabilidade e Margens do Estoque
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parts
            .filter((p) => p.tenantId === tenant.id)
            .slice(0, 6)
            .map((part) => {
              const profitPerUnit = part.salePrice - part.costPrice;
              const marginPercent = Math.round((profitPerUnit / part.costPrice) * 100);

              return (
                <div
                  key={part.id}
                  className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono text-[10px] bg-zinc-800 text-orange-400 px-1.5 py-0.2 rounded font-bold mr-1.5">
                      {part.code}
                    </span>
                    <span className="font-bold text-white">{part.name}</span>
                    <p className="text-zinc-500 mt-1">
                      Custo: {formatCurrency(part.costPrice)} • Venda: {formatCurrency(part.salePrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold font-mono text-sm block">
                      +{formatCurrency(profitPerUnit)}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Margem: {marginPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
