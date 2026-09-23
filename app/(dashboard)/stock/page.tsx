"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  Boxes,
  MapPin,
  Edit2,
  CheckCircle,
  X,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { Part } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function StockPage() {
  const { tenant, parts, lowStockParts, addPart, updatePart, adjustStock, currentUser, isMechanic } = useMotoShop();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // New Part Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("Lubrificantes");
  const [newUnit, setNewUnit] = useState<"UN" | "PÇ" | "BD" | "KT">("UN");
  const [newCostPrice, setNewCostPrice] = useState(25);
  const [newSalePrice, setNewSalePrice] = useState(45);
  const [newStockQty, setNewStockQty] = useState(10);
  const [newMinStock, setNewMinStock] = useState(5);
  const [newLocation, setNewLocation] = useState("Prateleira A1");

  // Adjust Stock Modal
  const [adjustingPart, setAdjustingPart] = useState<Part | null>(null);
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustType, setAdjustType] = useState<"ADD" | "SUB">("ADD");
  const [adjustReason, setAdjustReason] = useState("Entrada de mercadoria (NF)");

  // Close modals with ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAddModalOpen(false);
        setAdjustingPart(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const tenantParts = parts.filter((p) => p.tenantId === tenant.id);

  // Categories list
  const categories = Array.from(new Set(tenantParts.map((p) => p.category)));

  const filteredParts = tenantParts.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
    const matchesLowStock = !onlyLowStock || p.stockQty <= p.minStock;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const totalStockValue = tenantParts.reduce((acc, p) => acc + p.costPrice * p.stockQty, 0);
  const totalSaleValue = tenantParts.reduce((acc, p) => acc + p.salePrice * p.stockQty, 0);

  const isSaasOwner = currentUser.role === "SUPER_ADMIN";

  if (isSaasOwner) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acesso Restrito ao Dono do SaaS</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          O estoque físico e o catálogo de peças são de controle interno e exclusivo de cada oficina cliente.
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

  if (isMechanic) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acesso Restrito ao Estoque</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Mecânicos não possuem permissão para visualizar o estoque ou cadastrar peças e insumos. O gerenciamento de peças é restrito à recepção e gerência.
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

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) {
      alert("Preencha o código e o nome da peça.");
      return;
    }

    addPart({
      code: newCode.toUpperCase(),
      name: newName,
      brand: newBrand || undefined,
      category: newCategory,
      unit: newUnit,
      costPrice: Number(newCostPrice) || 0,
      salePrice: Number(newSalePrice) || 0,
      stockQty: Number(newStockQty) || 0,
      minStock: Number(newMinStock) || 1,
      location: newLocation || undefined,
    });

    setIsAddModalOpen(false);
    // Reset form
    setNewCode("");
    setNewName("");
    setNewBrand("");
    setNewUnit("UN");
  };

  const handleExecuteAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingPart) return;

    const delta = adjustType === "ADD" ? Number(adjustQty) : -Number(adjustQty);
    adjustStock(adjustingPart.id, delta, adjustReason);

    setAdjustingPart(null);
    setAdjustQty(1);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-orange-500" />
            <span>Controle de Estoque & Peças</span>
          </h1>
          <p className="text-sm text-zinc-400">
            Inventário de autopeças com baixa automática na Ordem de Serviço
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/stock/movements"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold text-xs sm:text-sm transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Histórico de Movimentações</span>
          </Link>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Cadastrar Peça</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Total de Itens</span>
            <div className="text-2xl font-black text-white mt-0.5">{tenantParts.length} peças</div>
          </div>
          <Boxes className="w-8 h-8 text-orange-400 opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Valor em Custo</span>
            <div className="text-2xl font-black text-zinc-200 mt-0.5">
              {formatCurrency(totalStockValue)}
            </div>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-400 opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Potencial de Venda</span>
            <div className="text-2xl font-black text-orange-400 mt-0.5">
              {formatCurrency(totalSaleValue)}
            </div>
          </div>
          <TrendingUp className="w-8 h-8 text-orange-400 opacity-80" />
        </div>
      </div>

      {/* Low stock banner alert if any */}
      {lowStockParts.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3 text-red-300 text-xs sm:text-sm animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>
              <strong>Atenção:</strong> {lowStockParts.length} peça(s) atingiram ou estão abaixo do estoque mínimo de segurança!
            </span>
          </div>
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs border border-red-500/40 shrink-0"
          >
            {onlyLowStock ? "Ver Todas as Peças" : "Filtrar Apenas Estoque Baixo"}
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por código (ex: LUB-001), nome ou marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Parts Table */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 min-w-[240px]">Código / Peça</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Categoria</th>
                <th className="py-3.5 px-4 hidden md:table-cell whitespace-nowrap">Localização</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Preço Venda</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Estoque</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredParts.map((part) => {
                const isLow = part.stockQty <= part.minStock;

                return (
                  <tr
                    key={part.id}
                    className={`hover:bg-zinc-800/40 transition-colors ${
                      isLow ? "bg-red-500/5" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold bg-zinc-800 text-orange-400 px-2 py-0.5 rounded border border-zinc-700 whitespace-nowrap">
                          {part.code}
                        </span>
                        <div>
                          <p className="font-bold text-zinc-100">{part.name}</p>
                          {part.brand && (
                            <p className="text-xs text-zinc-500">Marca: {part.brand}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-300 whitespace-nowrap">{part.category}</td>
                    <td className="py-3.5 px-4 hidden md:table-cell text-xs text-zinc-400 whitespace-nowrap">
                      {part.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          {part.location}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-100 whitespace-nowrap">
                      {formatCurrency(part.salePrice)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`font-mono text-xs font-bold px-3 py-1 rounded-full border whitespace-nowrap inline-flex items-center gap-1 ${
                          isLow
                            ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                            : "bg-zinc-800 text-zinc-300 border-zinc-700"
                        }`}
                      >
                        {part.stockQty} {part.unit || "UN"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setAdjustingPart(part);
                          setAdjustQty(1);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-orange-500 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
                      >
                        Ajustar Qtd
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajuste Rápido de Estoque */}
      {adjustingPart && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-orange-400" />
                <span>Ajustar Estoque de Peça</span>
              </h3>
              <button
                type="button"
                onClick={() => setAdjustingPart(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Fechar (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl text-xs space-y-1">
              <p className="font-bold text-white">{adjustingPart.name}</p>
              <p className="text-zinc-400">
                Código: <span className="font-mono text-orange-400">{adjustingPart.code}</span>
              </p>
              <p className="text-zinc-400">
                Estoque Atual: <span className="font-bold text-white">{adjustingPart.stockQty} {adjustingPart.unit || "UN"}</span>
              </p>
            </div>

            <form onSubmit={handleExecuteAdjust} className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdjustType("ADD");
                    setAdjustReason("Entrada de mercadoria (NF)");
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                    adjustType === "ADD"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  + Entrada (Adicionar)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdjustType("SUB");
                    setAdjustReason("Saída avulsa / Quebra / Perda");
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                    adjustType === "SUB"
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  - Saída (Baixa manual)
                </button>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Quantidade a movimentar ({adjustingPart.unit || "UN"}):</label>
                <input
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Motivo do ajuste:</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAdjustingPart(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
                >
                  Cancelar (ESC)
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cadastro de Nova Peça */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-400" />
                <span>Cadastrar Nova Peça no Estoque</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Fechar (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPart} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Código Interno *</label>
                  <input
                    type="text"
                    placeholder="Ex: FRE-004"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100"
                  >
                    <option value="Lubrificantes">Lubrificantes</option>
                    <option value="Freios">Freios</option>
                    <option value="Transmissão">Transmissão</option>
                    <option value="Pneus & Câmaras">Pneus & Câmaras</option>
                    <option value="Elétrica & Ignição">Elétrica & Ignição</option>
                    <option value="Filtros">Filtros</option>
                    <option value="Cabos & Comandos">Cabos & Comandos</option>
                    <option value="Químicos & Sprays">Químicos & Sprays</option>
                    <option value="Rolamentos & Suspensão">Rolamentos & Suspensão</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nome da Peça *</label>
                <input
                  type="text"
                  placeholder="Ex: Pastilha de Freio Dianteira Honda XRE 300"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Marca / Fabricante</label>
                  <input
                    type="text"
                    placeholder="Ex: Cobreq, Motul"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Unidade Comercial *</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-bold text-orange-400"
                  >
                    <option value="UN">UN (Unidade)</option>
                    <option value="PÇ">PÇ (Peça)</option>
                    <option value="BD">BD (Balde / Frasco / Litro)</option>
                    <option value="KT">KT (Kit / Conjunto)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Localização Física</label>
                  <input
                    type="text"
                    placeholder="Ex: Gaveteiro B2"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Preço Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Preço Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSalePrice}
                    onChange={(e) => setNewSalePrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Estoque Inicial</label>
                  <input
                    type="number"
                    value={newStockQty}
                    onChange={(e) => setNewStockQty(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
                >
                  Cancelar (ESC)
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                >
                  Cadastrar Peça
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
