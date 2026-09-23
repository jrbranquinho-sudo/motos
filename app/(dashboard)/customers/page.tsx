"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  MessageCircle,
  Bike,
  Calendar,
  AlertCircle,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatPhone, formatPlate } from "@/lib/utils";

export default function CustomersPage() {
  const { tenant, customers, vehicles, serviceOrders, addCustomer, currentUser, isMechanic } = useMotoShop();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Customer Form
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDoc, setNewDoc] = useState("");

  const isSaasOwner = currentUser.role === "SUPER_ADMIN";

  if (isSaasOwner) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acesso Restrito ao Dono do SaaS</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          O cadastro e dados de clientes finais (proprietários de motos) pertencem e são geridos com exclusividade por cada oficina contratante.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors shadow-lg shadow-orange-500/20"
        >
          Voltar para o Painel SaaS Master
        </Link>
      </div>
    );
  }

  if (isMechanic) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acesso Restrito a Clientes</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Mecânicos não possuem permissão para visualizar o cadastro geral de clientes ou dados de contato pessoais.
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

  const tenantCustomers = customers.filter((c) => c.tenantId === tenant.id);

  const filtered = tenantCustomers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.document && c.document.includes(term))
    );
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) {
      alert("Preencha o nome e o telefone do cliente.");
      return;
    }

    addCustomer({
      name: newName,
      phone: newPhone,
      email: newEmail || undefined,
      document: newDoc || undefined,
    });

    setIsAddModalOpen(false);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewDoc("");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-orange-500" />
            <span>Gestão de Clientes</span>
          </h1>
          <p className="text-sm text-zinc-400">
            Base de clientes, motos vinculadas e alertas de recorrência preventiva
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 relative">
        <input
          type="text"
          placeholder="Buscar por nome, telefone, CPF ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
        />
        <Search className="w-4 h-4 text-zinc-500 absolute left-6 top-5.5" />
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((customer) => {
          const clientVehicles = vehicles.filter((v) => v.customerId === customer.id);
          const cleanPhone = customer.phone.replace(/\D/g, "");
          const waNumber = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
          const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
            `Olá ${customer.name}, tudo bem? Aqui é da ${tenant.name}! Como está o funcionamento da sua moto?`
          )}`;

          return (
            <div
              key={customer.id}
              className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/40 shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400 text-sm">
                    {customer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    {clientVehicles.length} moto(s)
                  </span>
                </div>

                <h3 className="font-bold text-base text-white mb-1">{customer.name}</h3>

                <div className="space-y-1 text-xs text-zinc-400 mb-4">
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{formatPhone(customer.phone)}</span>
                  </p>
                  {customer.email && (
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{customer.email}</span>
                    </p>
                  )}
                  {customer.document && (
                    <p className="text-[11px] text-zinc-500">CPF/CNPJ: {customer.document}</p>
                  )}
                </div>

                {/* Linked Motorcycles */}
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Motos Cadastradas:
                  </span>
                  {clientVehicles.length > 0 ? (
                    <div className="space-y-1.5">
                      {clientVehicles.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between text-xs text-zinc-200"
                        >
                          <span className="truncate pr-1 font-medium">{v.brand} {v.model}</span>
                          <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-orange-400 border border-zinc-700 shrink-0">
                            {formatPlate(v.plate)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">Nenhuma moto vinculada.</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-950/20"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                {clientVehicles[0] && (
                  <Link
                    href={`/orders/new?vehicleId=${clientVehicles[0].id}`}
                    className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-orange-500 hover:text-white text-zinc-200 font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Abrir OS</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Cliente */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              <span>Cadastrar Novo Cliente</span>
            </h3>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Nome do cliente"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">WhatsApp / Celular *</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">E-mail (Opcional)</label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">CPF ou CNPJ (Opcional)</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={newDoc}
                  onChange={(e) => setNewDoc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
