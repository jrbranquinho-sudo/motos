"use client";

import React, { useState } from "react";
import Link from "next/link";
import { QuickPlateHero } from "@/components/dashboard/QuickPlateHero";
import { useMotoShop } from "@/lib/store";
import { formatPlate, STATUS_MAP } from "@/lib/utils";
import {
  Wrench,
  Clock,
  Play,
  Pause,
  Package,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Search,
  Send,
  History,
  Gauge,
} from "lucide-react";

type MechanicTab = "ALL" | "OPEN" | "WAITING_PARTS" | "CLOSED";

export function MechanicDashboard() {
  const {
    tenant,
    visibleOrders,
    vehicles,
    customers,
    currentUser,
    lowStockParts,
    updateOSStatus,
    toggleTimer,
  } = useMotoShop();

  const [currentTab, setCurrentTab] = useState<MechanicTab>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Only orders assigned to this mechanic (visibleOrders is already filtered by mechanicId === currentUser.id)
  const myOrders = visibleOrders;

  const myOpenOrders = myOrders.filter(
    (o) => o.status === "OPEN" || o.status === "IN_PROGRESS"
  );
  const myWaitingPartsOrders = myOrders.filter(
    (o) => o.status === "WAITING_PARTS" || o.status === "WAITING_APPROVAL"
  );
  const myClosedOrders = myOrders.filter(
    (o) => o.status === "COMPLETED" || o.status === "DELIVERED"
  );

  let tabFiltered = myOrders;
  if (currentTab === "OPEN") tabFiltered = myOpenOrders;
  else if (currentTab === "WAITING_PARTS") tabFiltered = myWaitingPartsOrders;
  else if (currentTab === "CLOSED") tabFiltered = myClosedOrders;

  const displayedOrders = tabFiltered.filter((order) => {
    const vehicle = vehicles.find((v) => v.id === order.vehicleId);
    const customer = vehicle ? customers.find((c) => c.id === vehicle.customerId) : undefined;
    const term = searchTerm.toLowerCase();

    return (
      !searchTerm ||
      order.osNumber.toString().includes(term) ||
      (vehicle && vehicle.plate.toLowerCase().includes(term)) ||
      (vehicle && vehicle.model.toLowerCase().includes(term)) ||
      (customer && customer.name.toLowerCase().includes(term)) ||
      (order.complaint && order.complaint.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-zinc-900 to-zinc-900 border border-emerald-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <Wrench className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bancada de Trabalho — Mecânico
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              MECÂNICO
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            {tenant.name} • Olá, <strong className="text-zinc-200">{currentUser.name}</strong>. Exibindo apenas as Ordens de Serviço direcionadas à sua bancada.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Fila Operacional Pessoal</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            {myOpenOrders.length} serviços pendentes de execução
          </p>
        </div>
      </div>

      {/* Quick Search Vehicle by Plate */}
      <QuickPlateHero />

      {/* Primary KPI Cards for Mechanic's Assigned Orders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Minhas OS Abertas */}
        <button
          onClick={() => setCurrentTab("OPEN")}
          className={`p-5 rounded-2xl text-left border transition-all ${
            currentTab === "OPEN"
              ? "bg-amber-500/15 border-amber-500 ring-1 ring-amber-500"
              : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Minhas OS Abertas / Em Fila
            </span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {myOpenOrders.length}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Direcionadas para sua execução
          </p>
        </button>

        {/* Minhas OS Aguardando Peças */}
        <button
          onClick={() => setCurrentTab("WAITING_PARTS")}
          className={`p-5 rounded-2xl text-left border transition-all ${
            currentTab === "WAITING_PARTS"
              ? "bg-red-500/15 border-red-500 ring-1 ring-red-500"
              : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              Aguardando Peças
            </span>
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {myWaitingPartsOrders.length}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Paradas na sua bancada por falta de peça
          </p>
        </button>

        {/* Minhas OS Encerradas */}
        <button
          onClick={() => setCurrentTab("CLOSED")}
          className={`p-5 rounded-2xl text-left border transition-all ${
            currentTab === "CLOSED"
              ? "bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500"
              : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Minhas OS Encerradas
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <History className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {myClosedOrders.length}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Serviços executados por você
          </p>
        </button>

        {/* Peças Críticas no Estoque */}
        <Link
          href="/stock"
          className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-left transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Estoque em Alerta
            </span>
            <span className="p-1.5 rounded-lg bg-zinc-800 text-orange-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-orange-400 font-mono">
            {lowStockParts.length} itens
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Peças com estoque abaixo do mínimo
          </p>
        </Link>
      </div>

      {/* Operational Instructions Banner */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 text-xs text-zinc-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Fluxo da Bancada:</strong> Abra a OS atribuída a você, acione o cronômetro, registre os serviços e peças utilizados e clique em <strong>Devolver para a Recepção</strong> para que a recepção finalize e cobre o cliente.
          </span>
        </div>
      </div>

      {/* Table Section with Tabs */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setCurrentTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                currentTab === "ALL"
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              Todas as Minhas OS ({myOrders.length})
            </button>
            <button
              onClick={() => setCurrentTab("OPEN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                currentTab === "OPEN"
                  ? "bg-amber-600 text-white"
                  : "bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              Abertas / Em Execução ({myOpenOrders.length})
            </button>
            <button
              onClick={() => setCurrentTab("WAITING_PARTS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                currentTab === "WAITING_PARTS"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              Aguardando Peças ({myWaitingPartsOrders.length})
            </button>
            <button
              onClick={() => setCurrentTab("CLOSED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                currentTab === "CLOSED"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              Minhas Encerradas ({myClosedOrders.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[260px]">
            <input
              type="text"
              placeholder="Buscar por placa, modelo ou queixa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Table of Mechanic Orders (No Prices) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase">
                <th className="pb-3">OS #</th>
                <th className="pb-3">Moto / Placa</th>
                <th className="pb-3">Reclamação / Sintoma</th>
                <th className="pb-3 text-center">Cronômetro</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Ações da Bancada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {displayedOrders.map((order) => {
                const vehicle = vehicles.find((v) => v.id === order.vehicleId);
                const statusInfo = STATUS_MAP[order.status];

                return (
                  <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 font-mono font-bold text-orange-400">
                      #{order.osNumber}
                    </td>
                    <td className="py-3">
                      {vehicle ? (
                        <div>
                          <p className="font-semibold text-white">{vehicle.model}</p>
                          <span className="font-mono text-xs text-orange-400">
                            {formatPlate(vehicle.plate)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-500">N/D</span>
                      )}
                    </td>
                    <td className="py-3 max-w-xs truncate text-zinc-300">
                      {order.complaint || "Revisão geral"}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => toggleTimer(order.id)}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                          order.isTimerRunning
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse"
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        }`}
                        title={order.isTimerRunning ? "Pausar cronômetro" : "Iniciar cronômetro"}
                      >
                        {order.isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        <span>{order.spentMinutes || 0} min</span>
                      </button>
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.badgeClass}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Rapid Actions */}
                        {order.status === "OPEN" && (
                          <button
                            onClick={() => {
                              updateOSStatus(order.id, "IN_PROGRESS");
                              if (!order.isTimerRunning) toggleTimer(order.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1 transition-all"
                            title="Iniciar serviço na bancada"
                          >
                            <Play className="w-3 h-3 fill-black" />
                            <span>Iniciar</span>
                          </button>
                        )}

                        {order.status === "IN_PROGRESS" && (
                          <button
                            onClick={() => {
                              updateOSStatus(order.id, "COMPLETED");
                              if (order.isTimerRunning) toggleTimer(order.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-all"
                            title="Concluir serviço e devolver para recepção"
                          >
                            <Send className="w-3 h-3" />
                            <span>Devolver</span>
                          </button>
                        )}

                        {/* Open Details to register parts and services */}
                        <Link
                          href={`/orders/${order.id}`}
                          className="px-3 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1"
                        >
                          <span>Bancada</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {displayedOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                    Nenhuma Ordem de Serviço encontrada na sua bancada para esta categoria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
