export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'MECHANIC' | 'RECEPTIONIST';
export type Plan = 'MONTHLY' | 'ANNUAL' | 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' | 'TRIAL';
export type WorkshopType = 'MOTOS' | 'CARROS' | 'CAMINHOES' | 'NAUTICA' | 'GERAL';

export type OSStatus = 
  | 'OPEN'               // Aberta
  | 'IN_PROGRESS'        // Em execução
  | 'WAITING_PARTS'      // Aguardando peças
  | 'WAITING_APPROVAL'   // Aguardando aprovação
  | 'COMPLETED'          // Concluída
  | 'DELIVERED'          // Entregue
  | 'CANCELLED';         // Cancelada

export type ItemType = 'PART' | 'LABOR';
export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  workshopType?: WorkshopType;
  phone?: string;
  email?: string;
  cnpj?: string;
  address?: string;
  createdAt: string;
  lastAccessAt?: string;
  lastAccessUser?: string;
  lastAccessUserRole?: string;
  totalRevenue?: number;
  ordersCount?: number;
  vehiclesCount?: number;
  activeUsersCount?: number;
  status?: 'ACTIVE' | 'PENDING' | 'SUSPENDED';

  // Subscription lifecycle
  subscriptionCycle?: 'MONTHLY' | 'ANNUAL' | 'TRIAL';
  subscriptionPrice?: number;
  subscriptionDurationDays?: number; // 7, 30 or 365
  subscriptionStartedAt?: string;
  subscriptionExpiresAt?: string;
  subscriptionStatus?: 'ACTIVE' | 'WARNING' | 'EXPIRED' | 'TRIAL';
  isTrial?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: Role;
  tenantId: string;
  phone?: string;
  password?: string;
  avatar?: string;
  mustChangePassword?: boolean;
  twoFactorEnabled?: boolean;
  commissionRate?: number; // % comissão sobre mão de obra (ex: 8.0)
  specialty?: string;     // especialidade do mecânico (ex: Elétrica e injeção, Motor e câmbio)
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface ServiceCatalogItem {
  id: string;
  name: string;
  department: string;
  description?: string;
  price: number;
  estimatedHours: number;
  tenantId: string;
  createdAt: string;
}

export interface FinancialRecord {
  id: string;
  type: 'RECEITA' | 'DESPESA';
  description: string;
  amount: number;
  date: string;
  category: string;
  referenceOsId?: string;
  tenantId: string;
  createdAt: string;
}


export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  document?: string; // CPF ou CNPJ
  tenantId: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  plate: string;        // ABC1D23 ou ABC-1234
  brand: string;        // Honda, Yamaha, etc.
  model: string;        // CG 160 Titan, Fazer 250, etc.
  year: number;
  color?: string;
  chassis?: string;
  currentKm: number;
  customerId: string;
  customer?: Customer;
  tenantId: string;
  createdAt: string;
}

export interface OSItem {
  id: string;
  serviceOrderId: string;
  type: ItemType;       // PART ou LABOR
  partId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  notes?: string;
}

export interface ServiceOrder {
  id: string;
  osNumber: number;
  status: OSStatus;
  vehicleId: string;
  vehicle?: Vehicle;
  mechanicId: string;
  mechanic?: User;
  tenantId: string;
  kmAtService: number;
  kmNextService?: number;
  complaint: string;
  diagnosis?: string;
  notes?: string;
  checklist?: ChecklistItem[];
  items: OSItem[];
  totalParts: number;
  totalLabor: number;
  totalDiscount: number;
  totalAmount: number;
  estimatedMinutes?: number;
  spentMinutes?: number;
  isTimerRunning?: boolean;
  timerStartedAt?: string;
  completedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Part {
  id: string;
  code: string;
  name: string;
  description?: string;
  brand?: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stockQty: number;
  minStock: number;
  unit?: "UN" | "PÇ" | "BD" | "FR" | "LT" | "KT" | "CJ" | "KL" | string;
  location?: string;
  tenantId: string;
  supplierId?: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  partId: string;
  partName?: string;
  type: MovementType;
  qty: number;
  reason?: string;
  osId?: string;
  tenantId: string;
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  osId?: string;
  km: number;
  description: string;
  date: string;
  tenantId: string;
  cost: number;
}
