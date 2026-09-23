import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { UrlMasker } from "@/components/layout/UrlMasker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MotoShop — Gestão Inteligente para Oficinas de Motos",
  description:
    "Sistema completo para oficinas e autopeças de motos: Ordem de Serviço, Busca por Placa, Estoque em Tempo Real e Impressão Térmica 80mm.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0f0f0f] text-zinc-100 selection:bg-orange-500 selection:text-white">
        <Providers>
          <UrlMasker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
