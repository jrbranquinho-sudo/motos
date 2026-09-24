"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  Bike,
  ArrowLeft,
  Plus,
  Gauge,
  Calendar,
  Wrench,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatCurrency, formatDate, formatPlate, STATUS_MAP } from "@/lib/utils";

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    getVehicleById,
    customers,
    serviceOrders,
    getVehicleMaintenanceHistory,
    canViewFinancials,
    isMechanic,
    currentUser,
  } = useMotoShop();

  const isSaasOwner = currentUser.role === "SUPER_ADMIN";

  if (isSaasOwner) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
          <Bike className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acesso Restrito ao Gestor da Plataforma</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Os dados detalhados e histórico de manutenção de veículos são restritos à equipe técnica e atendimento de cada oficina.
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

  const vehicle = getVehicleById(id);

  if (!vehicle) {
    return (
      <div className="py-16 text-center text-white">
        <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold">Veículo não encontrado</h2>
        <Link href="/vehicles" className="text-orange-400 underline mt-2 inline-block">
          Voltar para Veículos
        </Link>
      </div>
    );
  }

  const customer = customers.find((c) => c.id === vehicle.customerId);
  const orders = serviceOrders.filter((o) => o.vehicleId === vehicle.id);
  const maintenanceHistory = getVehicleMaintenanceHistory(vehicle.id);

  // Check next maintenance prediction
  const lastOrderWithNextKm = [...orders]
    .filter((o) => o.kmNextService)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const nextKm = lastOrderWithNextKm?.kmNextService || vehicle.currentKm + 3000;
  const kmRemaining = nextKm - vehicle.currentKm;
  const isOverdue = kmRemaining <= 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/vehicles"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {vehicle.brand} {vehicle.model}
              </h1>
              <span className="font-mono text-base font-black px-2.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40">
                {formatPlate(vehicle.plate)}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Ano {vehicle.year} • Cor {vehicle.color || "Padrão"}
            </p>
          </div>
        </div>

        {!isMechanic && (
          <Link
            href={`/orders/new?vehicleId=${vehicle.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Abrir Nova OS para este Veículo</span>
          </Link>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mileage */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Gauge className="w-4 h-4 text-orange-400" />
            <span>Quilometragem Atual</span>
          </span>
          <div className="text-2xl font-black text-white font-mono">
            {vehicle.currentKm.toLocaleString("pt-BR")} KM
          </div>
          <p className="text-xs text-zinc-500 mt-1">Atualizado automaticamente na última OS</p>
        </div>

        {/* Maintenance Alert */}
        <div
          className={`p-5 rounded-2xl border ${
            isOverdue
              ? "bg-red-500/10 border-red-500/30"
              : "bg-zinc-900/80 border-zinc-800"
          }`}
        >
          <span
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1 ${
              isOverdue ? "text-red-400" : "text-zinc-400"
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${isOverdue ? "text-red-400 animate-bounce" : "text-orange-400"}`} />
            <span>Próxima Revisão Prevista</span>
          </span>
          <div className="text-2xl font-black text-white font-mono">
            {nextKm.toLocaleString("pt-BR")} KM
          </div>
          <p
            className={`text-xs mt-1 font-semibold ${
              isOverdue ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {isOverdue
              ? `Atenção: Revisão vencida há ${Math.abs(kmRemaining)} KM!`
              : `Restam ${kmRemaining.toLocaleString("pt-BR")} KM para a próxima manutenção`}
          </p>
        </div>

        {/* Owner */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <UserCheck className="w-4 h-4 text-orange-400" />
            <span>Proprietário</span>
          </span>
          <div className="text-base font-bold text-white">
            {customer?.name || "Não informado"}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            {customer?.phone || "-"} {customer?.document && `• CPF: ${customer.document}`}
          </p>
        </div>
      </div>

      {/* Visual Maintenance Timeline */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-lg text-white">
              Linha do Tempo de Manutenções
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-semibold">
            {orders.length} serviços realizados nesta oficina
          </span>
        </div>

        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-800">
          {orders.map((order) => {
            const statusInfo = STATUS_MAP[order.status];

            return (
              <div key={order.id} className="relative group">
                {/* Timeline dot */}
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-orange-500 border-4 border-zinc-950 ring-2 ring-orange-500/30 group-hover:scale-125 transition-transform" />

                <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-orange-400 text-sm">
                        OS #{order.osNumber}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1 font-mono font-semibold text-zinc-200">
                        <Gauge className="w-3.5 h-3.5 text-zinc-500" />
                        {order.kmAtService.toLocaleString("pt-BR")} KM
                      </span>
                      <span>•</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300">
                    <strong>Reclamação/Serviço:</strong> {order.complaint}
                  </p>

                  {order.diagnosis && (
                    <p className="text-xs text-zinc-400 italic">
                      <strong>Diagnóstico:</strong> {order.diagnosis}
                    </p>
                  )}

                  {/* Parts used in this service */}
                  {order.items.length > 0 && (
                    <div className="pt-2 border-t border-zinc-900 flex flex-wrap gap-1.5">
                      {order.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400"
                        >
                          {item.quantity}x {item.description}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs">
                    {canViewFinancials ? (
                      <span className="font-bold text-white">
                        Total: {formatCurrency(order.totalAmount)}
                      </span>
                    ) : (
                      <span className="text-zinc-500 font-medium">
                        Valores restritos à recepção
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/orders/${order.id}/print`}
                        target="_blank"
                        className="text-zinc-400 hover:text-white flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Imprimir</span>
                      </Link>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
                      >
                        <span>Abrir OS</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Seed Maintenance records before MotoShop OS */}
          {maintenanceHistory.map((rec) => (
            <div key={rec.id} className="relative group">
              <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-zinc-700 border-4 border-zinc-950" />
              <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60 text-xs space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="font-semibold text-zinc-300">{rec.description}</span>
                  <span className="font-mono">{rec.km.toLocaleString("pt-BR")} KM</span>
                </div>
                <div className="flex justify-between text-zinc-500 text-[11px]">
                  <span>Data: {formatDate(rec.date)}</span>
                  {canViewFinancials && (
                    <span className="font-semibold text-zinc-400">{formatCurrency(rec.cost)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && maintenanceHistory.length === 0 && (
            <div className="py-8 text-center text-xs text-zinc-500">
              Nenhuma manutenção registrada para este veículo ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
