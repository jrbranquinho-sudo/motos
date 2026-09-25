"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Bike,
  Car,
  Truck,
  Ship,
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
  Check,
  Lock,
  User,
  Mail,
  Phone,
  X,
  BadgeCheck,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { WorkshopType } from "@/lib/types";
import { MotOsLogo } from "@/components/common/MotOsLogo";
import { INITIAL_OFFICIAL_PLANS, PlanConfig } from "@/lib/subscription";

export default function LandingPage() {
  const { tenant, isAuthenticated, isLoaded, registerTrialDemo, plans: storePlans } = useMotoShop();
  const router = useRouter();

  // Dynamic official plans state (synced with Master updates)
  const [plans, setPlans] = useState<PlanConfig[]>(INITIAL_OFFICIAL_PLANS);

  useEffect(() => {
    if (storePlans && storePlans.length > 0) {
      setPlans(storePlans);
    }
    // Also fetch latest public plans from API
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.plans) && data.plans.length > 0) {
          setPlans(data.plans);
        }
      })
      .catch((e) => console.log("Usando planos locais:", e));
  }, [storePlans]);

  // Trial Modal State
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [trialOwnerName, setTrialOwnerName] = useState("");
  const [trialEmail, setTrialEmail] = useState("");
  const [trialPassword, setTrialPassword] = useState("");
  const [trialPhone, setTrialPhone] = useState("");
  const [trialShopName, setTrialShopName] = useState("");
  const [trialWorkshopType, setTrialWorkshopType] = useState<WorkshopType>("MOTOS");
  const [isSubmittingTrial, setIsSubmittingTrial] = useState(false);
  const [trialSuccessMsg, setTrialSuccessMsg] = useState("");

  // Active showcase segment
  const [activeSegment, setActiveSegment] = useState<WorkshopType>("MOTOS");

  useEffect(() => {
    if (isLoaded && isAuthenticated) {
      const savedRoute =
        (typeof window !== "undefined" && sessionStorage.getItem("motoshop_last_route")) ||
        "/dashboard";
      router.replace(savedRoute);
    }
  }, [isLoaded, isAuthenticated, router]);

  if (!isLoaded || isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleRegisterTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialShopName.trim() || !trialOwnerName.trim() || !trialEmail.trim() || !trialPhone.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios para ativar o teste gratuito.");
      return;
    }

    setIsSubmittingTrial(true);

    try {
      const result = registerTrialDemo({
        ownerName: trialOwnerName.trim(),
        email: trialEmail.trim(),
        password: trialPassword.trim() || "motos123",
        phone: trialPhone.trim(),
        shopName: trialShopName.trim(),
        workshopType: trialWorkshopType,
      });

      setTrialSuccessMsg(`Oficina "${result.tenant.name}" cadastrada com sucesso! Iniciando seu período de 7 dias grátis...`);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar oficina para teste.");
      setIsSubmittingTrial(false);
    }
  };

  const segments = [
    {
      id: "MOTOS" as WorkshopType,
      name: "Oficinas de Motos",
      icon: Bike,
      color: "from-blue-600 to-indigo-600",
      accent: "text-blue-400",
      border: "border-blue-500/40",
      badge: "Street, Trail, Scooters & Esportivas",
      marcas: "Honda, Yamaha, BMW Motorrad, Kawasaki, Suzuki, Harley-Davidson, Triumph, Royal Enfield, Shineray, Dafra...",
      desc: "Busca rápida por placa Mercosul, ordens de revisão, controle de troca de óleo por km, pneus e baixa no estoque de motopeças.",
    },
    {
      id: "CARROS" as WorkshopType,
      name: "Auto Centers & Carros",
      icon: Car,
      color: "from-emerald-600 to-teal-600",
      accent: "text-emerald-400",
      border: "border-emerald-500/40",
      badge: "Leves, Sedans, SUVs & Utilitários",
      marcas: "Volkswagen, Chevrolet, Fiat, Toyota, Hyundai, Renault, Ford, Honda Carros, Jeep, Nissan, BYD, Chery...",
      desc: "Gestão completa de mecânica geral, alinhamento, suspensão, freios, injeção eletrônica e orçamentos aprovados via WhatsApp.",
    },
    {
      id: "CAMINHOES" as WorkshopType,
      name: "Caminhões & Frotas",
      icon: Truck,
      color: "from-amber-600 to-orange-600",
      accent: "text-amber-400",
      border: "border-amber-500/40",
      badge: "Pesados, Cavalos Mecânicos & Carretas",
      marcas: "Mercedes-Benz, Scania, Volvo Caminhões, Volkswagen Caminhões, Iveco, DAF, MAN, Ford Cargo...",
      desc: "Manutenções preventivas pesadas, controle de horímetro, trocas de kits de transmissão, pneus de carga e frotas de transporte.",
    },
    {
      id: "NAUTICA" as WorkshopType,
      name: "Oficinas Náuticas",
      icon: Ship,
      color: "from-cyan-600 to-blue-600",
      accent: "text-cyan-400",
      border: "border-cyan-500/40",
      badge: "Lanchas, Barcos & Motores de Popa",
      marcas: "Yamaha Náutica, Mercury Marine, Sea-Doo, Evinrude, Volvo Penta Náutica, BRP, Honda Náutica...",
      desc: "Controle por horímetro e número de casco/chassi, revisões de motores 2T/4T, rabetas, bombas d'água e marinizações.",
    },
  ];

  const features = [
    {
      icon: Search,
      title: "Busca Rápida por Placa (3 Taps)",
      desc: "Digite a placa Mercosul e localize imediatamente o prontuário de manutenções e abra uma Nova OS sem complicação.",
    },
    {
      icon: ClipboardList,
      title: "Kanban Visual de Bancada",
      desc: "Acompanhe o veículo do status 'Aberto' até 'Finalizado' com alertas visuais de peças aguardando e aprovação do cliente.",
    },
    {
      icon: Printer,
      title: "Impressão A4 & Térmica 80mm",
      desc: "Emita ordens de serviço profissionais com logotipo da sua oficina, checklist veicular, termos de garantia e cupom 80mm.",
    },
    {
      icon: Package,
      title: "Baixa Automática no Estoque",
      desc: "Peças inseridas na OS são debitadas do estoque em tempo real com alertas visuais de reposição e estoque mínimo.",
    },
    {
      icon: MessageCircle,
      title: "Notificações via WhatsApp",
      desc: "Envie orçamento para aprovação e avise o cliente que o veículo está pronto com mensagens pré-formatadas em 1 clique.",
    },
    {
      icon: Clock,
      title: "Comissões & Produtividade",
      desc: "Acompanhe o rendimento de cada mecânico por comissão e hora trabalhada, com DRE financeiro em tempo real.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-zinc-100 selection:bg-blue-600 selection:text-white font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MotOsLogo size={42} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl text-white tracking-tight">Mot-OS</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Sistema p/ Oficinas
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 hidden sm:block">
                Motos • Carros • Caminhões • Náutica
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <a href="#veiculos" className="hover:text-white transition-colors">
              Segmentos Atendidos
            </a>
            <a href="#fluxo" className="hover:text-white transition-colors">
              Fluxo da Bancada
            </a>
            <a href="#funcionalidades" className="hover:text-white transition-colors">
              Funcionalidades
            </a>
            <a href="#precos" className="hover:text-white transition-colors">
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
            <button
              type="button"
              onClick={() => setIsTrialModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Testar 7 Dias Grátis</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistema Operacional de Alto Desempenho para Oficinas</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            O Sistema Inteligente para sua Oficina <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
              Motos, Carros, Caminhões e Náutica
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400">
            Chega de planilhas e anotações de papel. O <strong className="text-white">Mot-OS</strong> carrega automaticamente as marcas e modelos específicos do seu segmento, acelera o atendimento no celular e organiza suas ordens de serviço, estoque e comissões.
          </p>

          {/* Segment badges pill */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-blue-500/30 text-xs font-bold text-blue-300">
              <Bike className="w-3.5 h-3.5 text-blue-400" /> Motos
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-emerald-500/30 text-xs font-bold text-emerald-300">
              <Car className="w-3.5 h-3.5 text-emerald-400" /> Carros
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-amber-500/30 text-xs font-bold text-amber-300">
              <Truck className="w-3.5 h-3.5 text-amber-400" /> Caminhões
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-cyan-500/30 text-xs font-bold text-cyan-300">
              <Ship className="w-3.5 h-3.5 text-cyan-400" /> Náutica
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsTrialModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2.5 active:scale-95 transition-all"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>Solicitar Demonstração Gratuita (7 Dias)</span>
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-base flex items-center justify-center gap-2 transition-colors"
            >
              <Building2 className="w-5 h-5 text-blue-400" />
              <span>Acessar Oficina Demo</span>
            </Link>
          </div>

          {/* Trust guarantee banner */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 7 dias de teste completo
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sem necessidade de cartão
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dados 100% preservados
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ativação rápida pelo WhatsApp
            </span>
          </div>
        </div>
      </section>

      {/* Segment Selector & Catalog Highlights */}
      <section id="veiculos" className="py-20 px-6 bg-zinc-950/80 border-y border-zinc-800/80">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <span>Segmentação Inteligente</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Quais veículos o Mot-OS atende?
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-sm">
              Ao cadastrar sua oficina, você define o segmento atendido e o sistema carrega o catálogo de marcas e modelos exclusivo para você:
            </p>
          </div>

          {/* Segment Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {segments.map((seg) => {
              const Icon = seg.icon;
              const isSelected = activeSegment === seg.id;
              return (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => setActiveSegment(seg.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col items-center sm:items-start gap-2 ${
                    isSelected
                      ? `bg-zinc-900 ${seg.border} ring-2 ring-blue-500/20 shadow-xl`
                      : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${seg.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{seg.name}</h3>
                    <span className="text-[10px] text-zinc-400 block mt-0.5 line-clamp-1">{seg.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Segment Detail Card */}
          {(() => {
            const current = segments.find((s) => s.id === activeSegment) || segments[0];
            const Icon = current.icon;
            return (
              <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-4 max-w-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${current.color} flex items-center justify-center text-white shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                          Catálogo Especializado Integrado
                        </span>
                        <h3 className="text-2xl font-black text-white">{current.name}</h3>
                      </div>
                    </div>

                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {current.desc}
                    </p>

                    <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                      <span className="text-[11px] font-mono uppercase font-bold text-zinc-400 block">
                        Marcas e modelos carregados no sistema:
                      </span>
                      <p className="text-xs text-zinc-300 font-mono">
                        {current.marcas}
                      </p>
                    </div>
                  </div>

                  <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setTrialWorkshopType(current.id);
                        setIsTrialModalOpen(true);
                      }}
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Testar para {current.name}</span>
                    </button>
                    <span className="text-[11px] text-zinc-500 text-center">
                      Período grátis de 7 dias liberado
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Mechanic 3-Tap Flow Demonstration */}
      <section id="fluxo" className="py-20 px-6 bg-zinc-950 border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Velocidade de Bancada</span>
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              O Fluxo do Atendimento em 3 Taps
            </h3>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm">
              Feito para o mecânico usar pelo celular com a mão na massa. Rápido, objetivo e sem burocracia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-lg border border-blue-500/30">
                1
              </div>
              <h4 className="font-bold text-lg text-white">Tap 1: Busca por Placa</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Reconhecimento da placa padrão Mercosul (ex: BRA2E19) e identificação imediata da marca, modelo e ano do veículo.
              </p>
              <div className="p-3 bg-zinc-950 rounded-xl font-mono text-xs text-blue-400 border border-zinc-800">
                BRA2E19 ➔ Histórico & Prontuário Instantâneo
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-lg border border-blue-500/30">
                2
              </div>
              <h4 className="font-bold text-lg text-white">Tap 2: Checklist & Serviços</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Selecione os serviços pré-cadastrados, mão de obra e peças necessárias com autocomplete do estoque e cálculo automático.
              </p>
              <div className="p-3 bg-zinc-950 rounded-xl text-xs text-zinc-300 border border-zinc-800">
                Troca de Óleo + Filtro + Pastilhas de Freio
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-lg border border-blue-500/30">
                3
              </div>
              <h4 className="font-bold text-lg text-white">Tap 3: WhatsApp & Impressão</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Envie o orçamento pronto via WhatsApp em 1 clique e imprima o cupom de bancada em impressora térmica 80mm ou A4.
              </p>
              <div className="p-3 bg-zinc-950 rounded-xl text-xs text-emerald-400 font-mono border border-zinc-800">
                Orçamento enviado • Baixa no estoque efetuada
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="funcionalidades" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Tudo o que sua oficina precisa em um único sistema
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm">
            Módulos completos de gestão desenhados para a realidade diária de oficinas mecânicas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-blue-500/40 hover:bg-zinc-900 transition-all space-y-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
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
      <section id="precos" className="py-20 px-6 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto space-y-12 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Experimente Grátis e Escolha o Melhor Plano
            </h2>
            <p className="text-zinc-400 text-sm max-w-lg mx-auto">
              Teste por 1 semana sem compromisso. Quando decidir contratar, seu sistema é liberado instantaneamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto items-stretch">
            {/* Trial Card */}
            <div className="p-7 rounded-2xl bg-blue-950/20 border-2 border-blue-500/40 flex flex-col justify-between shadow-xl">
              <div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-3">
                  Degustação
                </div>
                <h3 className="text-2xl font-black text-white">Demo 1 Semana</h3>
                <p className="text-xs text-zinc-400 mt-1">Experimente todos os recursos sem custo</p>
                <div className="my-5">
                  <span className="text-4xl sm:text-5xl font-black text-blue-400">R$ 0</span>
                  <span className="text-xs text-zinc-400 ml-2 font-bold">/ 7 dias</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300 border-t border-zinc-800 pt-5">
                  <li className="flex items-center gap-2">• Acesso total a todas as funções por 7 dias</li>
                  <li className="flex items-center gap-2">• Cadastro próprio de login e oficina</li>
                  <li className="flex items-center gap-2">• Ordens de serviço e catálogo do seu veículo</li>
                  <li className="flex items-center gap-2">• Ao fim de 7 dias, pausado até contratação</li>
                  <li className="flex items-center gap-2">• Dados 100% preservados para ativação</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setIsTrialModalOpen(true)}
                className="mt-8 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm text-center block transition-colors shadow-lg shadow-blue-500/20"
              >
                Começar 7 Dias Grátis
              </button>
            </div>

            {/* Dynamic Official Plans Managed by Master */}
            {(plans && plans.length > 0 ? plans : INITIAL_OFFICIAL_PLANS)
              .filter((p) => p.active)
              .map((p) => {
                const isPopular = p.popular || p.id === "ANNUAL";
                return (
                  <div
                    key={p.id}
                    className={`p-7 rounded-2xl flex flex-col justify-between shadow-xl relative ${
                      isPopular
                        ? "bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-blue-500 shadow-2xl"
                        : "bg-zinc-900 border border-zinc-800"
                    }`}
                  >
                    {isPopular && p.savings && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-lg shadow-blue-500/30 whitespace-nowrap">
                        {p.savings}
                      </span>
                    )}
                    <div>
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-3 ${
                          isPopular
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-zinc-800 text-zinc-300 border-zinc-700"
                        }`}
                      >
                        {p.badge || (isPopular ? "Mais Vantajoso" : "Recorrente")}
                      </div>
                      <h3 className="text-2xl font-black text-white">{p.name}</h3>
                      <p className="text-xs text-zinc-400 mt-1">{p.description}</p>
                      <div className="my-5">
                        <span
                          className={`text-4xl sm:text-5xl font-black ${
                            isPopular ? "text-blue-400" : "text-white"
                          }`}
                        >
                          {p.formattedPrice || `R$ ${p.price}`}
                        </span>
                        <span
                          className={`text-xs ml-2 font-bold ${
                            isPopular ? "text-zinc-400" : "text-zinc-500"
                          }`}
                        >
                          {p.periodLabel || (p.durationDays === 365 ? "/ ano" : "/ mês")}
                        </span>
                      </div>
                      <ul className="space-y-2.5 text-xs text-zinc-300 border-t border-zinc-800 pt-5">
                        {p.features && p.features.length > 0 ? (
                          p.features.map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              • {feat}
                            </li>
                          ))
                        ) : (
                          <li className="flex items-center gap-2">• Acesso completo ao sistema</li>
                        )}
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTrialModalOpen(true)}
                      className={`mt-8 w-full py-3.5 rounded-xl font-black text-xs sm:text-sm text-center block transition-all shadow-lg ${
                        isPopular
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25"
                          : "bg-zinc-800 hover:bg-zinc-700 text-white"
                      }`}
                    >
                      {isPopular ? `Garantir ${p.name}` : "Testar & Contratar"}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* Trial Registration Modal */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-zinc-950 border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100 relative my-8">
            <button
              type="button"
              onClick={() => setIsTrialModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-white">
                  Solicitar Demonstração Gratuita (7 Dias)
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Cadastre sua oficina e crie suas credenciais de acesso. O sistema será liberado imediatamente para teste durante 1 semana.
                </p>
              </div>

              {trialSuccessMsg ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                  <BadgeCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-emerald-300">{trialSuccessMsg}</p>
                  <p className="text-xs text-zinc-400">Redirecionando para o seu Dashboard...</p>
                </div>
              ) : (
                <form onSubmit={handleRegisterTrial} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Nome da sua Oficina *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={trialShopName}
                        onChange={(e) => setTrialShopName(e.target.value)}
                        placeholder="Ex: Oficina Mecânica Central"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-blue-500 text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Qual tipo de veículo sua oficina atende? *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "MOTOS" as WorkshopType, label: "Motos", icon: Bike },
                        { id: "CARROS" as WorkshopType, label: "Carros", icon: Car },
                        { id: "CAMINHOES" as WorkshopType, label: "Caminhões", icon: Truck },
                        { id: "NAUTICA" as WorkshopType, label: "Náutica", icon: Ship },
                      ].map((type) => {
                        const Icon = type.icon;
                        const isSelected = trialWorkshopType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setTrialWorkshopType(type.id)}
                            className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                              isSelected
                                ? "bg-blue-600/20 border-blue-500 text-white font-bold"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-xs">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">
                        Seu Nome Completo (Proprietário) *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={trialOwnerName}
                          onChange={(e) => setTrialOwnerName(e.target.value)}
                          placeholder="Ex: Carlos Silva"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-blue-500 text-white text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">
                        WhatsApp / Celular com DDD *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={trialPhone}
                          onChange={(e) => setTrialPhone(e.target.value)}
                          placeholder="(11) 98765-4321"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-blue-500 text-white text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">
                        E-mail de Login *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={trialEmail}
                          onChange={(e) => setTrialEmail(e.target.value)}
                          placeholder="oficina@exemplo.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-blue-500 text-white text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">
                        Defina uma Senha de Acesso *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={trialPassword}
                          onChange={(e) => setTrialPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-blue-500 text-white text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                    <p className="flex items-center gap-1.5 text-zinc-300 font-bold">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      Regra de Teste: 7 dias corridos gratuitos
                    </p>
                    <p>
                      Após 1 semana, o sistema entrará em pausa para contratação. Nenhum dado é perdido e o sistema é liberado assim que você decidir contratar.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingTrial}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isSubmittingTrial ? "Ativando Teste..." : "Criar Oficina e Iniciar 7 Dias Grátis"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-10 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MotOsLogo size={20} />
            <span className="font-bold text-zinc-300">Mot-OS</span>
            <span>— Gestão Especializada para Oficinas de Motos, Carros, Caminhões e Náutica</span>
          </div>
          <p>© {new Date().getFullYear()} Mot-OS. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
