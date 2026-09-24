"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  Bike,
  Plus,
  Trash2,
  Package,
  Wrench,
  CheckCircle2,
  Printer,
  ArrowLeft,
  AlertCircle,
  Search,
  UserCheck,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { ChecklistItem, ItemType, OSItem } from "@/lib/types";
import { formatCurrency, formatPlate } from "@/lib/utils";
import { getBrandsByWorkshopType, getModelsByBrand, VehicleCategory } from "@/lib/vehicleCatalog";

function NewOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedVehicleId = searchParams.get("vehicleId") || "";

  const {
    tenant,
    vehicles,
    customers,
    users,
    parts,
    services,
    currentUser,
    isMechanic,
    addServiceOrder,
    addVehicle,
    addCustomer,
  } = useMotoShop();

  const [selectedVehicleId, setSelectedVehicleId] = useState(preSelectedVehicleId);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [isNewVehicleModal, setIsNewVehicleModal] = useState(false);

  // Form Fields
  const [selectedMechanicId, setSelectedMechanicId] = useState(
    users.find((u) => u.tenantId === tenant.id && u.role === "MECHANIC")?.id || users[0]?.id || ""
  );
  const [kmAtService, setKmAtService] = useState<number>(0);
  const [kmNextService, setKmNextService] = useState<number>(0);
  const [complaint, setComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  // Checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "c1", label: "Nível de combustível conferido", checked: true },
    { id: "c2", label: "Avarias/riscos na lataria ou carenagem inspecionados", checked: true },
    { id: "c3", label: "Espelhos e iluminação íntegros", checked: true },
    { id: "c4", label: "Bateria e sistema elétrico testados", checked: true },
  ]);

  // Items
  const [items, setItems] = useState<
    Omit<OSItem, "id" | "serviceOrderId">[]
  >([]);

  // Item builder states
  const [itemType, setItemType] = useState<ItemType>("PART");
  const [selectedPartId, setSelectedPartId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);
  const [itemDiscount, setItemDiscount] = useState(0);

  // New vehicle inline form states with dynamic catalog
  const getDefaultCat = (): VehicleCategory => {
    const norm = String(tenant.workshopType || "").toUpperCase();
    if (norm === "CARROS" || norm === "CARRO") return "CARRO";
    if (norm === "CAMINHOES" || norm === "CAMINHAO") return "CAMINHAO";
    if (norm === "NAUTICA") return "NAUTICA";
    return "MOTO";
  };

  const [newCategory, setNewCategory] = useState<VehicleCategory>(getDefaultCat);
  const [newPlate, setNewPlate] = useState("");
  const availableBrands = getBrandsByWorkshopType(newCategory);
  const [newBrand, setNewBrand] = useState(availableBrands[0] || "HONDA");
  const [newModel, setNewModel] = useState("");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelText, setCustomModelText] = useState("");
  const [newYear, setNewYear] = useState(2023);
  const [newKm, setNewKm] = useState(15000);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const availableModels = getModelsByBrand(newBrand, newCategory);

  useEffect(() => {
    if (availableBrands.length > 0 && !availableBrands.includes(newBrand)) {
      setNewBrand(availableBrands[0]);
    }
  }, [newCategory, availableBrands]);

  useEffect(() => {
    if (availableModels.length > 0) {
      setNewModel(availableModels[0]);
      setIsCustomModel(false);
    } else {
      setNewModel("__CUSTOM__");
      setIsCustomModel(true);
    }
  }, [newBrand, availableModels]);

  // Update KM when vehicle changes
  useEffect(() => {
    if (selectedVehicleId) {
      const v = vehicles.find((item) => item.id === selectedVehicleId);
      if (v) {
        setKmAtService(v.currentKm || 0);
        setKmNextService((v.currentKm || 0) + 3000); // Sugestão padrão de revisão/óleo (+3.000 km)
      }
    }
  }, [selectedVehicleId, vehicles]);

  if (isMechanic) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acesso Restrito ao Mecânico</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Mecânicos não abrem novas Ordens de Serviço. As ordens são abertas e triadas pela Recepção ou Gerência e encaminhadas para a sua bancada.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors shadow-lg shadow-orange-500/20"
        >
          Ir para Minhas OS na Bancada
        </Link>
      </div>
    );
  }

  // When part selected, fill price
  const handlePartSelect = (partId: string) => {
    setSelectedPartId(partId);
    const p = parts.find((item) => item.id === partId);
    if (p) {
      setCustomDescription(p.name);
      setItemPrice(p.salePrice);
    }
  };

  const addItem = () => {
    if (!customDescription.trim()) return;

    const unitPrice = Number(itemPrice) || 0;
    const qty = Number(itemQty) || 1;
    const discount = Number(itemDiscount) || 0;
    const total = Math.max(0, unitPrice * qty - discount);

    setItems((prev) => [
      ...prev,
      {
        type: itemType,
        partId: itemType === "PART" ? selectedPartId || undefined : undefined,
        description: customDescription,
        quantity: qty,
        unitPrice,
        discount,
        total,
      },
    ]);

    // Reset item builder
    setSelectedPartId("");
    setCustomDescription("");
    setItemQty(1);
    setItemPrice(0);
    setItemDiscount(0);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Totals calculations
  const totalParts = items
    .filter((i) => i.type === "PART")
    .reduce((sum, i) => sum + i.total, 0);

  const totalLabor = items
    .filter((i) => i.type === "LABOR")
    .reduce((sum, i) => sum + i.total, 0);

  const totalDiscount = items.reduce((sum, i) => sum + i.discount, 0);
  const totalAmount = totalParts + totalLabor;

  const handleCreateNewVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const finalModel = isCustomModel ? customModelText.trim() : newModel.trim();
    if (!newPlate || !finalModel || !newCustomerName) {
      alert("Preencha placa, modelo e nome do cliente.");
      return;
    }

    const createdCust = addCustomer({
      name: newCustomerName,
      phone: newCustomerPhone || "(11) 99999-9999",
    });

    const createdVeh = addVehicle({
      plate: newPlate.toUpperCase().trim(),
      brand: newBrand,
      model: finalModel,
      year: Number(newYear) || 2023,
      currentKm: Number(newKm) || 0,
      customerId: createdCust.id,
    });

    setSelectedVehicleId(createdVeh.id);
    setIsNewVehicleModal(false);
  };

  const handleSave = (andPrint: boolean = false) => {
    if (!selectedVehicleId) {
      alert("Selecione um veículo para a Ordem de Serviço.");
      return;
    }
    if (!complaint.trim()) {
      alert("Descreva a queixa/reclamação do cliente.");
      return;
    }

    const newOS = addServiceOrder({
      status: "OPEN",
      vehicleId: selectedVehicleId,
      mechanicId: selectedMechanicId,
      kmAtService: Number(kmAtService) || 0,
      kmNextService: Number(kmNextService) || undefined,
      complaint,
      diagnosis,
      notes,
      checklist,
      items: items.map((it, idx) => ({
        ...it,
        id: `item-${Date.now()}-${idx}`,
        serviceOrderId: "",
      })),
      totalParts,
      totalLabor,
      totalDiscount,
      totalAmount,
      estimatedMinutes: 60,
      spentMinutes: 0,
      isTimerRunning: false,
    });

    if (andPrint) {
      router.push(`/orders/${newOS.id}/print`);
    } else {
      router.push(`/orders/${newOS.id}`);
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedCustomer = selectedVehicle
    ? customers.find((c) => c.id === selectedVehicle.customerId)
    : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-orange-500" />
              <span>Abertura de Nova OS</span>
            </h1>
            <p className="text-xs text-zinc-400">
              Preencha os dados do veículo, queixa do cliente e adicione peças do estoque
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Vehicle & Mechanic info */}
        <div className="space-y-6">
          {/* Vehicle Selector Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-blue-400" />
                <span>Veículo do Cliente / Placa</span>
              </label>
              <button
                type="button"
                onClick={() => setIsNewVehicleModal(true)}
                className="text-xs text-blue-400 hover:underline font-semibold"
              >
                + Cadastrar Veículo
              </button>
            </div>

            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="">Selecione o veículo do cliente pela placa...</option>
              {vehicles
                .filter((v) => v.tenantId === tenant.id)
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {formatPlate(v.plate)} — {v.brand} {v.model} ({v.currentKm} KM)
                  </option>
                ))}
            </select>

            {/* Selected Vehicle Preview */}
            {selectedVehicle && (
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs space-y-1.5 animate-in fade-in-50">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-white text-sm">
                    {selectedVehicle.brand} {selectedVehicle.model}
                  </span>
                  <span className="font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">
                    {formatPlate(selectedVehicle.plate)}
                  </span>
                </div>
                <div className="text-zinc-400">
                  Ano {selectedVehicle.year} • Cor {selectedVehicle.color || "Padrão"}
                </div>
                {selectedCustomer && (
                  <div className="pt-2 border-t border-zinc-800/80 text-zinc-300">
                    <span className="text-zinc-500">Cliente: </span>
                    <span className="font-medium">{selectedCustomer.name}</span>
                    <span className="text-zinc-500"> ({selectedCustomer.phone})</span>
                  </div>
                )}
              </div>
            )}

            {/* KM Input */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  KM Entrada:
                </label>
                <input
                  type="number"
                  value={kmAtService}
                  onChange={(e) => setKmAtService(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Próxima Revisão:
                </label>
                <input
                  type="number"
                  value={kmNextService}
                  onChange={(e) => setKmNextService(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Mechanic selector */}
            <div className="pt-2">
              <label className="text-xs text-zinc-400 font-semibold block mb-1">
                Mecânico Responsável:
              </label>
              <select
                value={selectedMechanicId}
                onChange={(e) => setSelectedMechanicId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
              >
                {users
                  .filter((u) => u.tenantId === tenant.id && u.role === "MECHANIC")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} (Bancada)
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Checklist Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Checklist de Entrada
            </h3>
            <div className="space-y-2">
              {checklist.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setChecklist((prev) =>
                        prev.map((i) => (i.id === item.id ? { ...i, checked } : i))
                      );
                    }}
                    className="rounded bg-zinc-950 border-zinc-700 text-orange-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Complaints, Items, Totals & Actions */}
        <div className="md:col-span-2 space-y-6">
          {/* Complaints & Technical Diagnosis */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Reclamação do Cliente (Sintomas / Queixa) *
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Barulho na roda traseira ao frear, moto engasgando acima de 5000 RPM..."
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">
                Diagnóstico Técnico Preliminar (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Folga nos rolamentos da roda, necessário substituição e lubrificação da balança..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Add Items Builder Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-400" />
                <span>Peças & Mão de Obra</span>
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setItemType("PART")}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    itemType === "PART"
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Peça do Estoque
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setItemType("LABOR");
                    setSelectedPartId("");
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    itemType === "LABOR"
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Mão de Obra
                </button>
              </div>
            </div>

            {/* If PART: Autocomplete selector */}
            {itemType === "PART" ? (
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">
                  Buscar Peça no Estoque:
                </label>
                <select
                  value={selectedPartId}
                  onChange={(e) => handlePartSelect(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Selecione uma peça...</option>
                  {parts
                    .filter((p) => p.tenantId === tenant.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name} (Disp: {p.stockQty}) — {formatCurrency(p.salePrice)}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">
                    Selecionar do Catálogo de Serviços:
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => {
                      setSelectedServiceId(e.target.value);
                      const s = services.find((srv) => srv.id === e.target.value);
                      if (s) {
                        setCustomDescription(s.name);
                        setItemPrice(s.price);
                      }
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Selecione um serviço ou digite abaixo...</option>
                    {services
                      .filter((s) => s.tenantId === tenant.id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.department}) — {formatCurrency(s.price)} (~{s.estimatedHours}h)
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">
                    Descrição do Serviço:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mão de obra para revisão de freios e sangria..."
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Qty, Unit Price, Discount and Add button */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Qtd:</label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={itemQty}
                  onChange={(e) => setItemQty(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Valor Unit (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Desconto (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  value={itemDiscount}
                  onChange={(e) => setItemDiscount(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={addItem}
                className="w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Items Table */}
            {items.length > 0 ? (
              <div className="overflow-x-auto pt-3 border-t border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-zinc-500 uppercase border-b border-zinc-800">
                      <th className="pb-2">Tipo</th>
                      <th className="pb-2">Descrição</th>
                      <th className="pb-2 text-center">Qtd</th>
                      <th className="pb-2 text-right">Unitário</th>
                      <th className="pb-2 text-right">Total</th>
                      <th className="pb-2 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-zinc-800/30">
                        <td className="py-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              it.type === "PART"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            {it.type === "PART" ? "PEÇA" : "SERVIÇO"}
                          </span>
                        </td>
                        <td className="py-2.5 font-medium text-zinc-200">{it.description}</td>
                        <td className="py-2.5 text-center font-mono text-zinc-300">{it.quantity}</td>
                        <td className="py-2.5 text-right font-mono text-zinc-400">
                          {formatCurrency(it.unitPrice)}
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-white">
                          {formatCurrency(it.total)}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1 rounded text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-zinc-500 bg-zinc-950/40 rounded-xl border border-dashed border-zinc-800">
                Nenhum item adicionado ainda. Adicione peças do estoque ou serviços acima.
              </div>
            )}
          </div>

          {/* Order Summary & Final Actions */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs text-zinc-400">
                Peças: <span className="font-bold text-zinc-200">{formatCurrency(totalParts)}</span> •
                Mão de Obra: <span className="font-bold text-zinc-200">{formatCurrency(totalLabor)}</span>
              </div>
              <div className="text-2xl font-black text-white">
                Total Geral: <span className="text-orange-400">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Salvar e Imprimir</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Gravar OS</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Cadastrar Nova Moto Rápido */}
      {isNewVehicleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bike className="w-5 h-5 text-orange-400" />
              <span>Cadastrar Novo Veículo & Cliente</span>
            </h3>

            <form onSubmit={handleCreateNewVehicle} className="space-y-3">
              {/* Categoria: Motos ou Náutica */}
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Categoria</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCategory("MOTO")}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      newCategory === "MOTO"
                        ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    🏍️ Moto
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory("NAUTICA")}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      newCategory === "NAUTICA"
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    🚤 Náutica / Jet Ski
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Placa / Identificação *</label>
                <input
                  type="text"
                  placeholder="Ex: ABC1D23 ou Registro Embarcação"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono uppercase focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    Marca ({availableBrands.length})
                  </label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:border-orange-500 outline-none"
                  >
                    {availableBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-zinc-400">
                      Modelo ({availableModels.length}) *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomModel(!isCustomModel);
                        if (!isCustomModel) {
                          setCustomModelText("");
                        }
                      }}
                      className="text-[10px] text-orange-400 hover:underline"
                    >
                      {isCustomModel ? "← Selecionar da lista" : "+ Digitar outro"}
                    </button>
                  </div>

                  {isCustomModel ? (
                    <input
                      type="text"
                      placeholder="Digite o modelo do veículo"
                      value={customModelText}
                      onChange={(e) => setCustomModelText(e.target.value)}
                      className="w-full bg-zinc-950 border border-orange-500/50 rounded-lg p-2 text-sm text-zinc-100 focus:border-orange-500 outline-none"
                      required
                    />
                  ) : (
                    <select
                      value={newModel}
                      onChange={(e) => {
                        if (e.target.value === "__CUSTOM__") {
                          setIsCustomModel(true);
                        } else {
                          setNewModel(e.target.value);
                        }
                      }}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 focus:border-orange-500 outline-none"
                      required
                    >
                      {availableModels.length === 0 && (
                        <option value="">Nenhum modelo cadastrado</option>
                      )}
                      {availableModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                      <option value="__CUSTOM__">➕ Outro modelo (digitar manualmente)...</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Ano</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">KM Atual</label>
                  <input
                    type="number"
                    value={newKm}
                    onChange={(e) => setNewKm(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <label className="text-xs text-zinc-400 block mb-1">Nome do Proprietário *</label>
                <input
                  type="text"
                  placeholder="Nome completo do cliente"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewVehicleModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Salvar Veículo & Selecionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-500">Carregando formulário de OS...</div>}>
      <NewOrderForm />
    </Suspense>
  );
}
