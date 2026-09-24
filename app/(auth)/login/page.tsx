"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  ArrowRight,
  ShieldCheck,
  Lock,
  User as UserIcon,
  AlertTriangle,
  KeyRound,
  Sparkles,
  CalendarX,
  CreditCard,
  Check,
  RefreshCw,
  X,
  Smartphone,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { MotOsLogo } from "@/components/common/MotOsLogo";
import { getSubscriptionInfo, SubscriptionInfo } from "@/lib/subscription";
import { Tenant, User } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { tenant, tenants, setTenant, users, updateUser, login, renewSubscription } = useMotoShop();

  // Steps: 'CREDENTIALS' -> '2FA' -> 'FIRST_PASSWORD_CHANGE'
  const [step, setStep] = useState<"CREDENTIALS" | "2FA" | "FIRST_PASSWORD_CHANGE">("CREDENTIALS");

  // Credential inputs (clean, no auto-fill)
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Authenticated candidate user
  const [candidateUser, setCandidateUser] = useState<User | null>(null);

  // 2FA state
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [simulatedToken, setSimulatedToken] = useState("660284");
  const [copiedToken, setCopiedToken] = useState(false);

  // First password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Expired plan modal state
  const [expiredBlock, setExpiredBlock] = useState<{
    tenant: Tenant;
    user: User;
    subInfo: SubscriptionInfo;
  } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");
  const [isRenewing, setIsRenewing] = useState(false);

  // Close modals or go back on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (expiredBlock) {
          setExpiredBlock(null);
        } else if (step === "2FA") {
          setStep("CREDENTIALS");
          setErrorMsg("");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expiredBlock, step]);

  // Generate random token when entering 2FA
  const handleProceedTo2FA = (user: User) => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedToken(randomCode);
    setTwoFactorCode("");
    setCandidateUser(user);
    setStep("2FA");
    setErrorMsg("");
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setExpiredBlock(null);

    const clean = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!clean || !cleanPass) {
      setErrorMsg("Preencha usuário/e-mail e senha para continuar.");
      return;
    }

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
      setErrorMsg("Senha incorreta. Verifique suas credenciais.");
      return;
    }

    // Check subscription if workshop user
    const targetTenant = tenants.find((t) => t.id === foundUser.tenantId) || tenant;
    if (foundUser.role !== "SUPER_ADMIN") {
      const subInfo = getSubscriptionInfo(targetTenant);
      if (subInfo.isExpired) {
        setExpiredBlock({
          tenant: targetTenant,
          user: foundUser,
          subInfo,
        });
        return;
      }
    }

    // Advance to 2FA verification step
    handleProceedTo2FA(foundUser);
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanCode = twoFactorCode.trim().replace(/\D/g, "");
    if (cleanCode.length !== 6) {
      setErrorMsg("Digite o código de 6 dígitos recebido.");
      return;
    }

    if (!candidateUser) return;

    // Check if first login requires changing password
    if (candidateUser.mustChangePassword) {
      setStep("FIRST_PASSWORD_CHANGE");
      return;
    }

    // Finish login directly
    login(candidateUser);
    router.push("/dashboard");
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!candidateUser) return;

    if (newPassword.length < 6) {
      setErrorMsg("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (newPassword === "mot-os123" || newPassword === "123") {
      setErrorMsg("A nova senha não pode ser a senha provisória padrão.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("A confirmação de senha não confere.");
      return;
    }

    // Update user: save new password and disable mustChangePassword
    updateUser(candidateUser.id, {
      password: newPassword,
      mustChangePassword: false,
    });

    const updatedUser: User = {
      ...candidateUser,
      password: newPassword,
      mustChangePassword: false,
    };

    login(updatedUser);
    router.push("/dashboard");
  };

  const handleCopyToken = () => {
    setTwoFactorCode(simulatedToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleRenewAndUnlock = () => {
    if (!expiredBlock) return;
    setIsRenewing(true);
    setTimeout(() => {
      renewSubscription(expiredBlock.tenant.id, selectedPlan);
      setIsRenewing(false);
      const unlockedUser = expiredBlock.user;
      setExpiredBlock(null);
      handleProceedTo2FA(unlockedUser);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <MotOsLogo size={56} className="mx-auto" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Mot-OS
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Portal de Acesso Seguro • Motos, Carros, Caminhões e Náutica
          </p>
        </div>

        {/* STEP 1: CREDENTIALS */}
        {step === "CREDENTIALS" && (
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">Identificação</h2>
              <p className="text-xs text-zinc-400">
                Insira suas credenciais para autenticar
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">
                  Usuário ou E-mail
                </label>
                <div className="relative">
                    <input
                      type="text"
                      placeholder="usuário ou usuario@email.com.br"
                      value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setErrorMsg("");
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                    autoFocus
                    required
                  />
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Sua senha de acesso"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg("");
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                    required
                  />
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Prosseguir para 2FA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Autenticação em 2 Etapas Ativa
              </span>
              <span>Pressione ESC para cancelar</span>
            </div>
          </div>
        )}

        {/* STEP 2: 2FA VERIFICATION */}
        {step === "2FA" && (
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>2FA Obrigatório</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">Código de Segurança</h2>
                <p className="text-xs text-zinc-400">
                  Olá, <strong>{candidateUser?.name}</strong>. Confirme o código de verificação.
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>

            {/* Helper Token Card for easy sales demos */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                  Token Seguro Mot-OS (SMS / Authenticator)
                </span>
                <span className="text-xl font-mono font-black text-emerald-400 tracking-wider">
                  {simulatedToken}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyToken}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors flex items-center gap-1.5"
              >
                {copiedToken ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Inserido!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Inserir Código</span>
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">
                  Digite o código de 6 dígitos
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={twoFactorCode}
                  onChange={(e) => {
                    setTwoFactorCode(e.target.value.replace(/\D/g, ""));
                    setErrorMsg("");
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3 text-center text-2xl font-mono font-bold tracking-[0.3em] text-white focus:border-emerald-500 focus:outline-none"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Validar e Entrar</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("CREDENTIALS");
                  setErrorMsg("");
                }}
                className="w-full py-2 text-center text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Voltar para tela inicial (ou pressione ESC)
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: FIRST LOGIN PASSWORD CHANGE */}
        {step === "FIRST_PASSWORD_CHANGE" && (
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Primeiro Acesso Detectado</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">Crie sua Nova Senha</h2>
              <p className="text-xs text-zinc-400">
                Por políticas de segurança, substitua a senha provisória antes de acessar o sistema.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">
                  Nova Senha Definitiva
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrorMsg("");
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-10 py-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                    autoFocus
                    required
                  />
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMsg("");
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                    required
                  />
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Salvar Nova Senha e Abrir Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}


      </div>

      {/* Subscription Expired Blocking Modal (With ESC close) */}
      {expiredBlock && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-zinc-950 border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100 relative max-h-[90vh] overflow-y-auto my-auto">
            <button
              onClick={() => setExpiredBlock(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Fechar (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-500/20 animate-bounce">
                <CalendarX className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
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
                  <div className="text-lg font-black text-white">R$ 180</div>
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
                    Economize R$ 960
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
                  <div className="text-lg font-black text-white">R$ 1.200</div>
                  <span className="text-[10px] text-zinc-400">Ciclo de 365 dias (~R$ 100/mês)</span>
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
                        Renovar {selectedPlan === "ANNUAL" ? "Plano Anual (R$ 1.200)" : "Plano Mensal (R$ 180)"} e Entrar
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
                  Fechar janela (ESC)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
