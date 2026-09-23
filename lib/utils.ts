import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { OSStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatPlate(plate: string): string {
  if (!plate) return "";
  const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.length <= 3) return clean;
  // Mercosul or traditional format
  if (clean.length <= 7) {
    // If 4th char is letter, Mercosul ABC1D23 -> ABC 1D23 or keep joined
    return clean;
  }
  return clean.slice(0, 7);
}

export function formatPhone(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export const STATUS_MAP: Record<
  OSStatus,
  { label: string; bg: string; text: string; border: string; badgeClass: string }
> = {
  OPEN: {
    label: "Aberta",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  IN_PROGRESS: {
    label: "Em Execução",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  WAITING_PARTS: {
    label: "Aguardando Peças",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
    badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  WAITING_APPROVAL: {
    label: "Aguardando Aprovação",
    bg: "bg-yellow-500/10",
    text: "text-yellow-300",
    border: "border-yellow-500/30",
    badgeClass: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  },
  COMPLETED: {
    label: "Concluída",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  DELIVERED: {
    label: "Entregue",
    bg: "bg-zinc-500/10",
    text: "text-zinc-300",
    border: "border-zinc-500/30",
    badgeClass: "bg-zinc-700/30 text-zinc-300 border-zinc-600/30",
  },
  CANCELLED: {
    label: "Cancelada",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    badgeClass: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

export function getWhatsAppOSLink(
  phone: string,
  customerName: string,
  osNumber: number,
  vehicleModel: string,
  plate: string,
  status: OSStatus,
  totalAmount: number
): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;

  let statusMsg = "";
  if (status === "OPEN") {
    statusMsg = `Sua Ordem de Serviço #OS-${osNumber} para a moto ${vehicleModel} (${plate}) foi aberta com sucesso. Já estamos realizando a avaliação técnica!`;
  } else if (status === "WAITING_APPROVAL") {
    statusMsg = `Olá ${customerName}! O orçamento da sua moto ${vehicleModel} (${plate}) está pronto para aprovação. Valor total: ${formatCurrency(totalAmount)}. Podemos iniciar os serviços?`;
  } else if (status === "COMPLETED") {
    statusMsg = `Olá ${customerName}! Boas notícias: a manutenção da sua moto ${vehicleModel} (${plate}) [OS #${osNumber}] foi FINALIZADA com sucesso! Valor total: ${formatCurrency(totalAmount)}. Sua moto já está pronta para retirada na oficina.`;
  } else {
    statusMsg = `Olá ${customerName}! Atualização da OS #${osNumber} para sua moto ${vehicleModel}: Status atual: *${STATUS_MAP[status].label}*.`;
  }

  const encoded = encodeURIComponent(statusMsg);
  return `https://wa.me/${formattedPhone}?text=${encoded}`;
}
