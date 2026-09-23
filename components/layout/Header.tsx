"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  AlertTriangle,
  Menu,
  X,
  Wrench,
  Bike,
  ClipboardList,
  Package,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatPlate } from "@/lib/utils";

export function Header() {
  const router = useRouter();
  const { tenant, lowStockParts, vehicles, metrics, currentUser } = useMotoShop();
  const [searchPlate, setSearchPlate] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMechanic = currentUser.role === "MECHANIC";
  const isSaasOwner = currentUser.role === "SUPER_ADMIN";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPlate.trim()) return;
    const clean = searchPlate.toUpperCase().replace(/[^A-Z0-9]/g, "");
    router.push(`/vehicles?plate=${clean}`);
  };

  // Instant matching vehicle preview
  const matchedVehicle = searchPlate.length >= 3
    ? vehicles.find((v) =>
        v.plate.toUpperCase().includes(searchPlate.toUpperCase().replace(/[^A-Z0-9]/g, ""))
      )
    : null;

  return (
    <header className="sticky top-0 z-40 bg-[#121214]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2.5 flex items-center justify-between gap-4">
      {/* Mobile Menu & Brand */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link href="/dashboard" className="flex items-center gap-1.5 font-bold text-white">
          <Wrench className="w-5 h-5 text-orange-500" />
          <span>MotoShop</span>
        </Link>
      </div>

      {/* Search Bar or Gestão Central Badge */}
      {isSaasOwner ? (
        <div className="hidden sm:flex items-center gap-2 text-xs text-purple-300 bg-purple-950/40 border border-purple-500/30 px-3.5 py-2 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="font-semibold">👑 Gestão Central • Controle de Oficinas Contratantes</span>
        </div>
      ) : (
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por placa (ex: BRA2E19 ou CG 160)..."
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg pl-9 pr-20 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-2.5 py-1 text-xs font-semibold bg-zinc-800 hover:bg-orange-500 text-zinc-300 hover:text-white rounded transition-colors"
            >
              Buscar
            </button>
          </div>

          {/* Quick Dropdown suggestion when typing plate */}
          {matchedVehicle && (
            <div className="absolute left-0 right-0 top-11 bg-zinc-900 border border-orange-500/40 rounded-lg shadow-2xl p-2 z-50 flex items-center justify-between text-xs animate-in fade-in-50">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-orange-400" />
                <div>
                  <span className="font-mono font-bold text-white">
                    {formatPlate(matchedVehicle.plate)}
                  </span>
                  <span className="text-zinc-400 ml-2">
                    {matchedVehicle.brand} {matchedVehicle.model}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/vehicles/${matchedVehicle.id}`}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-[11px] text-zinc-300"
                  onClick={() => setSearchPlate("")}
                >
                  Ver Ficha
                </Link>
                {!isMechanic && !isSaasOwner && (
                  <Link
                    href={`/orders/new?vehicleId=${matchedVehicle.id}`}
                    className="px-2 py-1 bg-orange-500 hover:bg-orange-600 rounded text-[11px] text-white font-bold"
                    onClick={() => setSearchPlate("")}
                  >
                    + Nova OS
                  </Link>
                )}
              </div>
            </div>
          )}
        </form>
      )}

      {/* Right Actions: Low Stock Badge, + Nova OS */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {!isMechanic && !isSaasOwner && lowStockParts.length > 0 && (
          <Link
            href="/stock"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors"
            title={`${lowStockParts.length} peças com estoque abaixo do mínimo`}
          >
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
            <span className="hidden md:inline">Estoque Baixo:</span>
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {lowStockParts.length}
            </span>
          </Link>
        )}

        <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-200 font-medium">
            {isSaasOwner ? "Gestor Master" : tenant.name}
          </span>
        </div>

        {!isMechanic && !isSaasOwner && (
          <Link
            href="/orders/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Nova OS</span>
          </Link>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[53px] bg-zinc-950/95 backdrop-blur-xl z-50 p-4 flex flex-col space-y-3">
          <form onSubmit={handleSearch} className="mb-2">
            <input
              type="text"
              placeholder="Buscar por placa (ex: BRA2E19)..."
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 font-mono"
            />
          </form>

          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="p-3 rounded-lg bg-zinc-900 text-zinc-200 font-medium flex items-center gap-3"
          >
            <Wrench className="w-4 h-4 text-orange-400" /> Painel de Controle
          </Link>
          <Link
            href="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="p-3 rounded-lg bg-zinc-900 text-zinc-200 font-medium flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <ClipboardList className="w-4 h-4 text-orange-400" /> Ordens de Serviço
            </div>
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-bold">
              {metrics.openOrders + metrics.inProgressOrders}
            </span>
          </Link>
          <Link
            href="/vehicles"
            onClick={() => setMobileMenuOpen(false)}
            className="p-3 rounded-lg bg-zinc-900 text-zinc-200 font-medium flex items-center gap-3"
          >
            <Bike className="w-4 h-4 text-orange-400" /> Veículos & Placas
          </Link>
          <Link
            href="/stock"
            onClick={() => setMobileMenuOpen(false)}
            className="p-3 rounded-lg bg-zinc-900 text-zinc-200 font-medium flex items-center gap-3"
          >
            <Package className="w-4 h-4 text-orange-400" /> Estoque de Peças
          </Link>
          <Link
            href="/settings/billing"
            onClick={() => setMobileMenuOpen(false)}
            className="p-3 rounded-lg bg-zinc-900 text-zinc-200 font-medium flex items-center gap-3"
          >
            Planos & Faturamento
          </Link>
        </div>
      )}
    </header>
  );
}
