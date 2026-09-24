"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Bike,
  Car,
  Truck,
  Anchor,
  Wrench,
  Search,
  Plus,
  History,
  UserCheck,
  Calendar,
  Gauge,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatPlate } from "@/lib/utils";
import {
  getBrandsByWorkshopType,
  getModelsByBrand,
  VehicleCategory,
  WorkshopType,
} from "@/lib/vehicleCatalog";

function VehiclesListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlate = searchParams.get("plate") || "";

  const { tenant, vehicles, customers, serviceOrders, currentUser, isMechanic, addVehicle, addCustomer } = useMotoShop();
  const [searchTerm, setSearchTerm] = useState(initialPlate);
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Map tenant workshopType to VehicleCategory default
  const getDefaultCategory = (type?: WorkshopType): VehicleCategory => {
    const norm = String(type || "").toUpperCase();
    if (norm === "CARROS" || norm === "CARRO") return "CARRO";
    if (norm === "CAMINHOES" || norm === "CAMINHAO") return "CAMINHAO";
    if (norm === "NAUTICA") return "NAUTICA";
    return "MOTO";
  };

  const getVehicleIcon = (type?: string) => {
    const norm = String(type || "").toUpperCase();
    if (norm === "CARROS" || norm === "CARRO") return Car;
    if (norm === "CAMINHOES" || norm === "CAMINHAO") return Truck;
    if (norm === "NAUTICA") return Anchor;
    return Bike;
  };

  const getVehicleLabel = (type?: string) => {
    const norm = String(type || "").toUpperCase();
    if (norm === "CARROS" || norm === "CARRO") return "Carros";
    if (norm === "CAMINHOES" || norm === "CAMINHAO") return "Caminhões";
    if (norm === "NAUTICA") return "Embarcações";
    if (norm === "MOTOS" || norm === "MOTO") return "Motos";
    return "Veículos";
  };

  const VehicleIcon = getVehicleIcon(tenant.workshopType);
  const vehicleLabel = getVehicleLabel(tenant.workshopType);

  // New vehicle form state with dynamic catalog
  const [newCategory, setNewCategory] = useState<VehicleCategory>(() =>
    getDefaultCategory(tenant.workshopType)
  );

  useEffect(() => {
    setNewCategory(getDefaultCategory(tenant.workshopType));
  }, [tenant.workshopType]);

  const [newPlate, setNewPlate] = useState("");
  const availableBrands = getBrandsByWorkshopType(newCategory);
  const [newBrand, setNewBrand] = useState(availableBrands[0] || "HONDA");
  const [newModel, setNewModel] = useState("");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelText, setCustomModelText] = useState("");
  const [newYear, setNewYear] = useState(2023);
  const [newKm, setNewKm] = useState(15000);
  const [newColor, setNewColor] = useState("Preto");
  const [newChassis, setNewChassis] = useState("");
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");

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

  const tenantVehicles = vehicles.filter((v) => v.tenantId === tenant.id);

  const filteredVehicles = tenantVehicles.filter((v) => {
    const customer = customers.find((c) => c.id === v.customerId);
    const cleanSearch = searchTerm.toUpperCase().replace(/[^A-Z0-9]/g, "");

    const matchesSearch =
      !searchTerm ||
      v.plate.toUpperCase().replace(/[^A-Z0-9]/g, "").includes(cleanSearch) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBrand = brandFilter === "ALL" || v.brand.toUpperCase() === brandFilter.toUpperCase();

    return matchesSearch && matchesBrand;
  });

  const isSaasOwner = currentUser.role === "SUPER_ADMIN";

  if (isSaasOwner) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400">
          <VehicleIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Painel do Administrador Geral</h2>
        <p className="text-slate-400 text-xs mb-6 leading-relaxed">
          Como administrador geral da plataforma, você gerencia as oficinas contratantes no Painel SaaS.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-lg shadow-blue-600/20"
        >
          Voltar ao Painel da Plataforma
        </Link>
      </div>
    );
  }

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newCustName) return;

    let cust = customers.find(
      (c) =>
        c.tenantId === tenant.id &&
        c.name.toLowerCase() === newCustName.trim().toLowerCase()
    );

    if (!cust) {
      cust = addCustomer({
        name: newCustName.trim(),
        phone: newCustPhone.trim() || "(11) 99999-9999",
      });
    }

    const finalModel = isCustomModel ? customModelText.trim() : newModel;

    addVehicle({
      plate: newPlate.toUpperCase().trim(),
      brand: newBrand,
      model: finalModel || "Modelo Padrão",
      year: newYear,
      currentKm: newKm,
      color: newColor,
      chassis: newChassis || undefined,
      customerId: cust.id,
    });

    setIsModalOpen(false);
    setNewPlate("");
    setCustomModelText("");
    setNewCustName("");
    setNewCustPhone("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <VehicleIcon className="w-6 h-6 text-blue-500" />
            <span>Gestão de {vehicleLabel}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {isMechanic
              ? `Consulte o histórico de manutenção e dados técnicos dos veículos atendidos`
              : `Catálogo e histórico de manutenções — Segmento: ${tenant.workshopType || "MOTOS"}`}
          </p>
        </div>

        {!isMechanic && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Cadastrar {vehicleLabel.replace(/s$/, "")}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#0d111a] border border-slate-800">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por placa, modelo ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 hidden sm:block" />
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Todas as Marcas ({tenantVehicles.length})</option>
            {Array.from(new Set(tenantVehicles.map((v) => v.brand.toUpperCase())))
              .sort()
              .map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Vehicles Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => {
          const customer = customers.find((c) => c.id === vehicle.customerId);
          const orders = serviceOrders.filter((o) => o.vehicleId === vehicle.id);

          return (
            <div
              key={vehicle.id}
              onClick={() => router.push(`/vehicles/${vehicle.id}`)}
              className="p-4 rounded-xl bg-[#0d111a] border border-slate-800 hover:border-blue-500/50 shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-sm font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    {formatPlate(vehicle.plate)}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {vehicle.brand}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-0.5">
                  {vehicle.model}
                </h3>
                <p className="text-[11px] text-slate-400 mb-3">
                  Ano: {vehicle.year} • Cor: {vehicle.color || "Padrão"}
                </p>

                {/* Mileage and customer */}
                <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <Gauge className="w-3 h-3 text-slate-400" />
                      KM:
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      {vehicle.currentKm.toLocaleString("pt-BR")} KM
                    </span>
                  </div>

                  {customer && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-blue-400" />
                        Cliente:
                      </span>
                      <span className="font-medium text-slate-300 truncate max-w-[150px]">
                        {customer.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[11px]">
                    <span className="text-slate-500">Histórico:</span>
                    <span className="text-blue-400 font-semibold">{orders.length} OS realizadas</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div
                className={`grid ${isMechanic ? "grid-cols-1" : "grid-cols-2"} gap-2 mt-3 pt-2.5 border-t border-slate-800/80`}
                onClick={(e) => e.stopPropagation()}
              >
                {!isMechanic && (
                  <Link
                    href={`/orders/new?vehicleId=${vehicle.id}`}
                    className="py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nova OS</span>
                  </Link>
                )}

                <Link
                  href={`/vehicles/${vehicle.id}`}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Histórico</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="p-12 text-center text-slate-500 bg-[#0d111a] rounded-xl border border-dashed border-slate-800 text-xs">
          Nenhum veículo encontrado com os filtros selecionados.
        </div>
      )}

      {/* Modal Cadastro de Veículo com Segmentação Automática */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f1422] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <VehicleIcon className="w-5 h-5 text-blue-400" />
              <span>Cadastrar Novo Veículo</span>
            </h3>

            <form onSubmit={handleCreateVehicle} className="space-y-3">
              {/* Segmentos de Veículos: Motos, Carros, Caminhões, Náutica */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Segmento do Veículo
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNewCategory("MOTO")}
                    className={`py-1 px-2 rounded-lg text-xs font-bold transition-all ${
                      newCategory === "MOTO"
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    🏍️ Motos
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory("CARRO")}
                    className={`py-1 px-2 rounded-lg text-xs font-bold transition-all ${
                      newCategory === "CARRO"
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    🚗 Carros
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory("CAMINHAO")}
                    className={`py-1 px-2 rounded-lg text-xs font-bold transition-all ${
                      newCategory === "CAMINHAO"
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    🚛 Caminhões
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory("NAUTICA")}
                    className={`py-1 px-2 rounded-lg text-xs font-bold transition-all ${
                      newCategory === "NAUTICA"
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    🚤 Náutica
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Placa / Identificação *
                </label>
                <input
                  type="text"
                  placeholder="Ex: BRA2E19 ou OTC-4B56"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2 text-xs text-white font-mono uppercase focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Marca ({availableBrands.length})
                  </label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-blue-500 outline-none"
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
                    <label className="text-[11px] font-bold text-slate-400">
                      Modelo ({availableModels.length}) *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomModel(!isCustomModel);
                        if (!isCustomModel) setCustomModelText("");
                      }}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      {isCustomModel ? "← Selecionar lista" : "+ Digitar outro"}
                    </button>
                  </div>

                  {isCustomModel ? (
                    <input
                      type="text"
                      placeholder="Digite o modelo"
                      value={customModelText}
                      onChange={(e) => setCustomModelText(e.target.value)}
                      className="w-full bg-[#090d16] border border-blue-500/50 rounded-lg p-2 text-xs text-white focus:border-blue-500 outline-none"
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
                      className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-blue-500 outline-none"
                      required
                    >
                      {availableModels.length === 0 && (
                        <option value="">Nenhum modelo encontrado</option>
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
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Ano</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">KM Atual</label>
                  <input
                    type="number"
                    value={newKm}
                    onChange={(e) => setNewKm(Number(e.target.value))}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Nome do Proprietário *
                </label>
                <input
                  type="text"
                  placeholder="Nome do cliente"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">WhatsApp</label>
                <input
                  type="text"
                  placeholder="(67) 99222-0002"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30"
                >
                  Salvar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 text-xs">Carregando catálogo de veículos...</div>}>
      <VehiclesListContent />
    </Suspense>
  );
}
