"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Building2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Bike,
  Car,
  Truck,
  Anchor,
  Wrench,
  Upload,
  User,
  Phone,
  Mail,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { WorkshopType } from "@/lib/types";
import { CpfCnpjInput } from "@/components/common/CpfCnpjInput";

export default function SettingsPage() {
  const { tenant, updateTenant, currentUser, isMechanic } = useMotoShop();

  const [name, setName] = useState(tenant.name);
  const [slug, setSlug] = useState(tenant.slug);
  const [cnpj, setCnpj] = useState(tenant.cnpj || "");
  const [phone, setPhone] = useState(tenant.phone || "");
  const [address, setAddress] = useState(tenant.address || "");
  const [workshopType, setWorkshopType] = useState<WorkshopType>(tenant.workshopType || "MOTOS");
  const [responsibleName, setResponsibleName] = useState(currentUser.name || "");
  const [saved, setSaved] = useState(false);

  if (isMechanic) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Acesso Restrito às Configurações</h2>
        <p className="text-slate-400 text-xs mb-6 leading-relaxed">
          Mecânicos não possuem permissão para alterar ou visualizar as configurações cadastrais da oficina.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-lg shadow-blue-600/20"
        >
          Voltar para Minhas OS
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenant(tenant.id, {
      name,
      slug,
      cnpj,
      phone,
      address,
      workshopType,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const workshopSegments: {
    id: WorkshopType;
    label: string;
    desc: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      id: "MOTOS",
      label: "Oficina de Motos",
      desc: "Motos, Scooters, Ciclomotores e Quadriciclos (Honda, Yamaha, BMW, etc.)",
      icon: Bike,
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    },
    {
      id: "CARROS",
      label: "Mecânica de Carros",
      desc: "Automóveis, SUVs, Vans e Utilitários Leves (VW, Chevrolet, Fiat, Toyota...)",
      icon: Car,
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    },
    {
      id: "CAMINHOES",
      label: "Caminhões & Pesados",
      desc: "Caminhões, Cavalos Mecânicos, Ônibus e Reboques (Scania, Mercedes, Volvo...)",
      icon: Truck,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    {
      id: "NAUTICA",
      label: "Oficina Náutica",
      desc: "Lanchas, Jetskis, Botes e Motores de Popa (Mercury, Yamaha Náutica, Sea-Doo...)",
      icon: Anchor,
      color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    },
    {
      id: "GERAL",
      label: "Multimarcas / Geral",
      desc: "Atende todos os tipos de veículos no mesmo sistema",
      icon: Wrench,
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-500" />
          <span>Configurações da Oficina</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Personalize as informações que aparecem nos documentos, no catálogo de veículos e no sistema
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configurações da oficina salvas com sucesso! O catálogo de veículos foi atualizado.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* DADOS DA OFICINA matching dump 155133 */}
        <div className="p-5 rounded-2xl bg-[#0d111a] border border-slate-800/80 shadow-xl space-y-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            DADOS DA OFICINA
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Nome da Oficina *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Oficina do João Mecânica"
              className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-semibold focus:border-blue-500 focus:outline-none"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1">Aparece no cabeçalho das ordens de serviço (PDF e impressão).</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Responsável</label>
              <input
                type="text"
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
                placeholder="Nome do responsável"
                className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">WhatsApp / Telefone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(67) 99220-3788"
                className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* SEGMENTO DA OFICINA */}
          <div className="pt-2">
            <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
              Tipo / Segmento da Oficina *
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              Define quais marcas e modelos de veículos serão carregados automaticamente no cadastro de veículos e ordens de serviço.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {workshopSegments.map((seg) => {
                const Icon = seg.icon;
                const isSelected = workshopType === seg.id;
                return (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => setWorkshopType(seg.id)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-blue-600/15 border-blue-500 ring-1 ring-blue-500 shadow-md shadow-blue-500/10"
                        : "bg-[#090d16] border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className={`p-1.5 rounded-lg border ${seg.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-300"}`}>
                        {seg.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                      {seg.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LOGO DA OFICINA matching dump 155133 */}
          <div className="pt-2">
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Logo da Oficina (PNG, JPG OU SVG)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Escolher arquivo</span>
                <input type="file" accept="image/*" className="hidden" />
              </label>
              <span className="text-[11px] text-slate-500">Nenhum arquivo escolhido</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Recomendado: fundo transparente, tamanho mínimo 200x200px.</p>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salvar configurações</span>
            </button>
          </div>
        </div>

        {/* CONTA matching dump 155133 */}
        <div className="p-5 rounded-2xl bg-[#0d111a] border border-slate-800/80 shadow-xl space-y-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            CONTA & ASSINATURA
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">E-mail Cadastrado:</span>
              <span className="text-slate-200 font-mono font-medium">{currentUser.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">CNPJ/CPF:</span>
              <span className="text-slate-200 font-mono font-medium">{tenant.cnpj || "Não informado"}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Status do Plano:</span>
              <span className="text-emerald-400 font-bold">
                {tenant.plan === "TRIAL" || tenant.isTrial ? "Demonstração (7 Dias)" : `Plano ${tenant.plan}`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Gerenciar Assinatura:</span>
              <Link href="/settings/billing" className="text-blue-400 hover:underline font-semibold">
                Ver Detalhes do Plano →
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
