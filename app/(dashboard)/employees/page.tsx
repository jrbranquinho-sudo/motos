"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  ShieldCheck,
  Lock,
  Phone,
  Mail,
  UserCheck,
  AlertTriangle,
  Trash2,
  Edit2,
  CheckCircle2,
  Wrench,
  Building2,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { Role, User } from "@/lib/types";
import { formatPhone } from "@/lib/utils";

const ROLE_LABELS: Record<Role, { label: string; bg: string; text: string; border: string }> = {
  SUPER_ADMIN: {
    label: "Dono do SaaS (Master)",
    bg: "bg-purple-500/20",
    text: "text-purple-300",
    border: "border-purple-500/40",
  },
  ADMIN: {
    label: "Administrador / Dono",
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    border: "border-orange-500/30",
  },
  MANAGER: {
    label: "Gerente",
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  RECEPTIONIST: {
    label: "Recepcionista",
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  MECHANIC: {
    label: "Mecânico de Bancada",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
};

export default function EmployeesPage() {
  const { tenant, users, currentUser, addUser, updateUser, deleteUser, canManageUsers } = useMotoShop();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("MECHANIC");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Mechanic specific password change states
  const [mechanicNewPassword, setMechanicNewPassword] = useState("");
  const [mechanicConfirmPassword, setMechanicConfirmPassword] = useState("");
  const [mechanicError, setMechanicError] = useState("");

  const isMechanic = currentUser.role === "MECHANIC";
  const tenantUsers = users.filter((u) => u.tenantId === tenant.id);

  const handleMechanicPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setMechanicError("");

    if (!mechanicNewPassword || mechanicNewPassword.length < 4) {
      setMechanicError("A nova senha deve ter pelo menos 4 caracteres.");
      return;
    }

    if (mechanicNewPassword !== mechanicConfirmPassword) {
      setMechanicError("A confirmação de senha não confere com a nova senha.");
      return;
    }

    updateUser(currentUser.id, { password: mechanicNewPassword });
    setFeedbackMsg("Sua senha foi atualizada com sucesso!");
    setMechanicNewPassword("");
    setMechanicConfirmPassword("");
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const isSaasOwner = currentUser.role === "SUPER_ADMIN";

  if (isSaasOwner) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Acesso Restrito ao Dono do SaaS</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Como administrador da plataforma SaaS, você gerencia as empresas clientes contratantes e visualiza apenas o login do proprietário de cada oficina. Os funcionários internos de cada empresa são restritos.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors shadow-lg shadow-orange-500/20"
        >
          Ir para o Painel SaaS Master
        </Link>
      </div>
    );
  }

  // If user is mechanic, provide dedicated profile & password change view
  if (isMechanic) {
    const roleInfo = ROLE_LABELS.MECHANIC;

    return (
      <div className="space-y-6 pb-16 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-orange-500" />
            <span>Meu Perfil de Funcionário</span>
          </h1>
          <p className="text-sm text-zinc-400">
            Consulte seus dados de colaborador e altere sua senha de acesso à bancada
          </p>
        </div>

        {feedbackMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Mechanic Profile Summary Card */}
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400 text-lg">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">{currentUser.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.bg} ${roleInfo.text} ${roleInfo.border}`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
              {tenant.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-zinc-500" />
              <div>
                <span className="text-[10px] text-zinc-500 block">E-mail de Login</span>
                <span className="font-medium text-zinc-200">{currentUser.email}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-zinc-500" />
              <div>
                <span className="text-[10px] text-zinc-500 block">Telefone</span>
                <span className="font-medium text-zinc-200">{formatPhone(currentUser.phone || "") || "Não informado"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-orange-500/30 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base pb-3 border-b border-zinc-800">
            <Lock className="w-5 h-5 text-orange-400" />
            <span>Alterar Minha Senha de Acesso</span>
          </div>

          {mechanicError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{mechanicError}</span>
            </div>
          )}

          <form onSubmit={handleMechanicPasswordChange} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-300 font-semibold block mb-1.5">
                Nova Senha de Acesso *
              </label>
              <input
                type="password"
                placeholder="Digite a nova senha (mínimo 4 dígitos)"
                value={mechanicNewPassword}
                onChange={(e) => setMechanicNewPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-semibold block mb-1.5">
                Confirmar Nova Senha *
              </label>
              <input
                type="password"
                placeholder="Repita a nova senha para confirmar"
                value={mechanicConfirmPassword}
                onChange={(e) => setMechanicConfirmPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Atualizar Senha</span>
            </button>
          </form>
        </div>

        {/* Security & Permissions notice */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Como mecânico, você tem permissão para alterar sua senha a qualquer momento. O cadastro de novos funcionários e a edição de outros colaboradores é restrito à gerência e recepção da oficina.
          </p>
        </div>
      </div>
    );
  }

  // If user cannot manage users (and is not mechanic handled above)
  if (!canManageUsers) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Acesso Restrito</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          O cadastro e gerenciamento de funcionários é restrito exclusivamente ao <strong>Gerente</strong> e à <strong>Recepção</strong>.
        </p>
      </div>
    );
  }

  const handleOpenNew = () => {
    setEditingUserId(null);
    setName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setRole("MECHANIC");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUserId(user.id);
    setName(user.name);
    setPhone(user.phone || "");
    setEmail(user.email);
    setPassword(user.password || "");
    setRole(user.role);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Preencha nome e e-mail.");
      return;
    }

    if (editingUserId) {
      updateUser(editingUserId, {
        name,
        phone,
        email,
        password: password || undefined,
        role,
      });
      setFeedbackMsg("Funcionário atualizado com sucesso!");
    } else {
      addUser({
        name,
        phone,
        email,
        password: password || "123456",
        role,
      });
      setFeedbackMsg("Novo funcionário cadastrado com sucesso!");
    }

    setIsModalOpen(false);
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  const handleDelete = (id: string) => {
    if (id === currentUser.id) {
      alert("Você não pode excluir seu próprio usuário logado.");
      return;
    }
    if (confirm("Deseja realmente remover este funcionário?")) {
      deleteUser(id);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-orange-500" />
            <span>Cadastro de Funcionários & Equipe</span>
          </h1>
          <p className="text-sm text-zinc-400">
            Gerencie mecânicos, recepcionistas e gerentes da oficina ({tenant.name})
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cadastrar Funcionário</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Permissions notice */}
      <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
          <span>
            Apenas <strong>Gerente</strong> e <strong>Recepcionista</strong> possuem permissão para cadastrar e gerenciar senhas e acessos.
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 shrink-0">
          Perfil ativo: <strong className="text-orange-400">{currentUser.role}</strong>
        </span>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenantUsers.map((user) => {
          const roleInfo = ROLE_LABELS[user.role] || ROLE_LABELS.MECHANIC;
          const isMe = user.id === currentUser.id;

          return (
            <div
              key={user.id}
              className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 shadow-xl flex flex-col justify-between group transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400 text-sm">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.bg} ${roleInfo.text} ${roleInfo.border}`}
                  >
                    {roleInfo.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base text-white">{user.name}</h3>
                  {isMe && (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-orange-400">
                      Você
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-zinc-400 mt-3">
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{user.email}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{formatPhone(user.phone || "") || "Sem telefone"}</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
                    <Lock className="w-3 h-3 text-zinc-600" />
                    <span>Senha: {user.password ? "••••••" : "Padrão (123)"}</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(user)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Editar</span>
                </button>

                {!isMe && (
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 text-xs transition-colors"
                    title="Remover funcionário"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Cadastrar / Editar Funcionário */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              <span>{editingUserId ? "Editar Funcionário" : "Cadastrar Novo Funcionário"}</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Nome do colaborador"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Função / Cargo *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                >
                  <option value="MECHANIC">Mecânico de Bancada</option>
                  <option value="RECEPTIONIST">Recepcionista</option>
                  <option value="MANAGER">Gerente</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 font-mono focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">E-mail de Acesso *</label>
                <input
                  type="email"
                  placeholder="colaborador@oficina.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Senha de Acesso {editingUserId && "(Deixe em branco para manter)"}
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
