"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Printer,
  ArrowLeft,
  Clock,
  Play,
  Pause,
  MessageCircle,
  Share2,
  Bike,
  Car,
  Truck,
  Ship,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  CheckSquare,
  Wrench,
  Package,
  Send,
  Lock,
  Plus,
  X,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { ItemType, OSItem, OSStatus } from "@/lib/types";
import { formatCurrency, formatDateTime, formatPlate, getWhatsAppOSLink, STATUS_MAP } from "@/lib/utils";
import { getVehicleTypeLabel } from "@/lib/vehicleCatalog";

const STATUS_STEPS: OSStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_PARTS",
  "WAITING_APPROVAL",
  "COMPLETED",
  "DELIVERED",
];

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const {
    getServiceOrderById,
    updateOSStatus,
    updateServiceOrder,
    adjustStock,
    toggleTimer,
    tenant,
    currentUser,
    canViewFinancials,
    parts,
  } = useMotoShop();

  const isMechanic = currentUser.role === "MECHANIC";
  const order = getServiceOrderById(id);

  // Bench Item Registration modal
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<ItemType>("LABOR");
  const [newSelectedPartId, setNewSelectedPartId] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [newUnitPrice, setNewUnitPrice] = useState(0);

  if (!order || (isMechanic && order.mechanicId !== currentUser.id)) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">
          {!order ? "Ordem de Serviço não encontrada" : "Acesso Restrito ao Mecânico"}
        </h2>
        <p className="text-zinc-500 text-sm">
          {!order
            ? "A OS solicitada pode ter sido removida ou não pertence a esta oficina."
            : "Cada mecânico tem acesso apenas às Ordens de Serviço atribuídas diretamente a ele."}
        </p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Minhas OS</span>
        </Link>
      </div>
    );
  }

  const currentStatusInfo = STATUS_MAP[order.status];
  const vehicle = order.vehicle;
  const customer = vehicle?.customer;
  const mechanic = order.mechanic;

  const vehicleTerm = getVehicleTypeLabel(vehicle?.category || tenant.workshopType);
  const VehicleIcon =
    vehicle?.category === "CARRO" || tenant.workshopType === "CARROS"
      ? Car
      : vehicle?.category === "CAMINHAO" || tenant.workshopType === "CAMINHOES"
      ? Truck
      : vehicle?.category === "NAUTICA" || tenant.workshopType === "NAUTICA"
      ? Ship
      : Bike;

  const whatsAppLink = customer?.phone
    ? getWhatsAppOSLink(
        customer.phone,
        customer.name,
        order.osNumber,
        vehicle?.model || vehicleTerm.singular,
        vehicle?.plate || "",
        order.status,
        order.totalAmount
      )
    : "";

  const handleStepClick = (stepStatus: OSStatus) => {
    if (isMechanic && stepStatus === "DELIVERED") {
      alert("Apenas a Recepção ou Gerência pode finalizar e entregar a OS.");
      return;
    }
    updateOSStatus(order.id, stepStatus);
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    const unitPrice = canViewFinancials
      ? Number(newUnitPrice) || 0
      : newItemType === "PART"
      ? parts.find((p) => p.id === newSelectedPartId)?.salePrice || 0
      : 0;

    const qty = Math.max(1, Number(newQuantity) || 1);
    const itemTotal = unitPrice * qty;

    const newItem: OSItem = {
      id: `item-${Date.now()}`,
      serviceOrderId: order.id,
      type: newItemType,
      partId: newItemType === "PART" ? newSelectedPartId || undefined : undefined,
      description: newDescription.trim(),
      quantity: qty,
      unitPrice,
      discount: 0,
      total: itemTotal,
    };

    if (newItemType === "PART" && newSelectedPartId) {
      adjustStock(newSelectedPartId, -qty, `Utilizado na bancada OS #${order.osNumber}`, order.id);
    }

    const updatedItems = [...order.items, newItem];
    const totalParts = updatedItems
      .filter((i) => i.type === "PART")
      .reduce((acc, i) => acc + i.total, 0);
    const totalLabor = updatedItems
      .filter((i) => i.type === "LABOR")
      .reduce((acc, i) => acc + i.total, 0);
    const totalAmount = totalParts + totalLabor;

    updateServiceOrder(order.id, {
      items: updatedItems,
      totalParts,
      totalLabor,
      totalAmount,
    });

    setIsAddItemModalOpen(false);
    setNewDescription("");
    setNewQuantity(1);
    setNewUnitPrice(0);
    setNewSelectedPartId("");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Navigation & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                OS #{order.osNumber}
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${currentStatusInfo.badgeClass}`}
              >
                {currentStatusInfo.label}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Aberta em {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mechanic quick workflow actions */}
          {isMechanic && order.status === "OPEN" && (
            <button
              onClick={() => {
                updateOSStatus(order.id, "IN_PROGRESS");
                if (!order.isTimerRunning) toggleTimer(order.id);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Iniciar Serviço na Bancada</span>
            </button>
          )}

          {isMechanic && order.status === "IN_PROGRESS" && (
            <button
              onClick={() => {
                updateOSStatus(order.id, "COMPLETED");
                if (order.isTimerRunning) toggleTimer(order.id);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Concluir & Devolver p/ Recepção</span>
            </button>
          )}

          {/* WhatsApp Button (Only for Reception / Admin) */}
          {canViewFinancials && whatsAppLink && (
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-950/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Avisar no WhatsApp</span>
            </a>
          )}

          {/* Print Button (Only for Reception / Admin) */}
          {canViewFinancials && (
            <Link
              href={`/orders/${order.id}/print`}
              target="_blank"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir OS</span>
            </Link>
          )}
        </div>
      </div>

      {/* Role Notice for Mechanic */}
      {isMechanic && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Visão do Mecânico:</strong> Registre as peças e serviços executados na bancada. Valores monetários são restritos à Recepção e Gerência.
            </span>
          </div>
          {order.status === "COMPLETED" && (
            <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[11px]">
              Devolvida para Recepção
            </span>
          )}
        </div>
      )}

      {/* Status Workflow Progress Stepper */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between min-w-[620px] gap-2">
          {STATUS_STEPS.map((stepStatus, idx) => {
            const isCurrent = order.status === stepStatus;
            const isPast =
              STATUS_STEPS.indexOf(order.status) > STATUS_STEPS.indexOf(stepStatus);
            const isBlockedForMechanic = isMechanic && stepStatus === "DELIVERED";

            return (
              <button
                key={stepStatus}
                onClick={() => handleStepClick(stepStatus)}
                disabled={isBlockedForMechanic}
                className={`flex-1 flex flex-col items-center p-2 rounded-xl transition-all ${
                  isCurrent
                    ? "bg-orange-500/20 border border-orange-500/40 text-orange-400"
                    : isPast
                    ? "text-zinc-400 hover:bg-zinc-800/60"
                    : isBlockedForMechanic
                    ? "opacity-40 cursor-not-allowed text-zinc-600"
                    : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/40"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                    isCurrent
                      ? "bg-orange-500 text-white"
                      : isPast
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {isPast ? "✓" : idx + 1}
                </div>
                <span className="text-[11px] font-semibold text-center leading-tight">
                  {stepStatus === "COMPLETED" && isMechanic
                    ? "Devolvida p/ Recepção"
                    : STATUS_MAP[stepStatus].label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bench Timer & Motorcycle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stopwatch Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>Cronômetro da Bancada</span>
            </span>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {order.spentMinutes || 0} min gastos
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Estimativa: {order.estimatedMinutes || 60} min
            </p>
          </div>

          <button
            onClick={() => toggleTimer(order.id)}
            className={`p-3 rounded-xl flex items-center justify-center text-white shadow-lg transition-all ${
              order.isTimerRunning
                ? "bg-amber-500 hover:bg-amber-600 animate-pulse"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
            title={order.isTimerRunning ? "Pausar Cronômetro" : "Iniciar Cronômetro"}
          >
            {order.isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>

        {/* Vehicle Info */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <VehicleIcon className="w-4 h-4 text-blue-400" />
            <span>{vehicleTerm.clientVehicle}</span>
          </span>
          {vehicle ? (
            <div className="mt-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">
                  {vehicle.brand} {vehicle.model}
                </span>
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-zinc-800 text-blue-400 border border-zinc-700">
                  {formatPlate(vehicle.plate)}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {vehicle.category === "NAUTICA" ? "Horímetro:" : "KM Entrada:"} {order.kmAtService.toLocaleString("pt-BR")} • Próx:{" "}
                {order.kmNextService ? `${order.kmNextService.toLocaleString("pt-BR")} ${vehicle.category === "NAUTICA" ? "Horas" : "KM"}` : "Não definido"}
              </p>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 mt-1">Dados do veículo indisponíveis</p>
          )}
        </div>

        {/* Customer & Mechanic info */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-orange-400" />
            <span>Cliente & Mecânico</span>
          </span>
          <div className="mt-1 text-xs space-y-1">
            <p className="text-zinc-200">
              <strong className="text-white">{customer?.name || "Cliente Balcão"}</strong>{" "}
              {customer?.phone && <span className="text-zinc-400">({customer.phone})</span>}
            </p>
            <p className="text-zinc-400">
              Mecânico Responsável:{" "}
              <span className="text-orange-400 font-semibold">{mechanic?.name || "Não atribuído"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Complaints and Technical Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Reclamação do Cliente (Sintomas)
          </h3>
          <p className="text-sm text-zinc-200 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            {order.complaint || "Nenhuma queixa relatada."}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Diagnóstico do Mecânico
          </h3>
          <p className="text-sm text-zinc-200 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            {order.diagnosis || "Diagnóstico pendente ou em andamento."}
          </p>
        </div>
      </div>

      {/* Checklist */}
      {order.checklist && order.checklist.length > 0 && (
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-blue-400" />
            <span>Checklist de Vistoria {vehicleTerm.ofVehicle}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {order.checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs"
              >
                <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </span>
                <span className="text-zinc-300">{item.label}</span>
                {item.notes && <span className="text-zinc-500 italic ml-auto">({item.notes})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Breakdown Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-400" />
            <span>Peças Utilizadas & Mão de Obra Executada</span>
          </h3>
          <button
            type="button"
            onClick={() => {
              if (isMechanic) setNewItemType("LABOR");
              setIsAddItemModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isMechanic ? "Registrar Mão de Obra na Bancada" : "Adicionar Item / Serviço"}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase">
                <th className="pb-3">Tipo</th>
                <th className="pb-3">Descrição do Item / Serviço</th>
                <th className="pb-3 text-center">Quantidade</th>
                {canViewFinancials && <th className="pb-3 text-right">Unitário</th>}
                {canViewFinancials && <th className="pb-3 text-right">Desconto</th>}
                {canViewFinancials && <th className="pb-3 text-right">Total</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {order.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/30">
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.type === "PART"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {item.type === "PART" ? "PEÇA" : "SERVIÇO"}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-zinc-100">{item.description}</td>
                  <td className="py-3 text-center font-mono text-zinc-300">{item.quantity}</td>
                  {canViewFinancials && (
                    <td className="py-3 text-right font-mono text-zinc-400">
                      {formatCurrency(item.unitPrice)}
                    </td>
                  )}
                  {canViewFinancials && (
                    <td className="py-3 text-right font-mono text-zinc-500">
                      {item.discount > 0 ? `-${formatCurrency(item.discount)}` : "-"}
                    </td>
                  )}
                  {canViewFinancials && (
                    <td className="py-3 text-right font-mono font-bold text-white">
                      {formatCurrency(item.total)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Totals (Only for Reception / Admin) */}
        {canViewFinancials ? (
          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-400 space-y-1 text-center sm:text-left">
              <div>
                Subtotal Peças: <span className="font-bold text-zinc-200">{formatCurrency(order.totalParts)}</span>
              </div>
              <div>
                Subtotal Mão de Obra:{" "}
                <span className="font-bold text-zinc-200">{formatCurrency(order.totalLabor)}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-zinc-400 font-semibold uppercase block">Valor Total da OS</span>
              <span className="text-3xl font-black text-orange-400">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>{order.items.length} itens registrados na bancada</span>
            <span>Valores monetários restritos à Recepção e Gerência</span>
          </div>
        )}
      </div>

      {/* Modal Registrar Serviço Executado / Peça */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-400" />
                <span>{isMechanic ? "Registrar Execução na Bancada" : "Adicionar Item à OS"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="space-y-3">
              {isMechanic ? (
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300">
                  <div className="font-bold flex items-center gap-1.5 mb-0.5">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Registro de Mão de Obra Realizada</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Registre os serviços e reparos executados em {vehicleTerm.thisVehicle}. O apontamento de peças e precificação são restritos à recepção.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Tipo de Registro</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewItemType("LABOR");
                        setNewSelectedPartId("");
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        newItemType === "LABOR"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      🛠️ Serviço Executado
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewItemType("PART");
                        setNewDescription("");
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        newItemType === "PART"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      📦 Peça Utilizada
                    </button>
                  </div>
                </div>
              )}

              {!isMechanic && newItemType === "PART" ? (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Selecione a Peça do Estoque</label>
                  <select
                    value={newSelectedPartId}
                    onChange={(e) => {
                      setNewSelectedPartId(e.target.value);
                      const p = parts.find((pt) => pt.id === e.target.value);
                      if (p) {
                        setNewDescription(p.name);
                        setNewUnitPrice(p.salePrice);
                      }
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:border-orange-500 outline-none"
                    required
                  >
                    <option value="">Selecione uma peça...</option>
                    {parts.map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.name} ({part.stockQty} un disponíveis)
                        {canViewFinancials ? ` - ${formatCurrency(part.salePrice)}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    {isMechanic ? "Descrição da Mão de Obra / Serviço Executado *" : "Tipo de Serviço Executado *"}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Regulagem de válvulas, troca de óleo, troca de pastilhas..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono focus:border-orange-500 outline-none"
                  required
                />
              </div>

              {/* Only for Reception / Admin */}
              {canViewFinancials && (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Valor Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newUnitPrice}
                    onChange={(e) => setNewUnitPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono focus:border-orange-500 outline-none"
                    required
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                >
                  Salvar na OS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
