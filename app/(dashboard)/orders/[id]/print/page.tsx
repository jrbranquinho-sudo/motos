"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import {
  Printer,
  ArrowLeft,
  Wrench,
  CheckCircle,
  FileText,
  Receipt,
  QrCode,
  Scissors,
} from "lucide-react";
import { useMotoShop } from "@/lib/store";
import { formatCurrency, formatDateTime, formatPlate } from "@/lib/utils";
import { getVehicleTypeLabel } from "@/lib/vehicleCatalog";
import { MotOsLogo } from "@/components/common/MotOsLogo";

export default function OrderPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getServiceOrderById, tenant } = useMotoShop();
  // Default to thermal receipt per user request
  const [printFormat, setPrintFormat] = useState<"thermal" | "a4">("thermal");
  const [thermalWidth, setThermalWidth] = useState<"80mm" | "58mm">("80mm");

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
  const vehicleTerm = getVehicleTypeLabel(vehicle?.category || tenant.workshopType);

  const partsItems = order.items.filter((i) => i.type === "PART");
  const laborItems = order.items.filter((i) => i.type === "LABOR");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-900 pb-16 selection:bg-orange-500 selection:text-white">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="no-print bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 p-3 sm:p-4 sticky top-0 z-50 shadow-xl">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href={`/orders/${order.id}`}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title="Voltar para a Ordem"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-sm sm:text-base">
                  OS #{order.osNumber} • Impressão
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  {printFormat === "thermal" ? `Bobina ${thermalWidth}` : "Folha A4"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Visualização fiel da fita antes de enviar para a impressora
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
            {/* Format Selector */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setPrintFormat("thermal")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  printFormat === "thermal"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Fita Térmica</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat("a4")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  printFormat === "a4"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Folha A4</span>
              </button>
            </div>

            {/* Thermal Width Selector (if thermal) */}
            {printFormat === "thermal" && (
              <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setThermalWidth("80mm")}
                  className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-colors ${
                    thermalWidth === "80mm"
                      ? "bg-zinc-800 text-orange-400 border border-orange-500/40"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  80mm
                </button>
                <button
                  type="button"
                  onClick={() => setThermalWidth("58mm")}
                  className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-colors ${
                    thermalWidth === "58mm"
                      ? "bg-zinc-800 text-orange-400 border border-orange-500/40"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  58mm
                </button>
              </div>
            )}

            {/* Print Now Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/30 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FORMATO 1: FITA IMPRESSA DE BOBINA TÉRMICA (80mm / 58mm)   */}
      {/* ========================================================= */}
      {printFormat === "thermal" && (
        <div className="py-6 px-3 flex flex-col items-center">
          {/* Subtle guide notice for the user */}
          <div className="no-print mb-4 flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-3.5 py-1.5 rounded-full">
            <Receipt className="w-3.5 h-3.5 text-orange-400" />
            <span>
              Exibição contínua da fita de bobina térmica ({thermalWidth}) com picote de corte
            </span>
          </div>

          {/* Realistic Continuous Paper Ribbon Roll */}
          <div
            className={`relative mx-auto bg-[#fafafa] text-black shadow-2xl transition-all ${
              thermalWidth === "80mm"
                ? "w-full max-w-[320px] sm:w-[80mm] p-5 sm:p-6"
                : "w-full max-w-[260px] sm:w-[58mm] p-3.5 sm:p-4"
            } print:w-full print:max-w-none print:p-0 print:m-0 print:shadow-none font-mono text-[11px] leading-tight select-none`}
            style={{
              boxShadow: "0 20px 40px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            {/* Serrated / Jagged Top Tear Edge (Sawtooth Pattern) */}
            <div
              className="no-print absolute -top-2.5 left-0 right-0 h-3 overflow-hidden"
              style={{
                background:
                  "radial-gradient(circle at 5px 0, transparent 4px, #fafafa 4.5px) repeat-x 0 0 / 10px 10px",
              }}
            />

            {/* Receipt Header */}
            <div className="text-center pb-3 border-b-2 border-dashed border-zinc-800 space-y-1">
              <div className="flex justify-center mb-1.5">
                <MotOsLogo size={32} />
              </div>
              <h1 className="font-black text-sm uppercase tracking-tight text-zinc-900">
                {tenant.name}
              </h1>
              <p className="text-[10px] text-zinc-700">CNPJ: {tenant.cnpj || "00.000.000/0001-00"}</p>
              <p className="text-[10px] text-zinc-700">FONE: {tenant.phone || "(11) 98765-4321"}</p>
              <p className="text-[9px] text-zinc-600 leading-tight">
                {tenant.address || "Endereço da Oficina Mecânica"}
              </p>
            </div>

            {/* OS Info & Date */}
            <div className="py-2.5 border-b border-dashed border-zinc-800 text-[11px] space-y-0.5">
              <div className="flex justify-between font-black text-xs">
                <span>ORDEM DE SERVIÇO</span>
                <span>#{order.osNumber}</span>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-700">
                <span>EMISSÃO:</span>
                <span>{new Date(order.createdAt).toLocaleDateString("pt-BR")} {new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-700">
                <span>MECÂNICO:</span>
                <span className="font-bold">{mechanic?.name.toUpperCase() || "BANCADA"}</span>
              </div>
            </div>

            {/* Vehicle & Customer Details */}
            <div className="py-2.5 border-b border-dashed border-zinc-800 text-[10px] space-y-1">
              <div>
                <span className="font-bold">{vehicleTerm.label.toUpperCase()}: </span>
                <span>
                  {vehicle?.brand} {vehicle?.model} ({vehicle?.year})
                </span>
              </div>
              <div className="flex justify-between">
                <span>
                  PLACA: <strong>{formatPlate(vehicle?.plate || "")}</strong>
                </span>
                <span>KM: {order.kmAtService.toLocaleString("pt-BR")}</span>
              </div>
              {order.kmNextService && (
                <div className="text-[9px] text-zinc-700">
                  PRÓXIMA REVISÃO: {order.kmNextService.toLocaleString("pt-BR")} KM
                </div>
              )}
              <div className="pt-1 border-t border-dotted border-zinc-400">
                <div>
                  CLIENTE: <strong>{customer?.name || "Cliente Balcão"}</strong>
                </div>
                {customer?.phone && <div>FONE: {customer.phone}</div>}
                {customer?.document && <div>CPF/CNPJ: {customer.document}</div>}
              </div>
            </div>

            {/* Complaint / Defect */}
            {order.complaint && (
              <div className="py-2 border-b border-dashed border-zinc-800 text-[10px] space-y-0.5">
                <div className="font-bold text-[9px] uppercase tracking-wider text-zinc-800">
                  DEFEITO RECLAMADO / QUEIXA:
                </div>
                <div className="text-[10px] italic leading-tight text-zinc-800">
                  &quot;{order.complaint}&quot;
                </div>
              </div>
            )}

            {/* Parts & Services Itemized Slip */}
            <div className="py-2.5 border-b-2 border-dashed border-zinc-800 space-y-1.5">
              <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-zinc-300">
                <span>QTD ITEM / DESCRIÇÃO</span>
                <span>TOTAL</span>
              </div>

              {order.items.map((item, idx) => (
                <div key={idx} className="text-[10px] leading-tight space-y-0.5">
                  <div className="flex justify-between font-semibold">
                    <span className="truncate pr-1">
                      {item.quantity}x {item.description}
                    </span>
                    <span className="shrink-0 font-mono font-bold">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                  <div className="text-[9px] text-zinc-600 pl-4">
                    {item.type === "PART" ? "[PEÇA]" : "[SERVIÇO]"} un: {formatCurrency(item.unitPrice)}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="py-2.5 border-b-2 border-dashed border-zinc-800 space-y-1">
              <div className="flex justify-between text-[10px]">
                <span>SUBTOTAL PEÇAS:</span>
                <span className="font-mono">{formatCurrency(order.totalParts)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>SUBTOTAL SERVIÇOS:</span>
                <span className="font-mono">{formatCurrency(order.totalLabor)}</span>
              </div>
              {order.totalDiscount > 0 && (
                <div className="flex justify-between text-[10px] text-red-700 font-bold">
                  <span>DESCONTO:</span>
                  <span className="font-mono">-{formatCurrency(order.totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black pt-1.5 border-t border-zinc-800">
                <span>TOTAL A PAGAR:</span>
                <span className="font-mono text-sm">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            {/* Pix QR Code Mockup for Countertop Payment */}
            <div className="py-3 border-b border-dashed border-zinc-800 text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 font-bold text-[10px]">
                <QrCode className="w-3.5 h-3.5 text-zinc-900" />
                <span>PAGAMENTO PIX INSTANTÂNEO</span>
              </div>
              <div className="w-24 h-24 mx-auto bg-white p-1 border border-zinc-300 rounded flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Stylized QR Matrix Pattern */}
                  <rect x="10" y="10" width="24" height="24" fill="#000" />
                  <rect x="14" y="14" width="16" height="16" fill="#fff" />
                  <rect x="18" y="18" width="8" height="8" fill="#000" />

                  <rect x="66" y="10" width="24" height="24" fill="#000" />
                  <rect x="70" y="14" width="16" height="16" fill="#fff" />
                  <rect x="74" y="18" width="8" height="8" fill="#000" />

                  <rect x="10" y="66" width="24" height="24" fill="#000" />
                  <rect x="14" y="70" width="16" height="16" fill="#fff" />
                  <rect x="18" y="74" width="8" height="8" fill="#000" />

                  {/* Data blocks */}
                  <rect x="40" y="15" width="8" height="8" fill="#000" />
                  <rect x="52" y="22" width="6" height="6" fill="#000" />
                  <rect x="42" y="42" width="16" height="16" fill="#000" />
                  <rect x="46" y="46" width="8" height="8" fill="#fff" />
                  <rect x="15" y="45" width="8" height="6" fill="#000" />
                  <rect x="70" y="45" width="10" height="8" fill="#000" />
                  <rect x="42" y="68" width="12" height="8" fill="#000" />
                  <rect x="65" y="68" width="8" height="14" fill="#000" />
                  <rect x="78" y="75" width="10" height="10" fill="#000" />
                </svg>
              </div>
              <p className="text-[8px] text-zinc-600 font-mono">
                Chave PIX: {tenant.cnpj || tenant.phone || "financeiro@oficina.com.br"}
              </p>
            </div>

            {/* Terms of Warranty & Legal CDC */}
            <div className="py-2.5 border-b border-dashed border-zinc-800 text-[8px] text-zinc-600 leading-tight space-y-1">
              <p>
                <strong>TERMO DE GARANTIA:</strong> Garantia legal de 90 dias conforme Art. 26, II do CDC. Não cobre mau uso, sobrecarga, acidentes ou intervenção de terceiros.
              </p>
              <p>Obrigado pela preferência e confiança em nosso trabalho!</p>
            </div>

            {/* Cut / Signature Stub */}
            <div className="pt-4 pb-2 text-center text-[9px] space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-[8px]">
                <Scissors className="w-3 h-3" />
                <span>- - - - - - - - corte aqui - - - - - - - -</span>
              </div>
              <div>
                <div className="border-b border-dashed border-zinc-800 w-4/5 mx-auto mb-1" />
                <span className="font-bold">ASSINATURA DO CLIENTE</span>
                <p className="text-[8px] text-zinc-500">
                  Autorizo os serviços e declaro receber o {vehicleTerm.label} em perfeitas condições.
                </p>
              </div>
              <div className="text-[8px] text-zinc-400 pt-1 font-mono">
                *** Mot-OS Gestão Automotiva ***
              </div>
            </div>

            {/* Serrated / Jagged Bottom Tear Edge (Sawtooth Pattern) */}
            <div
              className="no-print absolute -bottom-2.5 left-0 right-0 h-3 overflow-hidden"
              style={{
                background:
                  "radial-gradient(circle at 5px 10px, transparent 4px, #fafafa 4.5px) repeat-x 0 0 / 10px 10px",
              }}
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FORMATO 2: FOLHA A4 PADRÃO                                */}
      {/* ========================================================= */}
      {printFormat === "a4" && (
        <div className="max-w-[210mm] mx-auto my-6 p-6 sm:p-12 bg-white text-zinc-900 shadow-2xl rounded-sm print:m-0 print:p-0 print:shadow-none print-container text-xs sm:text-sm font-sans leading-relaxed">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-5 mb-5">
            <div className="flex items-center gap-3">
              <MotOsLogo size={44} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-zinc-100 rounded-lg mb-5 border border-zinc-300 text-xs">
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
                Dados do {vehicleTerm.label}
              </h3>
              <p>
                <strong>{vehicleTerm.label}:</strong> {vehicle?.brand} {vehicle?.model} ({vehicle?.year})
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
            <div className="w-full sm:w-64 p-3 bg-zinc-100 rounded border border-zinc-300 text-xs space-y-1">
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
            e serviços prestados, contados a partir da data de entrega do {vehicleTerm.label}, conforme CDC Art.
            26, II. Não nos responsabilizamos por peças fornecidas pelo cliente ou avarias decorrentes
            de mau uso, queda ou falta de lubrificação básica pós-serviço.
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-zinc-300 text-center text-xs">
            <div>
              <div className="border-b border-zinc-800 w-4/5 mx-auto mb-1.5" />
              <p className="font-bold text-zinc-800">{customer?.name || "Cliente / Responsável"}</p>
              <p className="text-[10px] text-zinc-500">Autorização e Recebimento do {vehicleTerm.label}</p>
            </div>
            <div>
              <div className="border-b border-zinc-800 w-4/5 mx-auto mb-1.5" />
              <p className="font-bold text-zinc-800">{mechanic?.name || tenant.name}</p>
              <p className="text-[10px] text-zinc-500">Mecânico / Responsável Técnico</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
