"use client";

import React, { useState } from "react";
import Link from "next/link";
import { QuickPlateHero } from "@/components/dashboard/QuickPlateHero";
import { StatCards } from "@/components/dashboard/StatCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { MechanicLeaderboard } from "@/components/dashboard/MechanicLeaderboard";
import { useMotoShop } from "@/lib/store";
import { formatCurrency, formatDateTime, formatPlate, STATUS_MAP } from "@/lib/utils";
import {
  ClipboardList,
  Plus,
  ArrowRight,
  Printer,
  ChevronRight,
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  Wrench,
  DollarSign,
  TrendingUp,
  Package,
  Bike,
  Users,
  AlertTriangle,
  FileText,
  Search,
  Filter,
} from "lucide-react";
import { OSStatus } from "@/lib/types";

export function ShopOwnerDashboard() {
  const {
    tenant,
    serviceOrders,
    vehicles,
    customers,
    users,
    currentUser,
    metrics,
    lowStockParts,
  } = useMotoShop();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const tenantOrders = serviceOrders.filter((o) => o.tenantId === tenant.id);

  // General Workshop Metrics Calculation
  const totalOrders = tenantOrders.length;
  const openCount = tenantOrders.filter((o) => o.status === "OPEN").length;
  const inProgressCount = tenantOrders.filter((o) => o.status === "IN_PROGRESS").length;
  const waitingPartsCount = tenantOrders.filter((o) => o.status === "WAITING_PARTS").length;
  const waitingApprovalCount = tenantOrders.filter((o) => o.status === "WAITING_APPROVAL").length;
  const completedCount = tenantOrders.filter((o) => o.status === "COMPLETED").length;
  const deliveredCount = tenantOrders.filter((o) => o.status === "DELIVERED").length;

  const totalDeliveredRevenue = tenantOrders
    .filter((o) => o.status === "DELIVERED" || o.status === "COMPLETED")
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const totalPartsRevenue = tenantOrders
    .filter((o) => o.status === "DELIVERED" || o.status === "COMPLETED")
    .reduce((acc, o) => acc + o.totalParts, 0);

  const totalLaborRevenue = tenantOrders
    .filter((o) => o.status === "DELIVERED" || o.status === "COMPLETED")
    .reduce((acc, o) => acc + o.totalLabor, 0);

  const averageTicket =
    completedCount + deliveredCount > 0
      ? totalDeliveredRevenue / (completedCount + deliveredCount)
      : 0;

  const filteredOrders = tenantOrders.filter((o) => {
    const vehicle = vehicles.find((v) => v.id === o.vehicleId);
    const customer = vehicle ? customers.find((c) => c.id === vehicle.customerId) : undefined;
    const mechanic = users.find((u) => u.id === o.mechanicId);

    const matchesSearch =
      !searchTerm ||
      o.osNumber.toString().includes(searchTerm) ||
      (vehicle && vehicle.plate.toUpperCase().includes(searchTerm.toUpperCase())) ||
      (vehicle && vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mechanic && mechanic.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Relatório Geral da Oficina
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {currentUser.role === "MANAGER" ? "GERENTE" : "PROPRIETÁRIO"}
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            {tenant.name} • Visão gerencial completa de tudo que se passa na oficina em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/orders/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Abrir Nova OS</span>
          </Link>
        </div>
      </div>

      {/* Quick Plate Search */}
      <QuickPlateHero />

      {/* Primary KPI Cards */}
      <StatCards />

      {/* Workshop Executive Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total de OS</span>
          <span className="text-2xl font-black text-white font-mono">{totalOrders}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
          <span className="text-[10px] uppercase font-bold text-blue-400 block">Abertas / Triagem</span>
          <span className="text-2xl font-black text-blue-300 font-mono">{openCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-400 block">Em Execução</span>
          <span className="text-2xl font-black text-amber-300 font-mono">{inProgressCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
          <span className="text-[10px] uppercase font-bold text-red-400 block">Aguard. Peças</span>
          <span className="text-2xl font-black text-red-300 font-mono">{waitingPartsCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
          <span className="text-[10px] uppercase font-bold text-purple-400 block">Prontas / Bancada</span>
          <span className="text-2xl font-black text-purple-300 font-mono">{completedCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">Entregues / Finalizadas</span>
          <span className="text-2xl font-black text-emerald-300 font-mono">{deliveredCount}</span>
        </div>
      </div>

      {/* Financial Performance Overview */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-lg text-white">
              Balanço Financeiro da Oficina (Peças x Mão de Obra)
            </h3>
          </div>
          <span className="text-xs text-zinc-400">
            Ticket Médio: <strong className="text-emerald-400 font-mono">{formatCurrency(averageTicket)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <span className="text-xs font-bold text-zinc-500 uppercase">Receita de Peças</span>
            <div className="text-xl font-black text-zinc-100 font-mono">
              {formatCurrency(totalPartsRevenue)}
            </div>
            <p className="text-[11px] text-zinc-500">Componentes e autopeças instaladas</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <span className="text-xs font-bold text-zinc-500 uppercase">Receita de Mão de Obra</span>
            <div className="text-xl font-black text-orange-400 font-mono">
              {formatCurrency(totalLaborRevenue)}
            </div>
            <p className="text-[11px] text-zinc-500">Serviços executados pelos mecânicos</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
            <span className="text-xs font-bold text-emerald-400 uppercase">Faturamento Total Gerado</span>
            <div className="text-xl font-black text-emerald-300 font-mono">
              {formatCurrency(totalDeliveredRevenue)}
            </div>
            <p className="text-[11px] text-emerald-400/80">Receita faturada da oficina</p>
          </div>
        </div>
      </div>

      {/* Revenue Charts & Mechanic Productivity */}
      <RevenueChart />
      <MechanicLeaderboard />

      {/* Comprehensive Orders Management Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-base text-white">
              Todas as Ordens de Serviço da Oficina ({filteredOrders.length})
            </h3>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filtrar por placa, cliente, OS ou mecânico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">Todos os Status</option>
              <option value="OPEN">Abertas</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="WAITING_PARTS">Aguardando Peças</option>
              <option value="WAITING_APPROVAL">Aguardando Aprovação</option>
              <option value="COMPLETED">Concluídas</option>
              <option value="DELIVERED">Entregues</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase">
                <th className="pb-3">OS #</th>
                <th className="pb-3">Moto / Placa</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Mecânico</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Valor Total</th>
                <th className="pb-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredOrders.map((order) => {
                const vehicle = vehicles.find((v) => v.id === order.vehicleId);
                const customer = vehicle ? customers.find((c) => c.id === vehicle.customerId) : undefined;
                const mechanic = users.find((u) => u.id === order.mechanicId);
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
                        <span className="text-zinc-500">Veículo N/D</span>
                      )}
                    </td>
                    <td className="py-3 font-medium text-zinc-200">
                      {customer?.name || "Balcão"}
                    </td>
                    <td className="py-3 text-zinc-300">
                      {mechanic?.name ? (
                        <span className="flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-zinc-500" />
                          <span>{mechanic.name}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-500 italic">Não atribuído</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.badgeClass}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-white">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/orders/${order.id}/print`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                          title="Imprimir OS"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/orders/${order.id}`}
                          className="p-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white transition-colors"
                          title="Abrir Detalhes da OS"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
