"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Wrench, CheckCircle, FileText, Receipt } from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatCurrency, formatDateTime, formatPlate } from "@/lib/utils";

export default function OrderPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getServiceOrderById, tenant } = useMotoShop();
  const [printFormat, setPrintFormat] = useState<"a4" | "thermal">("a4");

  const order = getServiceOrderById(id);

  if (!order) {
    return (
      <div className="p-8 text-center text-white">
        <p>Ordem de Serviço não encontrada para impressão.</p>
        <Link href="/orders" className="text-orange-400 underline mt-2 inline-block">
          Voltar para Ordens
        </Link>
      </div>
    );
  }

  const vehicle = order.vehicle;
  const customer = vehicle?.customer;
  const mechanic = order.mechanic;

  const partsItems = order.items.filter((i) => i.type === "PART");
  const laborItems = order.items.filter((i) => i.type === "LABOR");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-900 pb-12">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="no-print bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/orders/${order.id}`}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="font-bold text-white text-sm">
                Impressão da OS #{order.osNumber}
              </h2>
              <p className="text-xs text-zinc-400">
                Selecione o layout desejado antes de imprimir
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Format Selector */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setPrintFormat("a4")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  printFormat === "a4"
                    ? "bg-orange-500 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Folha A4</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat("thermal")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  printFormat === "thermal"
                    ? "bg-orange-500 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Térmica 80mm</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Agora</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FORMATO 1: FOLHA A4 PADRÃO                                */}
      {/* ========================================================= */}
      {printFormat === "a4" && (
        <div className="max-w-[210mm] mx-auto my-6 p-8 sm:p-12 bg-white text-zinc-900 shadow-2xl rounded-sm print:m-0 print:p-0 print:shadow-none print-container text-xs sm:text-sm font-sans leading-relaxed">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-5 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-2xl print:bg-black">
                M
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-zinc-900 uppercase">
                  {tenant.name}
                </h1>
                <p className="text-xs text-zinc-600">
                  CNPJ: {tenant.cnpj || "00.000.000/0001-00"} • Fone: {tenant.phone || "(11) 98765-4321"}
                </p>
                <p className="text-xs text-zinc-600">{tenant.address || "Endereço da oficina"}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-black font-mono text-orange-600 print:text-black">
                ORDEM DE SERVIÇO #{order.osNumber}
              </div>
              <div className="text-xs text-zinc-600">
                Emissão: {formatDateTime(order.createdAt)}
              </div>
              <div className="text-xs font-semibold uppercase text-zinc-700 mt-1">
                Mecânico: {mechanic?.name || "Bancada"}
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Block */}
          <div className="grid grid-cols-2 gap-4 p-3.5 bg-zinc-100 rounded-lg mb-5 border border-zinc-300 text-xs">
            <div>
              <h3 className="font-bold text-zinc-800 uppercase tracking-wider text-[11px] mb-1">
                Dados do Cliente
              </h3>
              <p>
                <strong>Nome:</strong> {customer?.name || "Cliente Balcão"}
              </p>
              <p>
                <strong>Telefone:</strong> {customer?.phone || "-"}
              </p>
              <p>
                <strong>CPF/CNPJ:</strong> {customer?.document || "Não informado"}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-zinc-800 uppercase tracking-wider text-[11px] mb-1">
                Dados do Veículo
              </h3>
              <p>
                <strong>Moto:</strong> {vehicle?.brand} {vehicle?.model} ({vehicle?.year})
              </p>
              <p>
                <strong>Placa:</strong>{" "}
                <span className="font-mono font-bold">{formatPlate(vehicle?.plate || "")}</span> •{" "}
                <strong>KM Entrada:</strong> {order.kmAtService.toLocaleString("pt-BR")}
              </p>
              {order.kmNextService && (
                <p>
                  <strong>Próxima Revisão Prevista:</strong>{" "}
                  {order.kmNextService.toLocaleString("pt-BR")} KM
                </p>
              )}
            </div>
          </div>

          {/* Complaints and Diagnoses */}
          <div className="mb-5 space-y-2">
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded">
              <h4 className="font-bold text-xs text-zinc-800 uppercase">
                Reclamação do Cliente / Defeito Reclamado:
              </h4>
              <p className="text-xs text-zinc-700 mt-0.5">{order.complaint}</p>
            </div>

            {order.diagnosis && (
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded">
                <h4 className="font-bold text-xs text-zinc-800 uppercase">
                  Diagnóstico Técnico Realizado:
                </h4>
                <p className="text-xs text-zinc-700 mt-0.5">{order.diagnosis}</p>
              </div>
            )}
          </div>

          {/* Parts Table */}
          {partsItems.length > 0 && (
            <div className="mb-5">
              <h3 className="font-bold text-xs text-zinc-800 uppercase tracking-wider mb-1.5 pb-1 border-b border-zinc-300">
                Peças Substituídas
              </h3>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-600 uppercase text-[10px]">
                    <th className="py-1.5">Descrição</th>
                    <th className="py-1.5 text-center">Qtd</th>
                    <th className="py-1.5 text-right">Valor Unit.</th>
                    <th className="py-1.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {partsItems.map((item, i) => (
                    <tr key={i}>
                      <td className="py-1.5">{item.description}</td>
                      <td className="py-1.5 text-center font-mono">{item.quantity}</td>
                      <td className="py-1.5 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-1.5 text-right font-mono font-semibold">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Labor Table */}
          {laborItems.length > 0 && (
            <div className="mb-5">
              <h3 className="font-bold text-xs text-zinc-800 uppercase tracking-wider mb-1.5 pb-1 border-b border-zinc-300">
                Serviços & Mão de Obra
              </h3>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-600 uppercase text-[10px]">
                    <th className="py-1.5">Descrição do Serviço</th>
                    <th className="py-1.5 text-center">Qtd</th>
                    <th className="py-1.5 text-right">Valor</th>
                    <th className="py-1.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {laborItems.map((item, i) => (
                    <tr key={i}>
                      <td className="py-1.5">{item.description}</td>
                      <td className="py-1.5 text-center font-mono">{item.quantity}</td>
                      <td className="py-1.5 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-1.5 text-right font-mono font-semibold">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals Box */}
          <div className="flex justify-end mb-8">
            <div className="w-64 p-3 bg-zinc-100 rounded border border-zinc-300 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal Peças:</span>
                <span className="font-mono">{formatCurrency(order.totalParts)}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal Serviços:</span>
                <span className="font-mono">{formatCurrency(order.totalLabor)}</span>
              </div>
              {order.totalDiscount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Descontos:</span>
                  <span className="font-mono">-{formatCurrency(order.totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-1 border-t border-zinc-300">
                <span>TOTAL GERAL:</span>
                <span className="text-orange-600 print:text-black">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Warranty Terms */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-[10px] text-zinc-600 mb-8 leading-tight">
            <strong>Termos de Garantia:</strong> Garantia legal de 90 (noventa) dias para peças novas
            e serviços prestados, contados a partir da data de entrega do veículo, conforme CDC Art.
            26, II. Não nos responsabilizamos por peças fornecidas pelo cliente ou avarias decorrentes
            de mau uso, queda ou falta de lubrificação básica pós-serviço.
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-300 text-center text-xs">
            <div>
              <div className="border-b border-zinc-800 w-4/5 mx-auto mb-1.5" />
              <p className="font-bold text-zinc-800">{customer?.name || "Cliente / Responsável"}</p>
              <p className="text-[10px] text-zinc-500">Autorização e Recebimento da Moto</p>
            </div>
            <div>
              <div className="border-b border-zinc-800 w-4/5 mx-auto mb-1.5" />
              <p className="font-bold text-zinc-800">{mechanic?.name || tenant.name}</p>
              <p className="text-[10px] text-zinc-500">Mecânico / Responsável Técnico</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FORMATO 2: CUPOM TÉRMICO 80MM (BOBINA)                     */}
      {/* ========================================================= */}
      {printFormat === "thermal" && (
        <div className="max-w-[80mm] mx-auto my-6 p-4 bg-white text-black shadow-2xl rounded-sm print:m-0 print:p-0 print:shadow-none thermal-receipt font-mono text-[11px] leading-tight">
          <div className="text-center pb-2 border-b border-dashed border-black">
            <h1 className="font-bold text-xs uppercase">{tenant.name}</h1>
            <p className="text-[9px]">CNPJ: {tenant.cnpj}</p>
            <p className="text-[9px]">{tenant.phone}</p>
            <p className="text-[9px]">{tenant.address}</p>
          </div>

          <div className="py-2 border-b border-dashed border-black">
            <div className="flex justify-between font-bold text-xs">
              <span>OS #{order.osNumber}</span>
              <span>{new Date(order.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
            <div>MECANICO: {mechanic?.name.split(" ")[0] || "OFICINA"}</div>
          </div>

          <div className="py-2 border-b border-dashed border-black text-[10px]">
            <div>MOTO: {vehicle?.brand} {vehicle?.model}</div>
            <div>PLACA: {formatPlate(vehicle?.plate || "")}</div>
            <div>KM: {order.kmAtService} {order.kmNextService && `| PROX: ${order.kmNextService}`}</div>
            <div>CLIENTE: {customer?.name || "Balcao"}</div>
          </div>

          <div className="py-2 border-b border-dashed border-black">
            <div className="font-bold text-[10px] mb-1">ITENS DA OS:</div>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-[10px] mb-1">
                <span className="truncate pr-1">
                  {item.quantity}x {item.description.slice(0, 20)}
                </span>
                <span className="shrink-0">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>

          <div className="py-2 border-b border-dashed border-black space-y-0.5">
            <div className="flex justify-between text-[10px]">
              <span>PECAS:</span>
              <span>{formatCurrency(order.totalParts)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span>SERVICOS:</span>
              <span>{formatCurrency(order.totalLabor)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold pt-1 border-t border-black">
              <span>TOTAL GERAL:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          <div className="pt-6 text-center text-[9px] space-y-3">
            <div>
              <div className="border-b border-dashed border-black w-3/4 mx-auto mb-1" />
              <span>ASSINATURA CLIENTE</span>
            </div>
            <p className="text-[8px] italic">
              Garantia legal de 90 dias conforme CDC.
              Obrigado pela preferência!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
