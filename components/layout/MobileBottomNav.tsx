"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Plus, Package, Bike, Car, Truck, Anchor, Building2, CreditCard, UserCheck } from "lucide-react";
import { useMotoShop } from "@/lib/store";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { metrics, currentUser, tenant } = useMotoShop();

  const isSaasOwner = currentUser.role === "SUPER_ADMIN";
  const isMechanic = currentUser.role === "MECHANIC";

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
    if (norm === "NAUTICA") return "Barcos";
    if (norm === "MOTOS" || norm === "MOTO") return "Motos";
    return "Veículos";
  };

  const VehicleIcon = getVehicleIcon(tenant.workshopType);
  const vehicleLabel = getVehicleLabel(tenant.workshopType);

  const navs = isSaasOwner
    ? [
        { label: "Plataforma", href: "/dashboard", icon: LayoutDashboard },
        { label: "Oficinas", href: "/dashboard#oficinas", icon: Building2 },
        { label: "Planos", href: "/settings/billing", icon: CreditCard },
      ]
    : isMechanic
    ? [
        { label: "Início", href: "/dashboard", icon: LayoutDashboard },
        {
          label: "Minhas OS",
          href: "/orders",
          icon: ClipboardList,
          badge: metrics.openOrders + metrics.inProgressOrders,
        },
        { label: vehicleLabel, href: "/vehicles", icon: VehicleIcon },
        { label: "Minha Senha", href: "/employees", icon: UserCheck },
      ]
    : [
        { label: "Início", href: "/dashboard", icon: LayoutDashboard },
        {
          label: "OS",
          href: "/orders",
          icon: ClipboardList,
          badge: metrics.openOrders + metrics.inProgressOrders,
        },
        { label: "+ OS", href: "/orders/new", icon: Plus, isPrimary: true },
        { label: "Estoque", href: "/stock", icon: Package },
        { label: vehicleLabel, href: "/vehicles", icon: VehicleIcon },
      ];

  return (
    <nav className="mobile-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d111a]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {navs.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        if (item.isPrimary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-6 group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-active:scale-95 transition-transform border-2 border-slate-900">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-blue-400 mt-0.5">Nova OS</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 relative transition-colors ${
              isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 text-[10px] font-bold px-1 py-0.2 rounded-full bg-blue-600 text-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
