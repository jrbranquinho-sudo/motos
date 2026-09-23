"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Plus, Package, Bike, Building2, CreditCard, UserCheck } from "lucide-react";
import { useMotoShop } from "@/lib/store";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { metrics, currentUser } = useMotoShop();

  const isSaasOwner = currentUser.role === "SUPER_ADMIN";
  const isMechanic = currentUser.role === "MECHANIC";

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
        { label: "Veículos", href: "/vehicles", icon: Bike },
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
        { label: "Nova OS", href: "/orders/new", icon: Plus, isPrimary: true },
        { label: "Estoque", href: "/stock", icon: Package },
        { label: "Motos", href: "/vehicles", icon: Bike },
      ];

  return (
    <nav className="mobile-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121214]/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 group-active:scale-95 transition-transform border-2 border-zinc-900">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-orange-400 mt-0.5">Nova OS</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 relative transition-colors ${
              isActive ? "text-orange-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 text-[10px] font-bold px-1 py-0.2 rounded-full bg-orange-500 text-white">
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
