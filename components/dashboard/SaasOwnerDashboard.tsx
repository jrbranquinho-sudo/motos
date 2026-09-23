"use client";

import React, { useState } from "react";
import {
  Building2,
  TrendingUp,
  Users,
  ClipboardList,
  ShieldCheck,
  Search,
  ExternalLink,
  Calendar,
  Clock,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowUpRight,
  Plus,
  X,
  Lock,
  Mail,
  Phone,
  UserCheck,
  Sparkles,
  AlertOctagon,
  AlertTriangle,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plan, Tenant } from "@/lib/types";
import { getSubscriptionInfo, OFFICIAL_PLANS } from "@/lib/subscription";

const PLAN_PRICES: Record<string, number> = {
  MONTHLY: 280,
  ANNUAL: 2000,
  FREE: 0,
  STARTER: 79,
  PRO: 149,
  ENTERPRISE: 399,
};

export function SaasOwnerDashboard() {
  const { tenants, setTenant, tenant: currentTenant, currentUser, users, addTenant } = useMotoShop();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>("ALL");

  // New Workshop Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [shopName, setShopName] = useState("");
  const [slug, setSlug] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [address, setAddress] = useState("");
  const [plan, setPlan] = useState<Plan>("MONTHLY");

  // Workshop Owner states
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerUsername, setOwnerUsername] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");

  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Calculate SaaS Global Metrics
  const totalTenantsCount = tenants.length;
  const totalMRR = tenants.reduce((acc, t) => acc + (PLAN_PRICES[t.plan] || 0), 0);
  const totalPlatformVolume = tenants.reduce((acc, t) => acc + (t.totalRevenue || 0), 0);
  const totalPlatformOrders = tenants.reduce((acc, t) => acc + (t.ordersCount || 0), 0);

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      !searchTerm ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.cnpj && t.cnpj.includes(searchTerm)) ||
      (t.address && t.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.lastAccessUser && t.lastAccessUser.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPlan = selectedPlanFilter === "ALL" || t.plan === selectedPlanFilter;
    return matchesSearch && matchesPlan;
  });

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !ownerName || !ownerEmail) {
      alert("Preencha o nome da oficina, o nome do proprietário e o e-mail de acesso.");
      return;
    }

    const finalSlug =
      slug.trim().toLowerCase().replace(/[^a-z0-9]/g, "") ||
      shopName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15);

    const { tenant: createdTenant, owner: createdOwner } = addTenant(
      {
        name: shopName.trim(),
        slug: finalSlug,
        plan,
        cnpj: cnpj || undefined,
        phone: shopPhone || undefined,
        address: address || undefined,
      },
      {
        name: ownerName.trim(),
        email: ownerEmail.trim().toLowerCase(),
        username: ownerUsername.trim().toLowerCase() || ownerEmail.split("@")[0],
        phone: ownerPhone || undefined,
      }
    );

    setFeedbackMsg(`Oficina "${createdTenant.name}" cadastrada com sucesso! Login do dono: ${createdOwner.email} (senha padrão: mot-os123).`);
    setIsAddModalOpen(false);

    // Reset Form
    setShopName("");
    setSlug("");
    setCnpj("");
    setShopPhone("");
    setAddress("");
    setPlan("PRO");
    setOwnerName("");
    setOwnerEmail("");
    setOwnerUsername("");
    setOwnerPhone("");

    setTimeout(() => setFeedbackMsg(""), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 via-zinc-900 to-zinc-900 border border-orange-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/30">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Painel Global SaaS — Dono da Plataforma
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              SUPER ADMIN
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Bem-vindo, <strong className="text-zinc-200">{currentUser.name}</strong>. Gestão centralizada de oficinas contratantes e credenciais dos proprietários.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Cadastrar Nova Oficina</span>
          </button>

          <div className="px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-right hidden sm:block">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
              Faturamento Recorrente (MRR)
            </span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {formatCurrency(totalMRR)}/mês
            </span>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Global SaaS Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Empresas Clientes
            </span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-white mt-2 font-mono">
            {totalTenantsCount}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% ativas na plataforma</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Volume Transacionado
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2 font-mono">
            {formatCurrency(totalPlatformVolume)}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Movimentação somada de todas as oficinas
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Ordens de Serviço Totais
            </span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ClipboardList className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-purple-300 mt-2 font-mono">
            {totalPlatformOrders}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Atendimentos gerados no ecossistema
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              MRR Assinaturas
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-amber-400 mt-2 font-mono">
            {formatCurrency(totalMRR)}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Receita mensal bruta de planos
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por nome da oficina, CNPJ, cidade ou proprietário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500 hidden sm:block" />
          <select
            value={selectedPlanFilter}
            onChange={(e) => setSelectedPlanFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">Todos os Planos ({tenants.length})</option>
            <option value="ENTERPRISE">Plano Enterprise</option>
            <option value="PRO">Plano Pro</option>
            <option value="STARTER">Plano Starter</option>
            <option value="FREE">Plano Free</option>
          </select>
        </div>
      </div>

      {/* Registered Client Workshops List */}
      <div id="oficinas" className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-400" />
              <span>Oficinas Contratantes (Empresas Clientes)</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Exibindo apenas os dados cadastrais da empresa e as credenciais de acesso do dono da oficina (funcionários internos restritos à oficina)
            </p>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {filteredTenants.length} oficina(s) listada(s)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredTenants.map((t) => {
            const isCurrent = t.id === currentTenant.id;
            // Find ONLY the owner of this workshop (role === 'ADMIN')
            const owner = users.find((u) => u.tenantId === t.id && u.role === "ADMIN");

            return (
              <div
                key={t.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCurrent
                    ? "bg-zinc-950/80 border-orange-500/40 ring-1 ring-orange-500/20"
                    : "bg-zinc-950/50 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  {/* Company Info */}
                  <div className="space-y-1.5 min-w-[260px]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-black text-sm">
                        {t.name.slice(0, 1)}
                      </span>
                      <div>
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <span>{t.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              Oficina Ativa
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-zinc-400">
                          {t.slug}.motoshop.com • CNPJ: {t.cnpj || "Não informado"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">
                      📍 {t.address || "Endereço comercial não cadastrado"}
                    </p>
                  </div>

                  {/* Login do Dono da Oficina */}
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-purple-500/30 space-y-1.5 text-xs min-w-[260px]">
                    <span className="text-[10px] text-purple-300 uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                      Login do Dono da Oficina
                    </span>
                    <div className="text-white font-bold flex items-center justify-between">
                      <span>{owner?.name || t.lastAccessUser || "Proprietário"}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        ADMIN
                      </span>
                    </div>
                    <p className="text-zinc-300 font-mono text-[11px] flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-zinc-500" />
                      <span>{owner?.email || "dono@oficina.com.br"}</span>
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
                      <span>Usuário: <strong className="text-zinc-200 font-mono">{owner?.username || "admin"}</strong></span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {owner?.phone || t.phone || "-"}
                      </span>
                    </div>
                  </div>

                  {/* Plan & Subscription */}
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 space-y-1 text-xs min-w-[170px]">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Plano Contratado:</span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                          t.plan === "ENTERPRISE"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : t.plan === "PRO"
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {t.plan}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Mensalidade:</span>
                      <span className="font-mono font-bold text-zinc-200">
                        {formatCurrency(PLAN_PRICES[t.plan])}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                      <span>Cliente desde:</span>
                      <span>{formatDate(t.createdAt)}</span>
                    </div>
                  </div>

                  {/* Company Telemetry / Summary */}
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 space-y-1 text-xs min-w-[180px]">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                      Movimentação Total
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Faturamento:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatCurrency(t.totalRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>OS Geradas:</span>
                      <span className="font-mono font-semibold text-zinc-200">
                        {t.ordersCount || 0} OS
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                      <span>Último Acesso:</span>
                      <span>{t.lastAccessAt ? formatDate(t.lastAccessAt) : "Recente"}</span>
                    </div>
                  </div>

                  {/* Actions: Switch to Tenant */}
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => {
                        setTenant(t);
                        alert(`Oficina "${t.name}" selecionada.`);
                      }}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                        isCurrent
                          ? "bg-zinc-800 text-zinc-400 cursor-default"
                          : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20"
                      }`}
                    >
                      <span>{isCurrent ? "Oficina Ativa" : "Acessar Oficina"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Cadastrar Nova Oficina Contratante */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Cadastrar Oficina Contratante</h3>
                  <p className="text-xs text-zinc-400">
                    Cadastre a nova empresa cliente e gere as credenciais do proprietário
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-6">
              {/* Section 1: Dados da Oficina */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase text-orange-400 tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> 1. Dados da Oficina (Empresa Cliente)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">
                      Nome da Oficina *
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Moto Center São Paulo"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">
                      Subdomínio / Slug *
                    </label>
                    <input
                      type="text"
                      placeholder="ex: motocentersp"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 font-mono focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">
                      CNPJ da Empresa
                    </label>
                    <input
                      type="text"
                      placeholder="00.000.000/0001-00"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 font-mono focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">
                      Plano Contratado *
                    </label>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value as Plan)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="FREE">Plano Free (R$ 0/mês)</option>
                      <option value="STARTER">Plano Starter (R$ 79/mês)</option>
                      <option value="PRO">Plano Pro (R$ 149/mês)</option>
                      <option value="ENTERPRISE">Plano Enterprise (R$ 399/mês)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">
                      Endereço Comercial da Oficina
                    </label>
                    <input
                      type="text"
                      placeholder="Rua / Av., Número, Bairro, Cidade - UF"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Dados do Dono da Oficina */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <span className="text-xs font-bold uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> 2. Login do Proprietário / Dono da Oficina
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">
                      Nome do Proprietário *
                    </label>
                    <input
                      type="text"
                      placeholder="Nome completo do dono"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">
                      E-mail de Login do Dono *
                    </label>
                    <input
                      type="email"
                      placeholder="dono@oficina.com.br"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">
                      Nome de Usuário (Username)
                    </label>
                    <input
                      type="text"
                      placeholder="ex: dono_oficina"
                      value={ownerUsername}
                      onChange={(e) => setOwnerUsername(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 font-mono focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1">
                      Telefone / WhatsApp do Dono
                    </label>
                    <input
                      type="text"
                      placeholder="(11) 98765-4321"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 font-mono focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password Notice */}
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-purple-500/30 text-xs text-zinc-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Senha Inicial Padrão: mot-os123</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    No primeiro acesso do proprietário, o sistema exigirá verificação em 2 etapas (2FA) e a troca obrigatória da senha para um padrão forte de alta segurança.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                >
                  Salvar e Cadastrar Oficina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
