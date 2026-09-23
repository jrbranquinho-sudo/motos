"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Bike,
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
import { getBrandsByCategory, getModelsByBrand, VehicleCategory } from "@/lib/vehicleCatalog";

function VehiclesListContent() {
  const searchParams = useSearchParams();
  const initialPlate = searchParams.get("plate") || "";

  const { tenant, vehicles, customers, serviceOrders, currentUser, isMechanic, addVehicle, addCustomer } = useMotoShop();
  const [searchTerm, setSearchTerm] = useState(initialPlate);
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New vehicle form state with dynamic catalog
  const [newCategory, setNewCategory] = useState<VehicleCategory>("MOTO");
  const [newPlate, setNewPlate] = useState("");
  const [newBrand, setNewBrand] = useState("HONDA");
  const [newModel, setNewModel] = useState("");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelText, setCustomModelText] = useState("");
  const [newYear, setNewYear] = useState(2023);
  const [newKm, setNewKm] = useState(12000);
  const [newColor, setNewColor] = useState("Preta");
  const [newChassis, setNewChassis] = useState("");
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");

  // Update brand/models when category or brand changes
  const availableBrands = getBrandsByCategory(newCategory);
  const availableModels = getModelsByBrand(newBrand);

  useEffect(() => {
    if (availableBrands.length > 0 && !availableBrands.includes(newBrand)) {
      setNewBrand(availableBrands[0]);
    }
  }, [newCategory]);

  useEffect(() => {
    if (availableModels.length > 0) {
      setNewModel(availableModels[0]);
      setIsCustomModel(false);
    } else {
      setNewModel("__CUSTOM__");
      setIsCustomModel(true);
    }
  }, [newBrand]);

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
        <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
          <Bike className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acesso Restrito ao Dono do SaaS</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Como administrador da plataforma SaaS, você gerencia as oficinas clientes contratantes. O cadastro e consulta de veículos e placas é de uso exclusivo da operação de cada oficina mecânica.
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

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMechanic || isSaasOwner) {
      alert("Ação não permitida para o seu perfil.");
      return;
    }
    const finalModel = isCustomModel ? customModelText.trim() : newModel.trim();
    if (!newPlate || !finalModel || !newCustName) {
      alert("Preencha todos os campos obrigatórios (Placa, Modelo e Cliente).");
      return;
    }

    const createdCust = addCustomer({
      name: newCustName,
      phone: newCustPhone || "(11) 98765-4321",
    });

    addVehicle({
      plate: newPlate.toUpperCase().trim(),
      brand: newBrand,
      model: finalModel,
      year: Number(newYear) || 2023,
      color: newColor,
      chassis: newChassis || undefined,
      currentKm: Number(newKm) || 0,
      customerId: createdCust.id,
    });

    setIsModalOpen(false);
    setSearchTerm(newPlate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bike className="w-7 h-7 text-orange-500" />
            <span>Gestão de Veículos por Placa</span>
          </h1>
          <p className="text-sm text-zinc-400">
            {isMechanic
              ? "Consulte o histórico de manutenção, quilometragem e dados técnicos das motos atendidas"
              : "Consulte o histórico, quilometragem e proprietários das motos atendidas"}
          </p>
        </div>

        {!isMechanic && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Cadastrar Moto</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por placa (ex: BRA2E19), modelo ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500 hidden sm:block" />
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-orange-500"
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
          const lastOrder = [...orders].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

          return (
            <div
              key={vehicle.id}
              className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/40 shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-base font-black px-2.5 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30">
                    {formatPlate(vehicle.plate)}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {vehicle.brand}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">
                  {vehicle.model}
                </h3>
                <p className="text-xs text-zinc-400 mb-3">
                  Ano: {vehicle.year} • Cor: {vehicle.color || "Padrão"}
                </p>

                {/* Mileage and customer */}
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-zinc-400" />
                      KM Registrado:
                    </span>
                    <span className="font-mono font-bold text-zinc-200">
                      {vehicle.currentKm.toLocaleString("pt-BR")} KM
                    </span>
                  </div>

                  {customer && (
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                      <span className="text-zinc-500 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                        Cliente:
                      </span>
                      <span className="font-medium text-zinc-300 truncate max-w-[150px]">
                        {customer.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-900 text-[11px]">
                    <span className="text-zinc-500">Histórico de OS:</span>
                    <span className="text-orange-400 font-semibold">{orders.length} serviços</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className={`grid ${isMechanic ? "grid-cols-1" : "grid-cols-2"} gap-2 mt-4 pt-3 border-t border-zinc-800/80`}>
                {!isMechanic && (
                  <Link
                    href={`/orders/new?vehicleId=${vehicle.id}`}
                    className="py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nova OS</span>
                  </Link>
                )}

                <Link
                  href={`/vehicles/${vehicle.id}`}
                  className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{isMechanic ? "Consultar Histórico e Ficha" : "Histórico"}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="p-12 text-center text-zinc-500 bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800">
          Nenhuma moto encontrada com os filtros selecionados.
        </div>
      )}

      {/* Modal Cadastro de Moto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bike className="w-5 h-5 text-orange-400" />
              <span>Cadastrar Novo Veículo</span>
            </h3>

            <form onSubmit={handleCreateVehicle} className="space-y-3">
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
                  placeholder="Ex: BRA2E19 ou Registro Embarcação"
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
                  placeholder="Nome do cliente"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                >
                  Salvar Moto
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
    <Suspense fallback={<div className="p-8 text-zinc-500">Carregando catálogo de motos...</div>}>
      <VehiclesListContent />
    </Suspense>
  );
}
