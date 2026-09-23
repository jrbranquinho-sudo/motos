"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Settings, Building2, Save, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { useMotoShop } from "@/lib/store";

export default function SettingsPage() {
  const { tenant, setTenant, currentUser, isMechanic } = useMotoShop();

  const [name, setName] = useState(tenant.name);
  const [slug, setSlug] = useState(tenant.slug);
  const [cnpj, setCnpj] = useState(tenant.cnpj || "");
  const [phone, setPhone] = useState(tenant.phone || "");
  const [address, setAddress] = useState(tenant.address || "");
  const [saved, setSaved] = useState(false);

  if (isMechanic) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acesso Restrito às Configurações</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Mecânicos não possuem permissão para alterar ou visualizar as configurações cadastrais da oficina.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors shadow-lg shadow-orange-500/20"
        >
          Voltar para Minhas OS
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setTenant({
      ...tenant,
      name,
      slug,
      cnpj,
      phone,
      address,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setName(tenant.name);
    setSlug(tenant.slug);
    setCnpj(tenant.cnpj || "");
    setPhone(tenant.phone || "");
    setAddress(tenant.address || "");
    setSaved(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-orange-500" />
          <span>Configurações da Oficina</span>
        </h1>
        <p className="text-sm text-zinc-400">
          Dados cadastrais da sua empresa que aparecem no cabeçalho das Ordens de Serviço
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Configurações salvas com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
        <div>
          <label className="text-xs font-bold text-zinc-300 block mb-1">Nome Fantasia da Oficina *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 font-semibold focus:border-orange-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-1">Subdomínio (Slug) *</label>
            <div className="flex items-center rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-zinc-100">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="w-full bg-transparent focus:outline-none font-mono text-orange-400"
                required
              />
              <span className="text-zinc-500 text-xs select-none">.motoshop.com</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-1">CNPJ da Empresa</label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              placeholder="00.000.000/0001-00"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 font-mono focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-1">WhatsApp / Telefone de Contato</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 98765-4321"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 font-mono focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-1">Endereço Completo</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Av. Exemplo, 123 - Bairro, Cidade - UF"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm transition-colors"
          >
            <span>Cancelar</span>
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </div>
  );
}
