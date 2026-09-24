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
  Car,
  Truck,
  Anchor,
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

  const getVehicleIcon = (type?: string) => {
    const norm = String(type || "").toUpperCase();
    if (norm === "CARROS" || norm === "CARRO") return Car;
    if (norm === "CAMINHOES" || norm === "CAMINHAO") return Truck;
    if (norm === "NAUTICA") return Anchor;
    return Bike;
  };

  const VehicleIcon = getVehicleIcon(tenant.workshopType);

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
    <header className="sticky top-0 z-40 bg-[#0d111a]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-4">
      {/* Mobile Menu & Brand */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link href="/dashboard" className="flex items-center gap-1.5 font-bold text-white">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Wrench className="w-4 h-4" />
          </div>
          <span className="font-black text-lg tracking-tight">Mot-OS</span>
        </Link>
      </div>

      {/* Search Bar or Gestão Central Badge */}
      {isSaasOwner ? (
        <div className="hidden sm:flex items-center gap-2 text-xs text-blue-300 bg-blue-950/40 border border-blue-500/30 px-3.5 py-2 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="font-semibold">👑 Painel SaaS Master • Monitoramento de Oficinas</span>
        </div>
      ) : (
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por placa ou modelo..."
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-20 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2" />
            <button
              type="submit"
              className="absolute right-1 top-1 px-2.5 py-0.5 text-xs font-semibold bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded transition-colors"
            >
              Buscar
            </button>
          </div>

          {/* Quick Dropdown suggestion when typing plate */}
          {matchedVehicle && (
            <div className="absolute left-0 right-0 top-11 bg-slate-900 border border-blue-500/40 rounded-lg shadow-2xl p-2 z-50 flex items-center justify-between text-xs animate-in fade-in-50">
              <div className="flex items-center gap-2">
                <VehicleIcon className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="font-mono font-bold text-white">
                    {formatPlate(matchedVehicle.plate)}
                  </span>
                  <span className="text-slate-400 ml-2">
                    {matchedVehicle.brand} {matchedVehicle.model}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/vehicles/${matchedVehicle.id}`}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] text-slate-300"
                  onClick={() => setSearchPlate("")}
                >
                  Ver Ficha
                </Link>
                {!isMechanic && !isSaasOwner && (
                  <Link
                    href={`/orders/new?vehicleId=${matchedVehicle.id}`}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-[11px] text-white font-bold"
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors"
            title={`${lowStockParts.length} peças com estoque abaixo do mínimo`}
          >
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
            <span className="hidden md:inline">Estoque Baixo:</span>
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {lowStockParts.length}
            </span>
          </Link>
        )}

        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-200 font-medium">
            {isSaasOwner ? "Gestor Master" : tenant.name}
          </span>
        </div>

        {!isMechanic && !isSaasOwner && (
          <Link
            href="/orders/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Nova OS</span>
          </Link>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[53px] bg-slate-950/95 backdrop-blur-xl z-50 p-4 flex flex-col space-y-2">
          <form onSubmit={handleSearch} className="mb-2">
            <input
              type="text"
              placeholder="Buscar por placa..."
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono"
            />
          </form>

          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-lg bg-slate-900 text-slate-200 text-xs font-medium flex items-center gap-3"
          >
            <Wrench className="w-4 h-4 text-blue-400" /> Dashboard
          </Link>
          <Link
            href="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-lg bg-slate-900 text-slate-200 text-xs font-medium flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <ClipboardList className="w-4 h-4 text-blue-400" /> Ordens de Serviço
            </div>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
              {metrics.openOrders + metrics.inProgressOrders}
            </span>
          </Link>
          <Link
            href="/vehicles"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-lg bg-slate-900 text-slate-200 text-xs font-medium flex items-center gap-3"
          >
            <VehicleIcon className="w-4 h-4 text-blue-400" /> Veículos
          </Link>
          <Link
            href="/stock"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-lg bg-slate-900 text-slate-200 text-xs font-medium flex items-center gap-3"
          >
            <Package className="w-4 h-4 text-blue-400" /> Estoque de Peças
          </Link>
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-lg bg-slate-900 text-slate-200 text-xs font-medium flex items-center gap-3"
          >
            <Wrench className="w-4 h-4 text-blue-400" /> Serviços
          </Link>
          <Link
            href="/financial"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-lg bg-slate-900 text-slate-200 text-xs font-medium flex items-center gap-3"
          >
            Financeiro & DRE
          </Link>
          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-lg bg-slate-900 text-slate-200 text-xs font-medium flex items-center gap-3"
          >
            Configurações da Oficina
          </Link>
        </div>
      )}
    </header>
  );
}
