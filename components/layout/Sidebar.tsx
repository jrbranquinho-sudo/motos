"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Wrench,
  LayoutDashboard,
  ClipboardList,
  Bike,
  Package,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  PlusCircle,
  Building2,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  ArrowRightLeft,
  UserCheck,
  LogOut,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { Role } from "@/lib/types";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    tenant,
    tenants,
    setTenant,
    currentUser,
    users,
    setCurrentUser,
    metrics,
    resetToDefaults,
    logout,
  } = useMotoShop();

  const [showTenantMenu, setShowTenantMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isMechanic = currentUser.role === "MECHANIC";
  const isSaasOwner = currentUser.role === "SUPER_ADMIN";

  const navItems = isSaasOwner
    ? [
        { label: "Painel da Plataforma", href: "/dashboard", icon: LayoutDashboard },
        { label: "Oficinas Contratantes", href: "/dashboard#oficinas", icon: Building2 },
        { label: "Planos & Assinaturas", href: "/settings/billing", icon: CreditCard },
      ]
    : isMechanic
    ? [
        { label: "Painel de Controle", href: "/dashboard", icon: LayoutDashboard },
        {
          label: "Minhas OS",
          href: "/orders",
          icon: ClipboardList,
          badge: metrics.openOrders + metrics.inProgressOrders,
        },
        { label: "Consultar Veículos", href: "/vehicles", icon: Bike },
        { label: "Alterar Senha", href: "/employees", icon: UserCheck },
      ]
    : [
        { label: "Painel de Controle", href: "/dashboard", icon: LayoutDashboard },
        {
          label: "Ordens de Serviço",
          href: "/orders",
          icon: ClipboardList,
          badge: metrics.openOrders + metrics.inProgressOrders,
        },
        { label: "Veículos & Placas", href: "/vehicles", icon: Bike },
        {
          label: "Estoque de Peças",
          href: "/stock",
          icon: Package,
          alertBadge: metrics.lowStockCount > 0 ? metrics.lowStockCount : undefined,
        },
        { label: "Movimentações", href: "/stock/movements", icon: ArrowRightLeft },
        { label: "Clientes", href: "/customers", icon: Users },
        { label: "Funcionários", href: "/employees", icon: UserCheck },
        { label: "Relatórios & Métricas", href: "/reports", icon: BarChart3 },
        { label: "Planos & Assinatura", href: "/settings/billing", icon: CreditCard },
        { label: "Configurações", href: "/settings", icon: Settings },
      ];


  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#141416] border-r border-zinc-800/80 text-zinc-300 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-white tracking-tight">MotoShop</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {tenant.plan}
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium">Gestão de Oficinas</p>
          </div>
        </Link>
      </div>

      {/* Tenant Switcher Dropdown */}
      <div className="px-3 pt-3 relative">
        <button
          onClick={() => setShowTenantMenu(!showTenantMenu)}
          className="w-full text-left p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between text-xs transition-colors"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-4 h-4 text-orange-400 shrink-0" />
            <div className="truncate">
              <p className="text-zinc-200 font-semibold truncate leading-tight">{tenant.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">Oficina Ativa</p>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
        </button>

        {showTenantMenu && (
          <div className="absolute left-3 right-3 top-14 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-1 z-50">
            <div className="text-[10px] uppercase font-bold text-zinc-500 px-2 py-1">
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
                    ? "bg-orange-500/20 text-orange-400 font-semibold"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <span className="truncate">{t.name}</span>
                <span className="text-[10px] font-mono text-zinc-500">{t.plan}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Button - Restricted for mechanics and SaaS owner */}
      {!isMechanic && !isSaasOwner && (
        <div className="p-3">
          <Link
            href="/orders/new"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Ordem de Serviço</span>
          </Link>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto pt-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/30 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-orange-400" : "text-zinc-500"}`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {item.badge}
                </span>
              )}
              {item.alertBadge !== undefined && item.alertBadge > 0 && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                  {item.alertBadge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/70 border border-zinc-800">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold text-xs shrink-0">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-zinc-200 truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-[10px] text-zinc-400 font-medium truncate">
                  {currentUser.role === "SUPER_ADMIN"
                    ? "Administrador Geral"
                    : currentUser.role === "ADMIN"
                    ? "Proprietário / Admin"
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

        {/* Botão Sair / Desconectar */}
        <button
          type="button"
          onClick={() => {
            if (confirm("Deseja realmente sair da sua conta?")) {
              logout();
              router.push("/login");
            }
          }}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-950/25 hover:bg-red-900/40 text-red-400 border border-red-500/25 text-xs font-bold transition-all active:scale-95"
          title="Encerrar sessão"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair / Desconectar</span>
        </button>
      </div>
    </aside>
  );
}
