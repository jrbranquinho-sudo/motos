"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Smartphone,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";

export function FirstAccessModal() {
  const { currentUser, updateUser } = useMotoShop();

  // Check if first access is required
  const needsFirstAccess =
    currentUser &&
    (currentUser.mustChangePassword ||
      currentUser.password === "mot-os123" ||
      currentUser.password === "123");

  const [step, setStep] = useState<"2FA" | "PASSWORD" | "SUCCESS">("2FA");

  // 2FA state
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("849201");
  const [twoFactorError, setTwoFactorError] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate a realistic 6-digit 2FA code
  useEffect(() => {
    if (needsFirstAccess) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setStep("2FA");
      setTwoFactorCode("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [currentUser?.id, needsFirstAccess]);

  if (!needsFirstAccess) {
    return null;
  }

  // Security Criteria validations
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword);
  const isDifferentFromDefault =
    newPassword.toLowerCase() !== "mot-os123" &&
    newPassword !== "123" &&
    newPassword !== "";
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const allCriteriaMet =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSymbol &&
    isDifferentFromDefault &&
    passwordsMatch;

  // Password Strength Score (0 to 100)
  const strengthScore = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSymbol,
    isDifferentFromDefault,
  ].filter(Boolean).length;

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError("");

    const cleanInput = twoFactorCode.replace(/\D/g, "");
    if (cleanInput.length !== 6) {
      setTwoFactorError("Digite o código de 6 dígitos completo.");
      return;
    }

    if (cleanInput !== generatedCode) {
      setTwoFactorError("Código 2FA incorreto ou expirado. Tente novamente.");
      return;
    }

    setStep("PASSWORD");
  };

  const handleAutoFillCode = () => {
    setTwoFactorCode(generatedCode);
    setTwoFactorError("");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!allCriteriaMet) {
      setPasswordError("Atenda a todos os requisitos de segurança antes de prosseguir.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      updateUser(currentUser.id, {
        password: newPassword,
        mustChangePassword: false,
      });

      setStep("SUCCESS");
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 rounded-3xl bg-zinc-900 border border-orange-500/40 shadow-2xl shadow-orange-950/40 p-6 sm:p-8 text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* STEP 1: 2-FACTOR AUTHENTICATION */}
        {step === "2FA" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto shadow-lg shadow-orange-500/20">
                <Smartphone className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-orange-400 uppercase">
                Etapa 1 de 2 • Verificação em Duas Etapas
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Verificação de 2 Fatores (2FA)
              </h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Olá, <strong>{currentUser.name}</strong> ({currentUser.role}). Para proteger o seu primeiro acesso ao sistema, confirme o código de autenticação enviado ao seu dispositivo.
              </p>
            </div>

            {/* Simulated 2FA Delivery Banner */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-orange-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-300">
                  <ShieldCheck className="w-4 h-4 text-orange-400" />
                  <span>Código de Segurança Enviado</span>
                </div>
                <span className="text-[10px] font-mono bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30">
                  Simulação 2FA Ativa
                </span>
              </div>

              <div className="flex items-center justify-between bg-zinc-900/90 p-3 rounded-xl border border-zinc-800">
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono">
                    Token Gerado:
                  </span>
                  <span className="font-mono text-2xl font-black tracking-widest text-white">
                    {generatedCode}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1 transition-colors"
                    title="Copiar código"
                  >
                    {copiedCode ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoFillCode}
                    className="px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-xs font-bold transition-all"
                  >
                    Preencher Automático
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-zinc-500">
                Dispositivo: WhatsApp / SMS ({currentUser.phone || "(11) 9****-****"})
              </p>
            </div>

            {/* 2FA Form */}
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5 text-center">
                  Digite o código de 6 dígitos recebido:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => {
                    setTwoFactorCode(e.target.value.replace(/\D/g, ""));
                    setTwoFactorError("");
                  }}
                  placeholder="000000"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-2xl py-3.5 text-center font-mono text-2xl tracking-[0.4em] font-black text-white focus:outline-none shadow-inner"
                  autoFocus
                  required
                />
              </div>

              {twoFactorError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2 justify-center">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{twoFactorError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Validar Código 2FA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: MANDATORY PASSWORD CHANGE */}
        {step === "PASSWORD" && (
          <div className="space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto shadow-lg shadow-orange-500/20">
                <KeyRound className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 2FA Validado • Etapa 2 de 2
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Criar Nova Senha de Acesso
              </h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                A senha provisória padrão <code>mot-os123</code> expirou. Por segurança da oficina, você deve cadastrar uma nova senha forte.
              </p>
            </div>

            {/* Error Message */}
            {passwordError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* New Password Input */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Nova Senha *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError("");
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-3 pr-10 py-2.5 text-sm text-zinc-100 font-mono focus:border-orange-500 focus:outline-none"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Confirmar Nova Senha *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repita exatamente a nova senha"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError("");
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-3 pr-10 py-2.5 text-sm text-zinc-100 font-mono focus:border-orange-500 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Força da Senha:</span>
                  <span className="font-bold">
                    {strengthScore <= 2 && <span className="text-red-400">Fraca</span>}
                    {strengthScore === 3 || strengthScore === 4 ? (
                      <span className="text-amber-400">Média</span>
                    ) : null}
                    {strengthScore >= 5 && <span className="text-emerald-400">Forte & Segura</span>}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden flex gap-1">
                  <div
                    className={`h-full flex-1 rounded-full transition-all ${
                      strengthScore >= 1
                        ? strengthScore <= 2
                          ? "bg-red-500"
                          : strengthScore <= 4
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                        : "bg-zinc-800"
                    }`}
                  />
                  <div
                    className={`h-full flex-1 rounded-full transition-all ${
                      strengthScore >= 3
                        ? strengthScore <= 4
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                        : "bg-zinc-800"
                    }`}
                  />
                  <div
                    className={`h-full flex-1 rounded-full transition-all ${
                      strengthScore >= 5 ? "bg-emerald-500" : "bg-zinc-800"
                    }`}
                  />
                </div>
              </div>

              {/* Interactive Security Checklist */}
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider block">
                  Requisitos de Segurança Obrigatórios:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400 font-semibold" : "text-zinc-500"}`}>
                    {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Mínimo de 8 caracteres</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-400 font-semibold" : "text-zinc-500"}`}>
                    {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Letra maiúscula (A-Z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-400 font-semibold" : "text-zinc-500"}`}>
                    {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Letra minúscula (a-z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-400 font-semibold" : "text-zinc-500"}`}>
                    {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Número (0-9)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasSymbol ? "text-emerald-400 font-semibold" : "text-zinc-500"}`}>
                    {hasSymbol ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Símbolo especial (!@#$...)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${isDifferentFromDefault ? "text-emerald-400 font-semibold" : "text-zinc-500"}`}>
                    {isDifferentFromDefault ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Diferente de mot-os123</span>
                  </div>
                </div>

                <div className={`pt-2 border-t border-zinc-900 flex items-center gap-1.5 text-[11px] ${passwordsMatch ? "text-emerald-400 font-bold" : "text-zinc-500"}`}>
                  {passwordsMatch ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                  <span>Confirmação idêntica à nova senha</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!allCriteriaMet || isSubmitting}
                className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${
                  allCriteriaMet && !isSubmitting
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 active:scale-98 cursor-pointer"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? "Salvando Nova Senha..." : "Salvar Senha & Ativar Meu Acesso"}</span>
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === "SUCCESS" && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Senha Alterada com Sucesso!</h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Sua conta de <strong>{currentUser.name}</strong> foi ativada e protegida com verificação em duas etapas e senha de alta segurança.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                // The modal will unmount automatically because currentUser.mustChangePassword is now false
              }}
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all active:scale-95"
            >
              Acessar o Sistema Agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
