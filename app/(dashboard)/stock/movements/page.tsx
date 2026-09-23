"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRightLeft, ArrowLeft, ArrowUpRight, ArrowDownLeft, Sliders, Calendar, Package } from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";

export default function StockMovementsPage() {
  const { stockMovements, parts, tenant, currentUser, isMechanic } = useMotoShop();
  const [filterType, setFilterType] = useState<string>("ALL");

  const isSaasOwner = currentUser.role === "SUPER_ADMIN";

  if (isSaasOwner) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
          <ArrowRightLeft className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acesso Restrito ao Gestor da Plataforma</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          A trilha de movimentação e auditoria de peças é restrita à gestão interna de cada oficina mecânica.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors shadow-lg shadow-orange-500/20"
        >
          Voltar para o Painel Geral
        </Link>
      </div>
    );
  }

  if (isMechanic) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
          <ArrowRightLeft className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acesso Restrito às Movimentações</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Mecânicos não possuem permissão para visualizar a trilha de movimentações e auditoria de estoque.
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

  const tenantMovements = stockMovements.filter((m) => m.tenantId === tenant.id);

  const filtered = tenantMovements.filter((m) => {
    if (filterType === "ALL") return true;
    return m.type === filterType;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/stock"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <ArrowRightLeft className="w-6 h-6 text-orange-500" />
              <span>Movimentações de Estoque</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Trilha de auditoria: entradas, saídas por OS e ajustes manuais
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterType === "ALL" ? "bg-orange-500 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterType("IN")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterType === "IN" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Entradas
          </button>
          <button
            onClick={() => setFilterType("OUT")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterType === "OUT" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Saídas (OS)
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/60 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <th className="py-3 px-4">Data / Hora</th>
              <th className="py-3 px-4">Tipo</th>
              <th className="py-3 px-4">Peça</th>
              <th className="py-3 px-4 text-center">Qtd</th>
              <th className="py-3 px-4">Motivo / Vínculo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-xs sm:text-sm">
            {filtered.map((mov) => {
              const part = parts.find((p) => p.id === mov.partId);

              return (
                <tr key={mov.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 text-zinc-400 text-xs whitespace-nowrap">
                    {formatDateTime(mov.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    {mov.type === "IN" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <ArrowDownLeft className="w-3 h-3" />
                        ENTRADA
                      </span>
                    )}
                    {mov.type === "OUT" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        <ArrowUpRight className="w-3 h-3" />
                        SAÍDA
                      </span>
                    )}
                    {mov.type === "ADJUSTMENT" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        <Sliders className="w-3 h-3" />
                        AJUSTE
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-zinc-200">
                    {mov.partName || part?.name || "Peça do catálogo"}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-white">
                    {mov.type === "IN" ? `+${mov.qty}` : mov.type === "OUT" ? `-${mov.qty}` : mov.qty}
                  </td>
                  <td className="py-3 px-4 text-zinc-400 text-xs">
                    {mov.reason || "Operação padrão no sistema"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-zinc-500 text-xs">
            Nenhuma movimentação registrada no período.
          </div>
        )}
      </div>
    </div>
  );
}
