"use client";

import React from "react";
import Link from "next/link";
import {
  Wrench,
  Bike,
  ClipboardList,
  Package,
  Printer,
  MessageCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  CreditCard,
  Building2,
  Search,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function LandingPage() {
  const { tenant } = useMotoShop();

  const features = [
    {
      icon: Search,
      title: "Busca Rápida por Placa (3 Taps)",
      desc: "Digite a placa Mercosul e visualize instantaneamente o histórico de manutenções e abra uma Nova OS sem complicação.",
    },
    {
      icon: ClipboardList,
      title: "Kanban Visual de Bancada",
      desc: "Acompanhe cada moto do status 'Aberta' até 'Entregue' com alertas de aguardando peças e aprovação do cliente.",
    },
    {
      icon: Printer,
      title: "Impressão A4 & Térmica 80mm",
      desc: "Emita ordens de serviço profissionais com logotipo da oficina, checklist, termos de garantia e cupom para impressoras térmicas.",
    },
    {
      icon: Package,
      title: "Baixa Automática no Estoque",
      desc: "Peças adicionadas na OS são descontadas em tempo real com alertas visuais para itens abaixo do estoque mínimo.",
    },
    {
      icon: MessageCircle,
      title: "Notificações via WhatsApp",
      desc: "Envie orçamento para aprovação e avise o cliente que a moto está pronta com mensagens pré-formatadas em 1 clique.",
    },
    {
      icon: Clock,
      title: "Cronômetro de Produtividade",
      desc: "Meça o tempo exato que cada mecânico gasta por serviço e descubra a real lucratividade da sua mão de obra.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-zinc-100 selection:bg-orange-500 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xl text-white tracking-tight">MotoShop</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 ml-2">
                SaaS B2B
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">
              Funcionalidades
            </a>
            <a href="#mechanic-flow" className="hover:text-white transition-colors">
              Fluxo do Mecânico
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Planos & Preços
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white px-3 py-2"
            >
              Entrar
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
            >
              <span>Acessar Painel Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-orange-500/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>O Sistema Definitivo para Oficinas de Motocicletas</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Gestão de Oficinas de Motos <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
              Rápida, Moderna e Móvel
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400">
            Do atendimento na bancada com busca por placa até a baixa no estoque e impressão térmica
            80mm. Criado especialmente para a rotina dinâmica de mecânicos e autopeças.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2.5 active:scale-95 transition-all"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>Experimentar Grátis no Navegador</span>
            </Link>

            <Link
              href="/orders/new"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-base flex items-center justify-center gap-2 transition-colors"
            >
              <ClipboardList className="w-5 h-5 text-orange-400" />
              <span>Testar Abertura de OS</span>
            </Link>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-tenant isolado
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Impressão A4 e 80mm
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Avisos no WhatsApp
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mobile-first p/ celular
            </span>
          </div>
        </div>
      </section>

      {/* Mechanic 3-Tap Flow Demonstration */}
      <section id="mechanic-flow" className="py-20 px-6 bg-zinc-950 border-y border-zinc-800/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Bike className="w-4 h-4" />
              <span>UX Crítico na Bancada</span>
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              O Fluxo do Mecânico em 3 Taps
            </h3>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm">
              Sem burocracia. O mecânico acessa pelo smartphone na bancada com as mãos sujas de graxa e finaliza a OS em segundos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-lg border border-orange-500/30">
                1
              </div>
              <h4 className="font-bold text-lg text-white">Tap 1: Busca por Placa</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Campo de busca central em destaque com suporte a máscara Mercosul (ex: BRA2E19) e reconhecimento imediato do modelo da moto.
              </p>
              <div className="p-3 bg-zinc-950 rounded-xl font-mono text-xs text-orange-400 border border-zinc-800">
                BRA2E19 ➔ Honda CG 160 Titan (2022)
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-lg border border-orange-500/30">
                2
              </div>
              <h4 className="font-bold text-lg text-white">Tap 2: Card Instantâneo</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Exibe o histórico completo de manutenções, último KM registrado e o botão direto "Abrir Nova OS" ou "Ver Última Revisão".
              </p>
              <div className="p-3 bg-zinc-950 rounded-xl text-xs text-zinc-300 border border-zinc-800">
                28.450 KM • Última troca de óleo há 3.450 km ⚠️
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-lg border border-orange-500/30">
                3
              </div>
              <h4 className="font-bold text-lg text-white">Tap 3: Peças & Impressão</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Adiciona peças do estoque com autocomplete (dando baixa automática), calcula os totais e imprime em bobina térmica 80mm.
              </p>
              <div className="p-3 bg-zinc-950 rounded-xl text-xs text-emerald-400 font-mono border border-zinc-800">
                Estoque atualizado • Cupom 80mm gerado
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Tudo o que sua oficina precisa em uma única tela
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm">
            Recursos projetados especificamente para a rotina de motocicletas e autopeças
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-orange-500/40 hover:bg-zinc-900 transition-all space-y-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-white">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto space-y-12 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Planos Transparentes para Oficinas de Todos os Portes
            </h2>
            <p className="text-zinc-400 text-sm max-w-lg mx-auto">
              Comece no plano gratuito ou acelere sua oficina com recursos profissionais ilimitados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Free */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Free</h3>
                <p className="text-xs text-zinc-400 mt-1">Para mecânicos autônomos</p>
                <div className="my-4">
                  <span className="text-4xl font-black text-white">R$ 0</span>
                  <span className="text-xs text-zinc-500 ml-1">para sempre</span>
                </div>
                <ul className="space-y-2 text-xs text-zinc-300 border-t border-zinc-800 pt-4">
                  <li>• 1 Usuário mecânico</li>
                  <li>• Até 30 OS por mês</li>
                  <li>• Até 50 peças no estoque</li>
                  <li>• Impressão de OS em Folha A4</li>
                </ul>
              </div>
              <Link
                href="/dashboard"
                className="mt-6 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs text-center block"
              >
                Começar Grátis
              </Link>
            </div>

            {/* Pro (Highlighted) */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-orange-500 flex flex-col justify-between shadow-2xl relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white shadow">
                Mais Escolhido
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">Pro</h3>
                <p className="text-xs text-zinc-400 mt-1">Para oficinas profissionais</p>
                <div className="my-4">
                  <span className="text-4xl font-black text-white">R$ 149</span>
                  <span className="text-xs text-zinc-500 ml-1">/ mês</span>
                </div>
                <ul className="space-y-2 text-xs text-zinc-300 border-t border-zinc-800 pt-4">
                  <li>• Até 10 usuários simultâneos</li>
                  <li>• Ordens de Serviço ILIMITADAS</li>
                  <li>• Peças e Estoque ILIMITADOS</li>
                  <li>• Impressão Térmica 80mm e A4</li>
                  <li>• Disparos de WhatsApp automáticos</li>
                  <li>• Cronômetro de serviço na bancada</li>
                </ul>
              </div>
              <Link
                href="/dashboard"
                className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs text-center block shadow-lg shadow-orange-500/25"
              >
                Experimentar 14 Dias Grátis
              </Link>
            </div>

            {/* Starter */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Starter</h3>
                <p className="text-xs text-zinc-400 mt-1">Para equipes pequenas</p>
                <div className="my-4">
                  <span className="text-4xl font-black text-white">R$ 79</span>
                  <span className="text-xs text-zinc-500 ml-1">/ mês</span>
                </div>
                <ul className="space-y-2 text-xs text-zinc-300 border-t border-zinc-800 pt-4">
                  <li>• Até 3 usuários</li>
                  <li>• Ordens de Serviço ilimitadas</li>
                  <li>• Até 200 peças no estoque</li>
                  <li>• Alertas de estoque mínimo</li>
                </ul>
              </div>
              <Link
                href="/dashboard"
                className="mt-6 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs text-center block"
              >
                Assinar Starter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-10 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-zinc-300">MotoShop SaaS</span>
            <span>— Gestão de Oficinas de Motos e Autopeças</span>
          </div>
          <p>© {new Date().getFullYear()} MotoShop SaaS. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
