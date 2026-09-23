import { NextRequest, NextResponse } from "next/server";
import { validateCnpj } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ cnpj: string }> }
) {
  try {
    const { cnpj } = await context.params;
    const cleanCnpj = (cnpj || "").replace(/\D/g, "");

    if (cleanCnpj.length !== 14) {
      return NextResponse.json(
        { success: false, error: "O CNPJ informado deve conter exatamente 14 dígitos numéricos." },
        { status: 400 }
      );
    }

    if (!validateCnpj(cleanCnpj)) {
      return NextResponse.json(
        { success: false, error: "O número de CNPJ informado é inválido de acordo com a validação da Receita Federal." },
        { status: 400 }
      );
    }

    // 1. Consulta prioritária na BrasilAPI (Gratuita, rápida e direta na base da Receita Federal)
    let companyData: any = null;
    let source = "brasilapi";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        companyData = await res.json();
      }
    } catch (e) {
      console.warn("Consulta na BrasilAPI falhou ou timeout, tentando fallback ReceitaWS...", e);
    }

    // 2. Fallback na ReceitaWS caso a BrasilAPI oscile
    if (!companyData) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const res = await fetch(`https://receitaws.com.br/v1/cnpj/${cleanCnpj}`, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "application/json",
          },
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const wsData = await res.json();
          if (wsData.status === "OK") {
            companyData = {
              razao_social: wsData.nome,
              nome_fantasia: wsData.fantasia,
              logradouro: wsData.logradouro,
              numero: wsData.numero,
              complemento: wsData.complemento,
              bairro: wsData.bairro,
              municipio: wsData.municipio,
              uf: wsData.uf,
              cep: wsData.cep,
              ddd_telefone_1: wsData.telefone,
            };
            source = "receitaws";
          }
        }
      } catch (e) {
        console.warn("Consulta no fallback ReceitaWS também falhou:", e);
      }
    }

    if (!companyData) {
      return NextResponse.json(
        {
          success: false,
          error: "CNPJ não encontrado na base de dados da Receita Federal ou serviços de consulta temporariamente indisponíveis.",
        },
        { status: 404 }
      );
    }

    // Montagem padronizada dos dados
    const razaoSocial = (companyData.razao_social || companyData.nome || "").trim();
    const nomeFantasia = (companyData.nome_fantasia || companyData.fantasia || razaoSocial).trim();
    const logradouro = (companyData.logradouro || "").trim();
    const numero = (companyData.numero || "").trim();
    const complemento = (companyData.complemento || "").trim();
    const bairro = (companyData.bairro || "").trim();
    const municipio = (companyData.municipio || "").trim();
    const uf = (companyData.uf || "").trim().toUpperCase();
    const cep = (companyData.cep || "").replace(/\D/g, "");

    // Formata o endereço completo conforme solicitado:
    // "Endereço Comercial da Oficina com endereço, numero, bairro, cidade e uf"
    const streetPart = logradouro
      ? `${logradouro}${numero ? `, ${numero}` : ""}${complemento ? ` - ${complemento}` : ""}`
      : "";
    const cityStatePart = municipio ? `${municipio}${uf ? ` - ${uf}` : ""}` : uf;
    const addressParts = [streetPart, bairro, cityStatePart].filter(Boolean);
    const formattedAddress = addressParts.join(", ");

    // Telefone
    let rawPhone = (companyData.ddd_telefone_1 || companyData.telefone || "").replace(/\D/g, "");
    let phoneFormatted = "";
    if (rawPhone.length >= 10) {
      const ddd = rawPhone.slice(0, 2);
      const rest = rawPhone.slice(2);
      phoneFormatted = `(${ddd}) ${rest.length === 9 ? rest.slice(0, 5) + "-" + rest.slice(5) : rest.slice(0, 4) + "-" + rest.slice(4)}`;
    }

    return NextResponse.json({
      success: true,
      source,
      cnpj: cleanCnpj,
      razaoSocial,
      nomeFantasia,
      address: formattedAddress,
      details: {
        logradouro,
        numero,
        complemento,
        bairro,
        municipio,
        uf,
        cep,
      },
      phone: phoneFormatted,
    });
  } catch (error: any) {
    console.error("Erro interno ao consultar CNPJ:", error);
    return NextResponse.json(
      { success: false, error: "Ocorreu um erro interno ao processar a consulta de CNPJ." },
      { status: 500 }
    );
  }
}
