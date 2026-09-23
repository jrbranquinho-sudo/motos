"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Lock,
  User as UserIcon,
  Building2,
  AlertTriangle,
  KeyRound,
  Sparkles,
  AlertOctagon,
  CalendarX,
  CreditCard,
  Check,
  RefreshCw,
  X,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { getSubscriptionInfo, SubscriptionInfo } from "@/lib/subscription";
import { Tenant, User } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { tenant, tenants, setTenant, users, setCurrentUser, renewSubscription } = useMotoShop();

  const [identifier, setIdentifier] = useState("jrbranquinho");
  const [password, setPassword] = useState("mot-os123");
  const [errorMsg, setErrorMsg] = useState("");

  // Expired plan modal state
  const [expiredBlock, setExpiredBlock] = useState<{
    tenant: Tenant;
    user: User;
    subInfo: SubscriptionInfo;
  } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");
  const [isRenewing, setIsRenewing] = useState(false);

  const checkSubscriptionAndProceed = (targetUser: User, targetTenant: Tenant) => {
    // SaaS Master owner is never blocked by client subscription
    if (targetUser.role === "SUPER_ADMIN") {
      setCurrentUser(targetUser);
      if (targetTenant.id !== tenant.id) {
        setTenant(targetTenant);
      }
      router.push("/dashboard");
      return;
    }

    const subInfo = getSubscriptionInfo(targetTenant);
    if (subInfo.isExpired) {
      // Block login and open warning/renewal modal
      setExpiredBlock({
        tenant: targetTenant,
        user: targetUser,
        subInfo,
      });
      return;
    }

    // Normal access
    setCurrentUser(targetUser);
    if (targetTenant.id !== tenant.id) {
      setTenant(targetTenant);
    }
    router.push("/dashboard");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setExpiredBlock(null);

    const clean = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    const foundUser = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === clean) ||
        u.email.toLowerCase() === clean
    );

    if (!foundUser) {
      setErrorMsg("Usuário ou e-mail não encontrado no sistema.");
      return;
    }

    const expectedPass = foundUser.password || "mot-os123";
    if (cleanPass !== expectedPass) {
      setErrorMsg("Senha incorreta. Para novos acessos, a senha padrão é mot-os123.");
      return;
    }

    const targetTenant = tenants.find((t) => t.id === foundUser.tenantId) || tenant;
    checkSubscriptionAndProceed(foundUser, targetTenant);
  };

  const handleQuickLogin = (userIdentifier: string) => {
    setErrorMsg("");
    setExpiredBlock(null);

    const clean = userIdentifier.toLowerCase();
    const found = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === clean) ||
        u.email.toLowerCase() === clean
    );

    if (found) {
      const targetTenant = tenants.find((t) => t.id === found.tenantId) || tenant;
      checkSubscriptionAndProceed(found, targetTenant);
    }
  };

  const handleRenewAndUnlock = () => {
    if (!expiredBlock) return;
    setIsRenewing(true);
    setTimeout(() => {
      renewSubscription(expiredBlock.tenant.id, selectedPlan);
      setCurrentUser(expiredBlock.user);
      setTenant(expiredBlock.tenant);
      setIsRenewing(false);
      setExpiredBlock(null);
      router.push("/dashboard");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-orange-500/30">
            <Wrench className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Entrar no MotoShop SaaS
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Acesse a gestão da sua oficina mecânica ou administração da plataforma
          </p>
        </div>

        {/* Highlight Banner: Master First Access Instructions */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-950 border border-purple-500/40 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Primeiro Acesso • Dono do SaaS (Master)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Usuário Master: <strong className="text-purple-300 font-mono">jrbranquinho</strong> • Senha padrão inicial: <strong className="text-orange-400 font-mono">mot-os123</strong>
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 pt-1 border-t border-purple-900/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Exige autenticação 2FA e criação de nova senha forte no 1º login.</span>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-5">
          {/* Tenant Selector */}
          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-1">
              Oficina Selecionada
            </label>
            <select
              value={tenant.id}
              onChange={(e) => {
                const found = tenants.find((t) => t.id === e.target.value);
                if (found) setTenant(found);
              }}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 font-semibold focus:border-orange-500 focus:outline-none"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.slug}.motoshop.com)
                </option>
              ))}
            </select>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">
                Usuário ou E-mail
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ex: jrbranquinho ou joao@motoshow.com.br"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none font-mono"
                  required
                />
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Senha cadastrada"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none font-mono"
                  required
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Entrar no Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Quick Demo Login Shortcuts */}
          <div className="pt-4 border-t border-zinc-800 space-y-2">
            <span className="text-[11px] font-bold uppercase text-zinc-500 block text-center tracking-wider">
              Acesso Rápido por Perfil (1 Clique)
            </span>

            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin("jrbranquinho")}
                className="w-full text-left p-2.5 rounded-xl bg-purple-950/20 hover:bg-purple-900/30 text-xs flex items-center justify-between transition-colors border border-purple-500/40 group"
              >
                <div>
                  <span className="font-bold text-purple-300 block">
                    👑 JR Branquinho (Dono do SaaS Master)
                  </span>
                  <span className="text-[10px] text-zinc-500">Usuário: jrbranquinho • Senha: mot-os123</span>
                </div>
                <span className="text-[10px] text-purple-400 font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                  MASTER
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("joao@motoshow.com.br")}
                className="w-full text-left p-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-xs flex items-center justify-between transition-colors border border-zinc-800/80"
              >
                <span className="font-semibold text-zinc-200">João Silva (Dono da Oficina)</span>
                <span className="text-[10px] text-orange-400 font-mono">ADMIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("paula@motoshow.com.br")}
                className="w-full text-left p-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-xs flex items-center justify-between transition-colors border border-zinc-800/80"
              >
                <span className="font-semibold text-zinc-200">Paula Souza (Recepção)</span>
                <span className="text-[10px] text-blue-400 font-mono">RECEPTIONIST</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("carlao@motoshow.com.br")}
                className="w-full text-left p-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-xs flex items-center justify-between transition-colors border border-zinc-800/80"
              >
                <span className="font-semibold text-zinc-200">Carlão Santos (Mecânico da Bancada)</span>
                <span className="text-[10px] text-emerald-400 font-mono">MECHANIC</span>
              </button>

              {/* Expired Tenant Quick Demo Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin("marcos@speedracing.com.br")}
                className="w-full text-left p-2 rounded-lg bg-red-950/20 hover:bg-red-900/30 text-xs flex items-center justify-between transition-colors border border-red-500/40 group"
              >
                <div>
                  <span className="font-semibold text-red-300">Marcos (Oficina c/ Plano Vencido)</span>
                  <span className="text-[10px] text-zinc-500 block">Speed Racing • Testar bloqueio de login</span>
                </div>
                <span className="text-[10px] text-red-400 font-mono font-bold px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30">
                  VENCIDO
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <div className="text-center text-xs text-zinc-500">
          Não tem uma conta para sua oficina?{" "}
          <Link href="/register" className="text-orange-400 font-semibold hover:underline">
            Cadastrar nova oficina
          </Link>
        </div>
      </div>

      {/* Subscription Expired Blocking Modal */}
      {expiredBlock && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-zinc-950 border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100 relative">
            <button
              onClick={() => setExpiredBlock(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-500/20 animate-bounce">
                <CalendarX className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Login Bloqueado • Assinatura Vencida</span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  O plano da oficina {expiredBlock.tenant.name} venceu
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                  Não é permitido fazer login enquanto a assinatura da oficina estiver vencida.
                  Para desbloquear o acesso de <strong>{expiredBlock.user.name}</strong> e de toda a equipe, realize a renovação agora.
                </p>
              </div>

              {/* Renewal Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan("MONTHLY")}
                  className={`p-4 rounded-2xl border transition-all ${
                    selectedPlan === "MONTHLY"
                      ? "bg-zinc-900 border-orange-500 ring-2 ring-orange-500/30"
                      : "bg-zinc-900/50 border-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">Plano Mensal</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedPlan === "MONTHLY"
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-zinc-700"
                      }`}
                    >
                      {selectedPlan === "MONTHLY" && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                  <div className="text-lg font-black text-white">R$ 280</div>
                  <span className="text-[10px] text-zinc-400">Ciclo de 30 dias</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlan("ANNUAL")}
                  className={`p-4 rounded-2xl border transition-all relative ${
                    selectedPlan === "ANNUAL"
                      ? "bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/40"
                      : "bg-zinc-900/50 border-zinc-800"
                  }`}
                >
                  <span className="absolute -top-2 right-3 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-orange-500 text-white">
                    Economize R$ 1.360
                  </span>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">Plano Anual</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedPlan === "ANNUAL"
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-zinc-700"
                      }`}
                    >
                      {selectedPlan === "ANNUAL" && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                  <div className="text-lg font-black text-white">R$ 2.000</div>
                  <span className="text-[10px] text-zinc-400">Ciclo de 365 dias (~R$ 166/mês)</span>
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={isRenewing}
                  onClick={handleRenewAndUnlock}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isRenewing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Renovando e Liberando Acesso...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>
                        Renovar {selectedPlan === "ANNUAL" ? "Plano Anual (R$ 2.000)" : "Plano Mensal (R$ 280)"} e Entrar
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setExpiredBlock(null)}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Voltar para tela de login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
