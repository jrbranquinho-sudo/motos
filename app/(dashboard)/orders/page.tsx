"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Columns,
  List as ListIcon,
  Printer,
  ChevronRight,
  ArrowRight,
  Clock,
  Bike,
  UserCheck,
  CheckCircle,
  Play,
  Send,
  Lock,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { OSStatus } from "@/lib/types";
import { formatCurrency, formatPlate, STATUS_MAP } from "@/lib/utils";

const KANBAN_COLUMNS: { id: OSStatus; title: string; color: string }[] = [
  { id: "OPEN", title: "Aberta", color: "border-blue-500/50 bg-blue-500/5" },
  { id: "IN_PROGRESS", title: "Em Execução", color: "border-amber-500/50 bg-amber-500/5" },
  { id: "WAITING_PARTS", title: "Aguardando Peças", color: "border-purple-500/50 bg-purple-500/5" },
  { id: "WAITING_APPROVAL", title: "Aguardando Aprovação", color: "border-yellow-500/50 bg-yellow-500/5" },
  { id: "COMPLETED", title: "Concluída / Devolvida", color: "border-emerald-500/50 bg-emerald-500/5" },
  { id: "DELIVERED", title: "Entregue (Finalizada)", color: "border-zinc-500/50 bg-zinc-500/5" },
];

export default function OrdersPage() {
  const {
    tenant,
    visibleOrders,
    vehicles,
    customers,
    users,
    currentUser,
    updateOSStatus,
    canViewFinancials,
    canFinalizeOS,
  } = useMotoShop();

  const isMechanic = currentUser.role === "MECHANIC";
  const isSaasOwner = currentUser.role === "SUPER_ADMIN";

  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  if (isSaasOwner) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
          <ClipboardList className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acesso Restrito ao Dono do SaaS</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Como administrador da plataforma SaaS, você gerencia as oficinas clientes contratantes. As ordens de serviço e serviços de bancada são operados internamente por cada oficina.
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

  const filteredOrders = visibleOrders.filter((order) => {
    const vehicle = vehicles.find((v) => v.id === order.vehicleId);
    const customer = vehicle ? customers.find((c) => c.id === vehicle.customerId) : null;

    const matchesSearch =
      order.osNumber.toString().includes(searchTerm) ||
      (vehicle && vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vehicle && vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-7 h-7 text-orange-500" />
            <span>{isMechanic ? "Minhas Ordens de Serviço (Bancada)" : "Ordens de Serviço"}</span>
          </h1>
          <p className="text-sm text-zinc-400">
            {isMechanic
              ? `Visualizando apenas as OS atribuídas a você (${currentUser.name})`
              : "Gerencie o fluxo de reparos e revisões da bancada em tempo real"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === "kanban"
                  ? "bg-orange-500 text-white font-semibold shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Columns className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-orange-500 text-white font-semibold shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ListIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>

          {!isMechanic && (
            <Link
              href="/orders/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nova OS</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por OS #, placa, modelo ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">Todos os Status ({visibleOrders.length})</option>
            {KANBAN_COLUMNS.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title} ({visibleOrders.filter((o) => o.status === col.id).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((column) => {
            const columnOrders = filteredOrders.filter((o) => o.status === column.id);

            return (
              <div
                key={column.id}
                className={`rounded-2xl border ${column.color} bg-zinc-950/60 p-3 flex flex-col min-w-[280px] shadow-lg`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-100">{column.title}</span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {columnOrders.length}
                  </span>
                </div>

                {/* Cards in this column */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px]">
                  {columnOrders.map((order) => {
                    const vehicle = vehicles.find((v) => v.id === order.vehicleId);
                    const customer = vehicle ? customers.find((c) => c.id === vehicle.customerId) : null;
                    const mechanic = users.find((u) => u.id === order.mechanicId);

                    return (
                      <div
                        key={order.id}
                        className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-orange-500/50 shadow-md transition-all group flex flex-col justify-between"
                      >
                        <div>
                          {/* Card top */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono font-bold text-xs text-orange-400">
                              #OS-{order.osNumber}
                            </span>
                            {vehicle && (
                              <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                                {formatPlate(vehicle.plate)}
                              </span>
                            )}
                          </div>

                          {/* Vehicle and Customer */}
                          {vehicle && (
                            <h4 className="font-bold text-sm text-white leading-snug">
                              {vehicle.brand} {vehicle.model}
                            </h4>
                          )}
                          {customer && (
                            <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                              <UserCheck className="w-3 h-3 text-zinc-500" />
                              <span>{customer.name}</span>
                            </p>
                          )}

                          {/* Complaint Snippet */}
                          <p className="text-xs text-zinc-400 line-clamp-2 mt-2 bg-zinc-950/60 p-2 rounded border border-zinc-800/80">
                            {order.complaint}
                          </p>

                          {/* Mechanic & Time */}
                          <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2.5">
                            {!isMechanic ? (
                              <span>Mecânico: {mechanic?.name.split(" ")[0] || "-"}</span>
                            ) : (
                              <span>KM: {order.kmAtService.toLocaleString("pt-BR")}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-zinc-600" />
                              {order.spentMinutes || 0} min
                            </span>
                          </div>
                        </div>

                        {/* Card bottom: Value (if allowed) and Detail actions */}
                        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                          {canViewFinancials ? (
                            <span className="text-xs font-bold text-emerald-400">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          ) : (
                            <span className="text-[11px] text-zinc-500">
                              {order.items.length} item(ns) registrados
                            </span>
                          )}

                          <div className="flex items-center gap-1">
                            {canViewFinancials && (
                              <Link
                                href={`/orders/${order.id}/print`}
                                target="_blank"
                                title="Imprimir OS"
                                className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </Link>
                            )}

                            <Link
                              href={`/orders/${order.id}`}
                              className="px-2 py-1 rounded bg-zinc-800 hover:bg-orange-500 hover:text-white text-zinc-200 text-xs font-medium transition-colors"
                            >
                              {isMechanic ? "Executar" : "Ver"}
                            </Link>
                          </div>
                        </div>

                        {/* Role-specific Next status button */}
                        <div className="mt-2 pt-2 border-t border-zinc-800/40">
                          {/* Mechanic Flow */}
                          {isMechanic ? (
                            column.id === "OPEN" ? (
                              <button
                                onClick={() => updateOSStatus(order.id, "IN_PROGRESS")}
                                className="w-full py-1 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-black text-[11px] text-amber-300 font-bold border border-amber-500/40 transition-colors flex items-center justify-center gap-1"
                              >
                                <Play className="w-3 h-3" />
                                <span>Iniciar Execução</span>
                              </button>
                            ) : column.id === "IN_PROGRESS" ? (
                              <button
                                onClick={() => updateOSStatus(order.id, "COMPLETED")}
                                className="w-full py-1 rounded bg-emerald-500/20 hover:bg-emerald-500 hover:text-black text-[11px] text-emerald-300 font-bold border border-emerald-500/40 transition-colors flex items-center justify-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                <span>Devolver p/ Recepção</span>
                              </button>
                            ) : column.id === "COMPLETED" ? (
                              <div className="text-center text-[10px] text-zinc-500 font-medium py-0.5 flex items-center justify-center gap-1">
                                <Lock className="w-3 h-3 text-zinc-600" />
                                <span>Devolvido à Recepção</span>
                              </div>
                            ) : null
                          ) : (
                            /* Admin & Reception Flow */
                            column.id !== "DELIVERED" && column.id !== "CANCELLED" && (
                              <button
                                onClick={() => {
                                  const currentIndex = KANBAN_COLUMNS.findIndex((c) => c.id === column.id);
                                  if (currentIndex < KANBAN_COLUMNS.length - 1) {
                                    const nextStatus = KANBAN_COLUMNS[currentIndex + 1].id;
                                    updateOSStatus(order.id, nextStatus);
                                  }
                                }}
                                className="w-full text-center py-1 rounded bg-zinc-800/80 hover:bg-orange-500/20 hover:text-orange-400 text-[10px] text-zinc-400 font-semibold border border-zinc-700/60 transition-colors flex items-center justify-center gap-1"
                              >
                                <span>
                                  {column.id === "COMPLETED"
                                    ? "Finalizar & Entregar Moto"
                                    : `Avançar p/ ${KANBAN_COLUMNS[KANBAN_COLUMNS.findIndex((c) => c.id === column.id) + 1]?.title}`}
                                </span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {columnOrders.length === 0 && (
                    <div className="py-8 text-center text-xs text-zinc-600 font-medium">
                      Nenhuma OS neste status
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4">OS #</th>
                <th className="py-3 px-4">Veículo</th>
                <th className="py-3 px-4">Cliente</th>
                {!isMechanic && <th className="py-3 px-4 hidden md:table-cell">Mecânico</th>}
                <th className="py-3 px-4">Status</th>
                {canViewFinancials && <th className="py-3 px-4 text-right">Total</th>}
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredOrders.map((order) => {
                const vehicle = vehicles.find((v) => v.id === order.vehicleId);
                const customer = vehicle ? customers.find((c) => c.id === vehicle.customerId) : null;
                const mechanic = users.find((u) => u.id === order.mechanicId);
                const statusInfo = STATUS_MAP[order.status];

                return (
                  <tr key={order.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                      #OS-{order.osNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      {vehicle ? (
                        <div>
                          <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 mr-2">
                            {formatPlate(vehicle.plate)}
                          </span>
                          <span className="text-white font-medium">{vehicle.model}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">{customer?.name || "-"}</td>
                    {!isMechanic && (
                      <td className="py-3.5 px-4 hidden md:table-cell text-zinc-400 text-xs">
                        {mechanic?.name || "-"}
                      </td>
                    )}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    {canViewFinancials && (
                      <td className="py-3.5 px-4 text-right font-bold text-zinc-100">
                        {formatCurrency(order.totalAmount)}
                      </td>
                    )}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canViewFinancials && (
                          <Link
                            href={`/orders/${order.id}/print`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                            title="Imprimir"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link
                          href={`/orders/${order.id}`}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-orange-500 hover:text-white text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>{isMechanic ? "Executar" : "Abrir"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
