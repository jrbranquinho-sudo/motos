"use client";

import React, { useState } from "react";
import Link from "next/link";
import { QuickPlateHero } from "@/components/dashboard/QuickPlateHero";
import { useMotoShop } from "@/lib/store";
import { formatCurrency, formatDate, formatPlate, getWhatsAppOSLink, STATUS_MAP } from "@/lib/utils";
import {
  ClipboardList,
  Plus,
  ArrowRight,
  Printer,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  MessageCircle,
  Search,
  CheckSquare,
  UserCheck,
  Bike,
  Package,
  History,
  Send,
} from "lucide-react";
import { OSStatus } from "@/lib/types";

type ReceptionTab = "ACTIVE" | "OPEN" | "WAITING_PARTS" | "READY" | "CLOSED";

export function ReceptionDashboard() {
  const {
    tenant,
    serviceOrders,
    vehicles,
    customers,
    users,
    currentUser,
    updateOSStatus,
  } = useMotoShop();

  const [currentTab, setCurrentTab] = useState<ReceptionTab>("ACTIVE");
  const [searchTerm, setSearchTerm] = useState("");

  const tenantOrders = serviceOrders.filter((o) => o.tenantId === tenant.id);

  // Group counts for Reception
  const openOrders = tenantOrders.filter((o) => o.status === "OPEN");
  const waitingPartsOrders = tenantOrders.filter((o) => o.status === "WAITING_PARTS");
  const inProgressOrders = tenantOrders.filter((o) => o.status === "IN_PROGRESS");
  const readyOrders = tenantOrders.filter((o) => o.status === "COMPLETED");
  const closedOrders = tenantOrders.filter(
    (o) => o.status === "DELIVERED" || o.status === "CANCELLED"
  );
  const activeOrders = tenantOrders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
  );

  // Filter based on active tab
  let tabFilteredOrders = activeOrders;
  if (currentTab === "OPEN") tabFilteredOrders = openOrders;
  else if (currentTab === "WAITING_PARTS") tabFilteredOrders = waitingPartsOrders;
  else if (currentTab === "READY") tabFilteredOrders = readyOrders;
  else if (currentTab === "CLOSED") tabFilteredOrders = closedOrders;

  // Search filter
  const displayedOrders = tabFilteredOrders.filter((order) => {
    const vehicle = vehicles.find((v) => v.id === order.vehicleId);
    const customer = vehicle ? customers.find((c) => c.id === vehicle.customerId) : undefined;
    const mechanic = users.find((u) => u.id === order.mechanicId);

    const term = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      order.osNumber.toString().includes(term) ||
      (vehicle && vehicle.plate.toLowerCase().includes(term)) ||
      (vehicle && vehicle.model.toLowerCase().includes(term)) ||
      (customer && customer.name.toLowerCase().includes(term)) ||
      (customer && customer.phone && customer.phone.includes(term)) ||
      (mechanic && mechanic.name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 via-zinc-900 to-zinc-900 border border-blue-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <ClipboardList className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Balcão & Recepção — Atendimento ao Cliente
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              RECEPÇÃO
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            {tenant.name} • Olá, <strong className="text-zinc-200">{currentUser.name}</strong>. Controle de entrada, saída de motos, orçamentos e entrega de OS.
          </p>
        </div>

        <Link
          href="/orders/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nova Ordem de Serviço</span>
        </Link>
      </div>

      {/* Quick Search Vehicle by Plate */}
      <QuickPlateHero />

      {/* Key Status Cards for Reception */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* OS Abertas */}
        <button
          onClick={() => setCurrentTab("OPEN")}
          className={`p-5 rounded-2xl text-left border transition-all ${
            currentTab === "OPEN"
              ? "bg-blue-500/15 border-blue-500 ring-1 ring-blue-500"
              : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              OS Abertas (Fila de Triagem)
            </span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <ClipboardList className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {openOrders.length}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Motos recebidas prontas para bancada
          </p>
        </button>

        {/* Aguardando Peças */}
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
            {waitingPartsOrders.length}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Necessitam de compras ou separação
          </p>
        </button>

        {/* Prontas para Retirada */}
        <button
          onClick={() => setCurrentTab("READY")}
          className={`p-5 rounded-2xl text-left border transition-all ${
            currentTab === "READY"
              ? "bg-purple-500/15 border-purple-500 ring-1 ring-purple-500"
              : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Prontas p/ Retirada (Bancada)
            </span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {readyOrders.length}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Devolvidas pelo mecânico, prontas p/ entregar
          </p>
        </button>

        {/* Consultar Encerradas */}
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
              Consultar OS Encerradas
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <History className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {closedOrders.length}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Histórico completo de ordens entregues
          </p>
        </button>
      </div>

      {/* Interactive Tabs & Search */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setCurrentTab("ACTIVE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                currentTab === "ACTIVE"
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              Todas as Ativas ({activeOrders.length})
            </button>
            <button
              onClick={() => setCurrentTab("OPEN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                currentTab === "OPEN"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              OS Abertas ({openOrders.length})
            </button>
            <button
              onClick={() => setCurrentTab("WAITING_PARTS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                currentTab === "WAITING_PARTS"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              Aguardando Peças ({waitingPartsOrders.length})
            </button>
            <button
              onClick={() => setCurrentTab("READY")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                currentTab === "READY"
                  ? "bg-purple-600 text-white"
                  : "bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              Prontas p/ Retirada ({readyOrders.length})
            </button>
            <button
              onClick={() => setCurrentTab("CLOSED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                currentTab === "CLOSED"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              Consultar Encerradas ({closedOrders.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[260px]">
            <input
              type="text"
              placeholder="Buscar por placa, cliente, telefone ou OS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Service Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase">
                <th className="pb-3">OS #</th>
                <th className="pb-3">Moto / Placa</th>
                <th className="pb-3">Cliente & Contato</th>
                <th className="pb-3">Mecânico</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Total a Cobrar</th>
                <th className="pb-3 text-right">Ações da Recepção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {displayedOrders.map((order) => {
                const vehicle = vehicles.find((v) => v.id === order.vehicleId);
                const customer = vehicle ? customers.find((c) => c.id === vehicle.customerId) : undefined;
                const mechanic = users.find((u) => u.id === order.mechanicId);
                const statusInfo = STATUS_MAP[order.status];

                const whatsAppLink = customer?.phone
                  ? getWhatsAppOSLink(
                      customer.phone,
                      customer.name,
                      order.osNumber,
                      vehicle?.model || "Moto",
                      vehicle?.plate || "",
                      order.status,
                      order.totalAmount
                    )
                  : "";

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
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-zinc-200">{customer?.name || "Balcão"}</p>
                        <p className="text-xs text-zinc-400">{customer?.phone || "-"}</p>
                      </div>
                    </td>
                    <td className="py-3 text-zinc-300">
                      {mechanic?.name || <span className="text-zinc-500 italic">Não atribuído</span>}
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
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Action: Finalize and Deliver if Completed */}
                        {order.status === "COMPLETED" && (
                          <button
                            onClick={() => {
                              if (confirm(`Confirmar entrega da OS #${order.osNumber} para o cliente?`)) {
                                updateOSStatus(order.id, "DELIVERED");
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                            title="Entregar moto ao cliente e finalizar OS"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Entregar</span>
                          </button>
                        )}

                        {/* WhatsApp Button */}
                        {whatsAppLink && (
                          <a
                            href={whatsAppLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-colors"
                            title="Avisar cliente no WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Print Button */}
                        <Link
                          href={`/orders/${order.id}/print`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                          title="Imprimir OS"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Link>

                        {/* Open Details */}
                        <Link
                          href={`/orders/${order.id}`}
                          className="p-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white transition-colors"
                          title="Abrir detalhes"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {displayedOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                    Nenhuma Ordem de Serviço encontrada para esta categoria ou busca.
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
