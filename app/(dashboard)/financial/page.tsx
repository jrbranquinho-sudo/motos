"use client";

import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Plus,
  Filter,
  Trash2,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { FinancialRecord } from "@/lib/types";

export default function FinancialPage() {
  const { financialRecords, addFinancialRecord, deleteFinancialRecord, isMechanic } = useMotoShop();

  const [selectedMonth, setSelectedMonth] = useState("09");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [type, setType] = useState<"RECEITA" | "DESPESA">("RECEITA");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("2026-09-24");
  const [category, setCategory] = useState("Serviços");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const months = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  // Calculate metrics for selected month
  const currentMonthRecords = financialRecords.filter((rec) => {
    if (!rec.date) return false;
    const [y, m] = rec.date.split("-");
    return y === selectedYear && m === selectedMonth;
  });

  const totalReceita = currentMonthRecords
    .filter((r) => r.type === "RECEITA")
    .reduce((acc, r) => acc + r.amount, 0);

  const totalDespesa = currentMonthRecords
    .filter((r) => r.type === "DESPESA")
    .reduce((acc, r) => acc + r.amount, 0);

  const lucroLiquido = totalReceita - totalDespesa;
  const margemLiquida = totalReceita > 0 ? (lucroLiquido / totalReceita) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const numAmount = parseFloat(amount.replace(",", ".")) || 0;
    addFinancialRecord({
      type,
      description,
      amount: numAmount,
      date,
      category,
    });

    setFeedbackMsg(`Lançamento de ${type.toLowerCase()} registrado com sucesso.`);
    setIsModalOpen(false);
    setDescription("");
    setAmount("");
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleDelete = (rec: FinancialRecord) => {
    if (confirm(`Deseja realmente remover o lançamento "${rec.description}"?`)) {
      deleteFinancialRecord(rec.id);
      setFeedbackMsg("Lançamento excluído.");
      setTimeout(() => setFeedbackMsg(""), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header matching dump screenshot 155013 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            Financeiro
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            DRE — Demonstrativo de resultado operacional e fluxo financeiro
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#0d111a] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-[#0d111a] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>

          {!isMechanic && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Lançamento</span>
            </button>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 4 Cards matching dump 155013 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita */}
        <div className="p-4 rounded-xl bg-[#0d111a] border-l-4 border-l-blue-500 border border-slate-800/80 shadow-lg">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">RECEITA</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {formatCurrency(totalReceita)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">no mês selecionado</div>
        </div>

        {/* Despesas */}
        <div className="p-4 rounded-xl bg-[#0d111a] border-l-4 border-l-red-500 border border-slate-800/80 shadow-lg">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">DESPESAS</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {formatCurrency(totalDespesa)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">no mês selecionado</div>
        </div>

        {/* Lucro Líquido */}
        <div className="p-4 rounded-xl bg-[#0d111a] border-l-4 border-l-emerald-500 border border-slate-800/80 shadow-lg">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">LUCRO LÍQUIDO</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
            {formatCurrency(lucroLiquido)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">resultado do mês</div>
        </div>

        {/* Margem */}
        <div className="p-4 rounded-xl bg-[#0d111a] border-l-4 border-l-purple-500 border border-slate-800/80 shadow-lg">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">MARGEM</div>
          <div className="text-xl sm:text-2xl font-black text-purple-400 mt-1">
            {margemLiquida.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">margem líquida</div>
        </div>
      </div>

      {/* Histórico 6 Meses preview */}
      <div className="p-5 rounded-xl bg-[#0d111a] border border-slate-800/80 shadow-xl space-y-3">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          ÚLTIMOS 6 MESES
        </div>
        <div className="h-28 flex items-end justify-around gap-2 pt-4 px-4 border-b border-slate-800">
          {[
            { label: "Abr/26", rec: 1200, desp: 400 },
            { label: "Mai/26", rec: 1800, desp: 600 },
            { label: "Jun/26", rec: 2400, desp: 900 },
            { label: "Jul/26", rec: 3100, desp: 1100 },
            { label: "Ago/26", rec: 2900, desp: 850 },
            { label: "Set/26", rec: Math.max(totalReceita, 745), desp: totalDespesa },
          ].map((bar, i) => (
            <div key={bar.label} className="flex flex-col items-center gap-1.5 h-full justify-end group">
              <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatCurrency(bar.rec)}
              </div>
              <div className="flex items-end gap-1 h-20">
                <div
                  style={{ height: `${Math.min(100, (bar.rec / 3500) * 100)}%` }}
                  className="w-5 bg-blue-600 rounded-t transition-all group-hover:bg-blue-500"
                  title={`Receita: ${formatCurrency(bar.rec)}`}
                />
                {bar.desp > 0 && (
                  <div
                    style={{ height: `${Math.min(100, (bar.desp / 3500) * 100)}%` }}
                    className="w-5 bg-red-600 rounded-t transition-all group-hover:bg-red-500"
                    title={`Despesa: ${formatCurrency(bar.desp)}`}
                  />
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{bar.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 justify-end pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-600" /> Receita
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-600" /> Despesas
          </span>
        </div>
      </div>

      {/* Lançamentos do Mês matching dump 155013 */}
      <div className="bg-[#0d111a] border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            LANÇAMENTOS DO MÊS ({currentMonthRecords.length})
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Referência (OS)</th>
                <th className="py-3 px-4 text-right">Valor</th>
                {!isMechanic && <th className="py-3 px-4 text-right">Ação</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {currentMonthRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    Nenhum lançamento financeiro para o período selecionado.
                  </td>
                </tr>
              ) : (
                currentMonthRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {r.date.split("-").reverse().join("/")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.type === "RECEITA"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{r.category}</td>
                    <td className="py-3 px-4 font-medium text-white">{r.description}</td>
                    <td className="py-3 px-4 font-mono text-blue-400">
                      {r.referenceOsId || "—"}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold font-mono ${
                        r.type === "RECEITA" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {r.type === "RECEITA" ? "+" : "-"}
                      {formatCurrency(r.amount)}
                    </td>
                    {!isMechanic && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(r)}
                          className="p-1 hover:bg-red-950/40 text-slate-500 hover:text-red-400 rounded transition-colors"
                          title="Excluir lançamento"
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

      {/* Modal matching dump 155034 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1422] border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">Novo Lançamento</h2>
                <p className="text-xs text-slate-400">Registrar receita ou despesa</p>
              </div>
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
                  Tipo *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "RECEITA" | "DESPESA")}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="RECEITA">Receita</option>
                  <option value="DESPESA">Despesa</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Descrição *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pagamento OS #042, Compra de peças..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  placeholder="Ex: Peças, Mão de obra, Aluguel, Ferramentas..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
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
                  Registrar lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
