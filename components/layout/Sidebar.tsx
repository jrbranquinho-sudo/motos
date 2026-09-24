"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Wrench,
  LayoutDashboard,
  ClipboardList,
  Bike,
  Car,
  Truck,
  Anchor,
  Package,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  PlusCircle,
  Building2,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  DollarSign,
  Coins,
  LogOut,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatPlanName } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    tenant,
    tenants,
    setTenant,
    currentUser,
    metrics,
    logout,
  } = useMotoShop();

  const [showTenantMenu, setShowTenantMenu] = useState(false);
  const isMechanic = currentUser.role === "MECHANIC";
  const isSaasOwner = currentUser.role === "SUPER_ADMIN";

  // Dynamic vehicle icon and label based on workshop segment
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

  interface SidebarNavItem {
    label: string;
    href: string;
    icon: any;
    badge?: number;
    alertBadge?: number;
  }

  interface SidebarNavSection {
    title: string;
    items: SidebarNavItem[];
  }

  // Grouped Navigation matching dump screenshots
  const navSections: SidebarNavSection[] = isSaasOwner
    ? [
        {
          title: "PLATAFORMA SAAS",
          items: [
            { label: "Dashboard Geral", href: "/dashboard", icon: LayoutDashboard },
            { label: "Oficinas em Teste (Trial)", href: "/dashboard#trials", icon: Star, badge: tenants.filter(t => t.plan === 'TRIAL' || t.isTrial).length },
            { label: "Oficinas Contratantes", href: "/dashboard#oficinas", icon: Building2 },
          ],
        },
        {
          title: "SISTEMA",
          items: [
            { label: "Planos & Assinaturas", href: "/settings/billing", icon: CreditCard },
            { label: "Configurações Globais", href: "/settings", icon: Settings },
          ],
        },
      ]
    : isMechanic
    ? [
        {
          title: "PRINCIPAL",
          items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            {
              label: "Minhas OS",
              href: "/orders",
              icon: ClipboardList,
              badge: metrics.openOrders + metrics.inProgressOrders,
            },
          ],
        },
        {
          title: "CADASTROS",
          items: [
            { label: vehicleLabel, href: "/vehicles", icon: VehicleIcon },
            { label: "Estoque", href: "/stock", icon: Package },
          ],
        },
      ]
    : [
        {
          title: "PRINCIPAL",
          items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            {
              label: "Ordens de Serviço",
              href: "/orders",
              icon: ClipboardList,
              badge: metrics.openOrders + metrics.inProgressOrders,
            },
          ],
        },
        {
          title: "CADASTROS",
          items: [
            { label: "Clientes", href: "/customers", icon: Users },
            { label: vehicleLabel, href: "/vehicles", icon: VehicleIcon },
            {
              label: "Estoque",
              href: "/stock",
              icon: Package,
              alertBadge: metrics.lowStockCount > 0 ? metrics.lowStockCount : undefined,
            },
            { label: "Serviços", href: "/services", icon: Wrench },
            { label: "Técnicos", href: "/employees", icon: UserCheck },
          ],
        },
        {
          title: "FINANCEIRO",
          items: [
            { label: "Financeiro", href: "/financial", icon: DollarSign },
            { label: "Relatórios", href: "/reports", icon: BarChart3 },
            { label: "Comissões", href: "/commissions", icon: Coins },
          ],
        },
        {
          title: "SISTEMA",
          items: [
            { label: "Configurações", href: "/settings", icon: Settings },
            { label: "Planos", href: "/settings/billing", icon: Star },
          ],
        },
      ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0d111a] border-r border-slate-800/80 text-slate-300 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-white tracking-tight">Mot-OS</span>
              <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {tenant.plan === "TRIAL" || tenant.isTrial ? "DEMO 7D" : formatPlanName(tenant.plan)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Gestão Inteligente</p>
          </div>
        </Link>
      </div>

      {/* Tenant Switcher Dropdown */}
      <div className="px-3 pt-3 relative">
        <button
          onClick={() => setShowTenantMenu(!showTenantMenu)}
          className="w-full text-left p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs transition-colors"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="truncate">
              <p className="text-slate-200 font-semibold truncate leading-tight">{tenant.name}</p>
              <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                <span>{tenant.workshopType ? `Oficina ${tenant.workshopType}` : "Oficina Ativa"}</span>
                {tenant.isTrial && <span className="text-amber-400 font-bold">(Teste)</span>}
              </p>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        </button>

        {showTenantMenu && (
          <div className="absolute left-3 right-3 top-14 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-1 z-50">
            <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">
              Oficinas Cadastradas
            </div>
            {tenants.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTenant(t);
                  setShowTenantMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                  t.id === tenant.id
                    ? "bg-blue-600/20 text-blue-400 font-semibold"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="truncate">{t.name}</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {t.workshopType || formatPlanName(t.plan)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Button - Restricted for mechanics and SaaS owner */}
      {!isMechanic && !isSaasOwner && (
        <div className="px-3 pt-3 pb-1">
          <Link
            href="/orders/new"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/25 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Nova OS</span>
          </Link>
        </div>
      )}

      {/* Grouped Navigation Links */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto pt-2 pb-4 scrollbar-thin scrollbar-thumb-slate-800">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="text-[10px] font-bold tracking-wider text-slate-500 px-2.5 uppercase">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-500 font-semibold pl-2"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-400" : "text-slate-500"}`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {item.badge}
                    </span>
                  )}
                  {item.alertBadge !== undefined && item.alertBadge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse shrink-0">
                      {item.alertBadge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile & Logout Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate leading-tight">{currentUser.name}</p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-[10px] text-slate-400 truncate">
                  {currentUser.role === "SUPER_ADMIN"
                    ? "Admin do SaaS"
                    : currentUser.role === "ADMIN"
                    ? "Proprietário"
                    : currentUser.role === "MECHANIC"
                    ? "Mecânico"
                    : currentUser.role === "RECEPTIONIST"
                    ? "Recepção"
                    : "Gerente"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Sair */}
        <button
          type="button"
          onClick={() => {
            if (confirm("Deseja realmente sair da sua conta?")) {
              logout();
              router.push("/login");
            }
          }}
          className="mt-2 w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-slate-900/80 hover:bg-red-950/30 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 text-xs font-medium transition-all active:scale-95"
          title="Encerrar sessão"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
