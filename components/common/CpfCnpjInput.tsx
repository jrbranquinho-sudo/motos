"use client";

import React, { useState } from "react";
import { formatCpfCnpj, getCpfCnpjInfo } from "@/lib/utils";
import { Search, Loader2, CheckCircle2, AlertCircle, Building2 } from "lucide-react";

export interface ReceitaFederalResult {
  success: boolean;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  address: string;
  phone?: string;
  details?: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  };
}

interface CpfCnpjInputProps {
  value: string;
  onChange: (formatted: string, cleanDigits: string) => void;
  onCnpjFound?: (data: ReceitaFederalResult) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export function CpfCnpjInput({
  value,
  onChange,
  onCnpjFound,
  label = "CNPJ ou CPF da Empresa",
  placeholder = "00.000.000/0001-00 ou 000.000.000-00",
  required = false,
  className = "",
  inputClassName = "",
  disabled = false,
}: CpfCnpjInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const docInfo = getCpfCnpjInfo(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeedback(null);
    const rawVal = e.target.value;
    const clean = rawVal.replace(/\D/g, "").slice(0, 14);
    const formatted = formatCpfCnpj(clean);
    onChange(formatted, clean);
  };

  const handleConsultarCnpj = async () => {
    if (docInfo.raw.length !== 14) {
      setFeedback({
        type: "error",
        msg: "Para consultar na Receita Federal, digite os 14 números do CNPJ.",
      });
      return;
    }

    if (!docInfo.isValid) {
      setFeedback({
        type: "error",
        msg: "CNPJ com dígitos verificadores inválidos.",
      });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/cnpj/${docInfo.raw}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({
          type: "success",
          msg: `Razão Social carregada: ${data.razaoSocial}`,
        });
        if (onCnpjFound) {
          onCnpjFound(data);
        }
      } else {
        setFeedback({
          type: "error",
          msg: data.error || "CNPJ não encontrado na base da Receita Federal.",
        });
      }
    } catch (e) {
      setFeedback({
        type: "error",
        msg: "Falha de conexão ao consultar a Receita Federal.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-orange-400" />
          <span>{label}</span>
          {required && <span className="text-orange-500">*</span>}
        </label>

        {/* Badge de validação ao concluir o documento */}
        {docInfo.isComplete && (
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
              docInfo.isValid
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/15 text-red-400 border-red-500/30"
            }`}
          >
            {docInfo.isValid ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>{docInfo.type} Válido</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                <span>{docInfo.type} Inválido</span>
              </>
            )}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 font-mono focus:border-orange-500 focus:outline-none transition-colors ${
              docInfo.isComplete && !docInfo.isValid ? "border-red-500/60 text-red-200" : ""
            } ${inputClassName}`}
            required={required}
          />
        </div>

        {/* Botão de consulta à Receita Federal para CNPJ */}
        {docInfo.raw.length >= 11 && (
          <button
            type="button"
            onClick={handleConsultarCnpj}
            disabled={isLoading || disabled || docInfo.raw.length !== 14}
            title={
              docInfo.raw.length === 14
                ? "Consultar dados cadastrais na Receita Federal"
                : "A consulta automática na Receita Federal é exclusiva para CNPJ (14 dígitos)"
            }
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all shadow-sm ${
              docInfo.raw.length === 14 && docInfo.isValid
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 active:scale-95"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Consultando...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Consultar (CNPJ)</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Feedback contextual */}
      {feedback && (
        <div
          className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
              : "bg-red-500/10 text-red-300 border-red-500/30"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}
    </div>
  );
}
