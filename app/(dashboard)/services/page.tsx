"use client";

import React, { useState } from "react";
import {
  Wrench,
  Plus,
  Search,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  CheckCircle2,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { ServiceCatalogItem } from "@/lib/types";

export default function ServicesPage() {
  const { services, addService, updateService, deleteService, isMechanic } = useMotoShop();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCatalogItem | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("Mecânica");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("1");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const departments = ["Mecânica", "Elétrica", "Revisão Rápida", "Geometria", "Suspensão", "Freios", "Estética"];

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = departmentFilter === "ALL" || s.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setEditingService(null);
    setName("");
    setDepartment("Mecânica");
    setDescription("");
    setPrice("");
    setEstimatedHours("1");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: ServiceCatalogItem) => {
    setEditingService(srv);
    setName(srv.name);
    setDepartment(srv.department);
    setDescription(srv.description || "");
    setPrice(String(srv.price));
    setEstimatedHours(String(srv.estimatedHours));
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numPrice = parseFloat(price.replace(",", ".")) || 0;
    const numHours = parseFloat(estimatedHours.replace(",", ".")) || 1;

    if (editingService) {
      updateService(editingService.id, {
        name,
        department,
        description,
        price: numPrice,
        estimatedHours: numHours,
      });
      setFeedbackMsg(`Serviço "${name}" atualizado com sucesso.`);
    } else {
      addService({
        name,
        department,
        description,
        price: numPrice,
        estimatedHours: numHours,
      });
      setFeedbackMsg(`Serviço "${name}" cadastrado com sucesso.`);
    }

    setIsModalOpen(false);
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleDelete = (srv: ServiceCatalogItem) => {
    if (confirm(`Deseja realmente remover o serviço "${srv.name}"?`)) {
      deleteService(srv.id);
      setFeedbackMsg(`Serviço "${srv.name}" removido.`);
      setTimeout(() => setFeedbackMsg(""), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-500" />
            Serviços & Mão de Obra
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Catálogo padrão de serviços, tempo padrão e valores aplicados nas Ordens de Serviço
          </p>
        </div>

        {!isMechanic && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Serviço</span>
          </button>
        )}
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome do serviço ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0d111a] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="bg-[#0d111a] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">Todos os Departamentos</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0d111a] border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Serviço</th>
                <th className="py-3 px-4">Departamento</th>
                <th className="py-3 px-4">Tempo Estimado</th>
                <th className="py-3 px-4">Preço Padrão</th>
                {!isMechanic && <th className="py-3 px-4 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    Nenhum serviço encontrado no catálogo.
                  </td>
                </tr>
              ) : (
                filteredServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{srv.name}</div>
                      {srv.description && (
                        <div className="text-[11px] text-slate-500 line-clamp-1">{srv.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {srv.department}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {srv.estimatedHours}h
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {formatCurrency(srv.price)}
                    </td>
                    {!isMechanic && (
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(srv)}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded transition-colors"
                          title="Editar serviço"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(srv)}
                          className="p-1 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded transition-colors"
                          title="Excluir serviço"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal matching dump image 154902 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                {editingService ? "Editar Serviço" : "Novo Serviço"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Voltar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca de óleo, Alinhamento..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Departamento
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes do serviço..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Tempo Estimado (Horas)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    placeholder="1"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                >
                  {editingService ? "Salvar alterações" : "Criar serviço"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
