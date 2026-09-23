"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, ArrowRight, Building2, UserCheck, ShieldCheck } from "lucide-react";
import { useMotoShop } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const { setTenant, tenants } = useMotoShop();

  const [shopName, setShopName] = useState("");
  const [slug, setSlug] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !slug) return;

    const newTenant = {
      id: `tenant-${Date.now()}`,
      name: shopName,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ""),
      plan: "PRO" as const,
      createdAt: new Date().toISOString(),
    };

    setTenant(newTenant);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-orange-500/30">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Criar Conta no MotoShop</h1>
          <p className="text-xs text-zinc-400">
            Cadastre sua oficina e teste 14 dias grátis com tudo liberado
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-4"
        >
          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-1">Nome da Oficina *</label>
            <input
              type="text"
              placeholder="Ex: MotoCenter Racing"
              value={shopName}
              onChange={(e) => {
                setShopName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
              }}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-1">Seu Nome (Responsável) *</label>
            <input
              type="text"
              placeholder="Seu nome completo"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-1">E-mail de Acesso *</label>
            <input
              type="email"
              placeholder="seuemail@oficina.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-1">Senha *</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 pt-3"
          >
            <span>Iniciar Teste Grátis de 14 Dias</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500">
          Já tem uma oficina cadastrada?{" "}
          <Link href="/login" className="text-orange-400 font-semibold hover:underline">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}
