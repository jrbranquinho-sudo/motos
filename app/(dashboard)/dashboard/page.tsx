"use client";

import React from "react";
import { useMotoShop } from "@/lib/store";
import { SaasOwnerDashboard } from "@/components/dashboard/SaasOwnerDashboard";
import { ShopOwnerDashboard } from "@/components/dashboard/ShopOwnerDashboard";
import { ReceptionDashboard } from "@/components/dashboard/ReceptionDashboard";
import { MechanicDashboard } from "@/components/dashboard/MechanicDashboard";

export default function DashboardPage() {
  const { currentUser } = useMotoShop();

  // 1. Se for o dono do SaaS: exibe as empresas clientes cadastradas, movimentações, último acesso e quem acessou
  if (currentUser.role === "SUPER_ADMIN") {
    return <SaasOwnerDashboard />;
  }

  // 2. Se for o dono da oficina (ou gerente): exibe um relatório geral de tudo que se passa na oficina
  if (currentUser.role === "ADMIN" || currentUser.role === "MANAGER") {
    return <ShopOwnerDashboard />;
  }

  // 3. Se for a recepção: exibe as OS abertas, aguardando peças e possibilidade de consultar as OS encerradas
  if (currentUser.role === "RECEPTIONIST") {
    return <ReceptionDashboard />;
  }

  // 4. Se for o mecânico: exibe os dados das OS abertas, aguardando peças e encerradas direcionadas ao mecânico logado
  return <MechanicDashboard />;
}
