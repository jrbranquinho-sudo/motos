"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Bike, Plus, History, ArrowRight, UserCheck } from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatPlate } from "@/lib/utils";

export function QuickPlateHero() {
  const { vehicles, customers, serviceOrders, currentUser } = useMotoShop();
  const [plateInput, setPlateInput] = useState("");

  const isMechanic = currentUser.role === "MECHANIC";
  const clean = plateInput.toUpperCase().replace(/[^A-Z0-9]/g, "");

  const matchedVehicles = clean.length >= 2
    ? vehicles.filter((v) =>
        v.plate.toUpperCase().replace(/[^A-Z0-9]/g, "").includes(clean)
      )
    : [];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-orange-500/30 p-5 sm:p-7 shadow-xl shadow-orange-950/20 mb-8">
      {/* Background glow decoration */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-widest mb-1.5">
          <Bike className="w-4 h-4" />
          <span>Atendimento Rápido de Bancada</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
          Consultar Moto por Placa
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mb-4">
          Digite a placa (Mercosul ou antiga) para ver o histórico e abrir uma Nova OS em poucos segundos.
        </p>

        {/* Big Search Input */}
        <div className="relative">
          <div className="flex items-center rounded-xl bg-zinc-950/80 border-2 border-zinc-700 focus-within:border-orange-500 shadow-inner px-3 py-2 transition-all">
            <span className="text-zinc-500 mr-2 font-mono font-bold text-sm select-none">
              BR
            </span>
            <input
              type="text"
              placeholder="Ex: BRA2E19 ou FDX4G82"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
              maxLength={8}
              className="w-full bg-transparent text-lg sm:text-2xl font-mono font-black text-orange-400 placeholder:text-zinc-600 focus:outline-none uppercase tracking-wider"
            />
            {plateInput && (
              <button
                onClick={() => setPlateInput("")}
                className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-zinc-400">
          <span className="text-zinc-500">Motos de exemplo:</span>
          {vehicles.slice(0, 4).map((v) => (
            <button
              key={v.id}
              onClick={() => setPlateInput(v.plate)}
              className="px-2 py-1 rounded bg-zinc-800/80 hover:bg-orange-500/20 hover:text-orange-300 font-mono text-[11px] border border-zinc-700/60 transition-colors"
            >
              {v.plate} ({v.model.split(" ")[0]} {v.model.split(" ")[1] || ""})
            </button>
          ))}
        </div>
      </div>

      {/* Matched Vehicle Card Results */}
      {matchedVehicles.length > 0 && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in-50 duration-200">
          {matchedVehicles.map((vehicle) => {
            const customer = customers.find((c) => c.id === vehicle.customerId);
            const lastOS = serviceOrders
              .filter((o) => o.vehicleId === vehicle.id)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

            return (
              <div
                key={vehicle.id}
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-orange-500/40 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-base font-black px-2.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {formatPlate(vehicle.plate)}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400">
                      {vehicle.currentKm.toLocaleString("pt-BR")} KM
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Ano: {vehicle.year} • Cor: {vehicle.color || "Padrão"}
                  </p>

                  {customer && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-300">
                      <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                      <span>{customer.name}</span>
                      <span className="text-zinc-500">({customer.phone})</span>
                    </div>
                  )}

                  {lastOS && (
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Última OS #{lastOS.osNumber} ({new Date(lastOS.createdAt).toLocaleDateString("pt-BR")})
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-900">
                  {!isMechanic && (
                    <Link
                      href={`/orders/new?vehicleId=${vehicle.id}`}
                      className="flex-1 py-2 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-transform active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Abrir Nova OS</span>
                    </Link>
                  )}

                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className={`py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1 transition-colors ${
                      isMechanic ? "flex-1" : ""
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>{isMechanic ? "Ver Histórico e Detalhes" : "Histórico"}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
