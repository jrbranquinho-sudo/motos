"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Customer,
  MaintenanceRecord,
  OSStatus,
  Part,
  ServiceOrder,
  StockMovement,
  Tenant,
  User,
  Vehicle,
} from "./types";
import {
  SEED_CUSTOMERS,
  SEED_MAINTENANCE_RECORDS,
  SEED_PARTS,
  SEED_SERVICE_ORDERS,
  SEED_TENANTS,
  SEED_USERS,
  SEED_VEHICLES,
} from "./seedData";

interface MotoShopContextType {
  isLoaded: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  tenant: Tenant;
  tenants: Tenant[];
  setTenant: (tenant: Tenant) => void;
  updateTenant: (id: string, data: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  toggleTenantStatus: (id: string) => void;
  addTenant: (
    tenantData: Omit<Tenant, "id" | "createdAt">,
    ownerData: { name: string; email: string; username?: string; phone?: string }
  ) => { tenant: Tenant; owner: User };
  renewSubscription: (tenantId: string, plan: "MONTHLY" | "ANNUAL") => void;
  simulateSubscriptionDays: (tenantId: string, daysRemaining: number) => void;
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  addUser: (user: Omit<User, "id" | "tenantId">) => User;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Permissions & RBAC
  isSaasOwner: boolean;
  isShopOwner: boolean;
  isManager: boolean;
  isReceptionist: boolean;
  isMechanic: boolean;
  canViewFinancials: boolean;
  canManageUsers: boolean;
  canFinalizeOS: boolean;
  visibleOrders: ServiceOrder[];

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, "id" | "createdAt" | "tenantId">) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  getCustomerById: (id: string) => Customer | undefined;

  // Vehicles
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, "id" | "createdAt" | "tenantId">) => Vehicle;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  getVehicleByPlate: (plate: string) => Vehicle | undefined;
  getVehicleById: (id: string) => Vehicle | undefined;

  // Parts & Stock
  parts: Part[];
  addPart: (part: Omit<Part, "id" | "createdAt" | "tenantId">) => Part;
  updatePart: (id: string, data: Partial<Part>) => void;
  adjustStock: (partId: string, quantityDelta: number, reason: string, osId?: string) => void;
  stockMovements: StockMovement[];
  lowStockParts: Part[];

  // Service Orders
  serviceOrders: ServiceOrder[];
  addServiceOrder: (
    order: Omit<ServiceOrder, "id" | "osNumber" | "tenantId" | "createdAt" | "updatedAt">
  ) => ServiceOrder;
  updateServiceOrder: (id: string, data: Partial<ServiceOrder>) => void;
  updateOSStatus: (id: string, status: OSStatus) => void;
  toggleTimer: (id: string) => void;
  getServiceOrderById: (id: string) => ServiceOrder | undefined;

  // Maintenance Records
  maintenanceRecords: MaintenanceRecord[];
  getVehicleMaintenanceHistory: (vehicleId: string) => MaintenanceRecord[];

  // Reset
  resetToDefaults: () => void;

  // Metrics
  metrics: {
    openOrders: number;
    inProgressOrders: number;
    waitingOrders: number;
    completedToday: number;
    monthlyRevenue: number;
    totalPartsCost: number;
    totalProfit: number;
    lowStockCount: number;
    activeMechanicsCount: number;
  };
}


const STORAGE_KEY = "motoshop_sistema_estavel_v1";

const MotoShopContext = createContext<MotoShopContextType | null>(null);

export function MotoShopProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [tenants, setTenants] = useState<Tenant[]>(SEED_TENANTS);
  const [tenant, setTenantState] = useState<Tenant>(SEED_TENANTS[0]);
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [currentUser, setCurrentUserState] = useState<User>(SEED_USERS[0]);

  const [customers, setCustomers] = useState<Customer[]>(SEED_CUSTOMERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(SEED_VEHICLES);
  const [parts, setParts] = useState<Part[]>(SEED_PARTS);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(SEED_SERVICE_ORDERS);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(
    SEED_MAINTENANCE_RECORDS
  );
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("motoshop_sistema_v5");
      const sessionActive =
        typeof window !== "undefined" &&
        sessionStorage.getItem("motoshop_session_active") === "true";
      const sessionUserId =
        typeof window !== "undefined"
          ? sessionStorage.getItem("motoshop_session_user_id")
          : null;

      setIsAuthenticated(sessionActive);

      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tenants) setTenants(parsed.tenants);
        if (parsed.currentTenantId) {
          const foundTenant = (parsed.tenants || SEED_TENANTS).find(
            (t: Tenant) => t.id === parsed.currentTenantId
          );
          if (foundTenant) setTenantState(foundTenant);
        }
        if (parsed.users) {
          const hasMaster = parsed.users.some(
            (u: User) => u.username === "jrbranquinho" || u.email === "jrbranquinho@motoshop.com.br"
          );
          const rawUsers = hasMaster ? parsed.users : [SEED_USERS[0], ...parsed.users];
          const loadedUsers = rawUsers.map((u: User) => {
            if (u.id === "user-1" || u.username === "marcos" || u.email === "marcos@rota66.com.br") {
              return {
                ...u,
                name: "Pablo Silva",
                username: "pablo",
                email: "pablo@rota66.com.br",
              };
            }
            if (u.role === "SUPER_ADMIN") {
              return { ...u, tenantId: "tenant-1" };
            }
            return u;
          });
          setUsers(loadedUsers);
        }
        const activeUserId = sessionUserId || parsed.currentUserId;
        if (activeUserId) {
          const foundUser = (parsed.users || SEED_USERS).find(
            (u: User) => u.id === activeUserId
          );
          if (foundUser) {
            if (foundUser.id === "user-1" || foundUser.username === "marcos") {
              setCurrentUserState({
                ...foundUser,
                name: "Pablo Silva",
                username: "pablo",
                email: "pablo@rota66.com.br",
              });
            } else {
              setCurrentUserState(foundUser);
            }
          }
        }
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.vehicles) setVehicles(parsed.vehicles);
        if (parsed.parts) setParts(parsed.parts);
        if (parsed.serviceOrders) setServiceOrders(parsed.serviceOrders);
        if (parsed.maintenanceRecords) setMaintenanceRecords(parsed.maintenanceRecords);
        if (parsed.stockMovements) setStockMovements(parsed.stockMovements);
      }
    } catch (e) {
      console.error("Error loading MotoShop store from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const data = {
        isAuthenticated,
        currentTenantId: tenant.id,
        currentUserId: currentUser.id,
        tenants,
        users,
        customers,
        vehicles,
        parts,
        serviceOrders,
        maintenanceRecords,
        stockMovements,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving MotoShop store to localStorage", e);
    }
  }, [
    isLoaded,
    isAuthenticated,
    tenant,
    currentUser,
    tenants,
    users,
    customers,
    vehicles,
    parts,
    serviceOrders,
    maintenanceRecords,
    stockMovements,
  ]);

  const login = (user: User) => {
    setCurrentUserState(user);
    if (user.tenantId) {
      const foundTenant = tenants.find((t) => t.id === user.tenantId);
      if (foundTenant) setTenantState(foundTenant);
    }
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("motoshop_session_active", "true");
        sessionStorage.setItem("motoshop_session_user_id", user.id);
      } catch (e) {
        // ignore
      }
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("motoshop_session_active");
        sessionStorage.removeItem("motoshop_session_user_id");
        sessionStorage.removeItem("motoshop_last_route");
      } catch (e) {
        // ignore
      }
    }
  };

  const setTenant = (t: Tenant) => {
    setTenantState(t);
    const tenantUser = users.find((u) => u.tenantId === t.id) || users[0];
    if (tenantUser) setCurrentUserState(tenantUser);
  };

  const updateTenant = (id: string, data: Partial<Tenant>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
    setTenantState((prev) => (prev.id === id ? { ...prev, ...data } : prev));
  };

  const deleteTenant = (id: string) => {
    if (id === "tenant-1") {
      alert("A oficina modelo Rota 66 Custom & Oficina não pode ser excluída.");
      return;
    }
    setTenants((prev) => prev.filter((t) => t.id !== id));
    setUsers((prev) => prev.filter((u) => u.tenantId !== id));
    setVehicles((prev) => prev.filter((v) => v.tenantId !== id));
    setCustomers((prev) => prev.filter((c) => c.tenantId !== id));
    setParts((prev) => prev.filter((p) => p.tenantId !== id));
    setServiceOrders((prev) => prev.filter((so) => so.tenantId !== id));
    setMaintenanceRecords((prev) => prev.filter((m) => m.tenantId !== id));
    if (tenant.id === id) {
      setTenantState(SEED_TENANTS[0]);
    }
  };

  const toggleTenantStatus = (id: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
    setTenantState((prev) => {
      if (prev.id === id) {
        const nextStatus = prev.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
        return { ...prev, status: nextStatus };
      }
      return prev;
    });
  };

  const addTenant = (
    tenantData: Omit<Tenant, "id" | "createdAt">,
    ownerData: { name: string; email: string; username?: string; phone?: string }
  ) => {
    const newTenantId = `tenant-${Date.now()}`;
    const isAnnual =
      tenantData.plan === "ANNUAL" ||
      tenantData.subscriptionCycle === "ANNUAL" ||
      tenantData.subscriptionDurationDays === 365;
    const durationDays = isAnnual ? 365 : 30;
    const price = isAnnual ? 2000 : 280;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const newTenant: Tenant = {
      ...tenantData,
      id: newTenantId,
      plan: isAnnual ? "ANNUAL" : "MONTHLY",
      subscriptionCycle: isAnnual ? "ANNUAL" : "MONTHLY",
      subscriptionPrice: price,
      subscriptionDurationDays: durationDays,
      subscriptionStartedAt: now.toISOString(),
      subscriptionExpiresAt: expiresAt,
      subscriptionStatus: "ACTIVE",
      createdAt: now.toISOString(),
      lastAccessAt: now.toISOString(),
      lastAccessUser: ownerData.name,
      lastAccessUserRole: "Proprietário / Admin",
      totalRevenue: 0,
      ordersCount: 0,
      vehiclesCount: 0,
      activeUsersCount: 1,
      status: "ACTIVE",
    };

    const newOwner: User = {
      id: `user-${Date.now()}`,
      name: ownerData.name,
      email: ownerData.email,
      username: ownerData.username || ownerData.email.split("@")[0],
      phone: ownerData.phone,
      role: "ADMIN",
      tenantId: newTenantId,
      password: "mot-os123",
      mustChangePassword: true,
      twoFactorEnabled: true,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    };

    setTenants((prev) => [newTenant, ...prev]);
    setUsers((prev) => [newOwner, ...prev]);

    return { tenant: newTenant, owner: newOwner };
  };

  const renewSubscription = (tenantId: string, plan: "MONTHLY" | "ANNUAL") => {
    const isAnnual = plan === "ANNUAL";
    const durationDays = isAnnual ? 365 : 30;
    const price = isAnnual ? 2000 : 280;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          return {
            ...t,
            plan,
            subscriptionCycle: plan,
            subscriptionPrice: price,
            subscriptionDurationDays: durationDays,
            subscriptionStartedAt: now.toISOString(),
            subscriptionExpiresAt: expiresAt,
            subscriptionStatus: "ACTIVE",
            status: "ACTIVE",
          };
        }
        return t;
      })
    );

    setTenantState((prev) => {
      if (prev.id === tenantId) {
        return {
          ...prev,
          plan,
          subscriptionCycle: plan,
          subscriptionPrice: price,
          subscriptionDurationDays: durationDays,
          subscriptionStartedAt: now.toISOString(),
          subscriptionExpiresAt: expiresAt,
          subscriptionStatus: "ACTIVE",
          status: "ACTIVE",
        };
      }
      return prev;
    });
  };

  const simulateSubscriptionDays = (tenantId: string, daysRemaining: number) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000).toISOString();

    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          const totalDays = t.subscriptionDurationDays || 30;
          const startedAt = new Date(
            new Date(expiresAt).getTime() - totalDays * 24 * 60 * 60 * 1000
          ).toISOString();
          const status =
            daysRemaining <= 0
              ? "EXPIRED"
              : daysRemaining / totalDays <= 0.15
              ? "WARNING"
              : "ACTIVE";
          return {
            ...t,
            subscriptionStartedAt: startedAt,
            subscriptionExpiresAt: expiresAt,
            subscriptionStatus: status,
          };
        }
        return t;
      })
    );

    setTenantState((prev) => {
      if (prev.id === tenantId) {
        const totalDays = prev.subscriptionDurationDays || 30;
        const startedAt = new Date(
          new Date(expiresAt).getTime() - totalDays * 24 * 60 * 60 * 1000
        ).toISOString();
        const status =
          daysRemaining <= 0
            ? "EXPIRED"
            : daysRemaining / totalDays <= 0.15
            ? "WARNING"
            : "ACTIVE";
        return {
          ...prev,
          subscriptionStartedAt: startedAt,
          subscriptionExpiresAt: expiresAt,
          subscriptionStatus: status,
        };
      }
      return prev;
    });
  };

  const setCurrentUser = (u: User) => {
    setCurrentUserState(u);
  };

  const addUser = (data: Omit<User, "id" | "tenantId">): User => {
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      tenantId: tenant.id,
      password: data.password || "mot-os123",
      mustChangePassword: data.mustChangePassword ?? true,
      twoFactorEnabled: data.twoFactorEnabled ?? true,
      avatar: data.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    if (currentUser.id === id) {
      setCurrentUserState((prev) => ({ ...prev, ...data }));
    }
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const addCustomer = (data: Omit<Customer, "id" | "createdAt" | "tenantId">): Customer => {
    const newCustomer: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      tenantId: tenant.id,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const getCustomerById = (id: string) => customers.find((c) => c.id === id);

  const addVehicle = (data: Omit<Vehicle, "id" | "createdAt" | "tenantId">): Vehicle => {
    const newVehicle: Vehicle = {
      ...data,
      plate: data.plate.toUpperCase().replace(/[^A-Z0-9]/g, ""),
      id: `veh-${Date.now()}`,
      tenantId: tenant.id,
      createdAt: new Date().toISOString(),
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    return newVehicle;
  };

  const updateVehicle = (id: string, data: Partial<Vehicle>) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updated = { ...v, ...data };
          if (data.plate) {
            updated.plate = data.plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
          }
          return updated;
        }
        return v;
      })
    );
  };

  const getVehicleByPlate = (rawPlate: string) => {
    const clean = rawPlate.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!clean) return undefined;
    return vehicles.find(
      (v) =>
        v.tenantId === tenant.id &&
        v.plate.toUpperCase().replace(/[^A-Z0-9]/g, "").includes(clean)
    );
  };

  const getVehicleById = (id: string) => vehicles.find((v) => v.id === id);

  const addPart = (data: Omit<Part, "id" | "createdAt" | "tenantId">): Part => {
    const newPart: Part = {
      ...data,
      id: `part-${Date.now()}`,
      tenantId: tenant.id,
      createdAt: new Date().toISOString(),
    };
    setParts((prev) => [newPart, ...prev]);
    return newPart;
  };

  const updatePart = (id: string, data: Partial<Part>) => {
    setParts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const adjustStock = (partId: string, quantityDelta: number, reason: string, osId?: string) => {
    setParts((prev) =>
      prev.map((p) => {
        if (p.id === partId) {
          const newQty = Math.max(0, p.stockQty + quantityDelta);
          return { ...p, stockQty: newQty };
        }
        return p;
      })
    );

    const targetPart = parts.find((p) => p.id === partId);
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      partId,
      partName: targetPart?.name,
      type: quantityDelta > 0 ? "IN" : quantityDelta < 0 ? "OUT" : "ADJUSTMENT",
      qty: Math.abs(quantityDelta),
      reason,
      osId,
      tenantId: tenant.id,
      createdAt: new Date().toISOString(),
    };
    setStockMovements((prev) => [movement, ...prev]);
  };

  const addServiceOrder = (
    orderData: Omit<ServiceOrder, "id" | "osNumber" | "tenantId" | "createdAt" | "updatedAt">
  ): ServiceOrder => {
    const maxOs = serviceOrders
      .filter((o) => o.tenantId === tenant.id)
      .reduce((max, o) => Math.max(max, o.osNumber), 100);

    const newOsNumber = maxOs + 1;
    const now = new Date().toISOString();

    const newOrder: ServiceOrder = {
      ...orderData,
      id: `os-${Date.now()}`,
      osNumber: newOsNumber,
      tenantId: tenant.id,
      createdAt: now,
      updatedAt: now,
    };

    // Deduct stock for all parts in this OS
    newOrder.items.forEach((item) => {
      if (item.type === "PART" && item.partId) {
        adjustStock(
          item.partId,
          -Number(item.quantity),
          `Utilizado na OS #${newOsNumber}`,
          newOrder.id
        );
      }
    });

    // Update vehicle KM
    updateVehicle(newOrder.vehicleId, { currentKm: newOrder.kmAtService });

    setServiceOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateServiceOrder = (id: string, data: Partial<ServiceOrder>) => {
    setServiceOrders((prev) =>
      prev.map((order) => {
        if (order.id === id) {
          const updated = { ...order, ...data, updatedAt: new Date().toISOString() };
          // If status changed to COMPLETED, add maintenance record
          if (data.status === "COMPLETED" && order.status !== "COMPLETED") {
            updated.completedAt = new Date().toISOString();
            const record: MaintenanceRecord = {
              id: `maint-${Date.now()}`,
              vehicleId: order.vehicleId,
              osId: order.id,
              km: order.kmAtService,
              description: `OS #${order.osNumber}: ${order.complaint || "Revisão e manutenção"}`,
              date: new Date().toISOString(),
              tenantId: tenant.id,
              cost: order.totalAmount,
            };
            setMaintenanceRecords((mPrev) => [record, ...mPrev]);
          }
          return updated;
        }
        return order;
      })
    );
  };

  const updateOSStatus = (id: string, status: OSStatus) => {
    updateServiceOrder(id, { status });
  };

  const toggleTimer = (id: string) => {
    const order = serviceOrders.find((o) => o.id === id);
    if (!order) return;

    if (order.isTimerRunning) {
      // Stop timer and add elapsed minutes
      const elapsed = order.timerStartedAt
        ? Math.round((Date.now() - new Date(order.timerStartedAt).getTime()) / 60000)
        : 0;
      updateServiceOrder(id, {
        isTimerRunning: false,
        timerStartedAt: undefined,
        spentMinutes: (order.spentMinutes || 0) + elapsed,
      });
    } else {
      // Start timer
      updateServiceOrder(id, {
        isTimerRunning: true,
        timerStartedAt: new Date().toISOString(),
      });
    }
  };

  const getServiceOrderById = (id: string) => {
    const order = serviceOrders.find((o) => o.id === id);
    if (!order) return undefined;
    const vehicle = vehicles.find((v) => v.id === order.vehicleId);
    const customer = vehicle ? customers.find((c) => c.id === vehicle.customerId) : undefined;
    const mechanic = users.find((u) => u.id === order.mechanicId);

    return {
      ...order,
      vehicle: vehicle ? { ...vehicle, customer } : undefined,
      mechanic,
    };
  };

  const getVehicleMaintenanceHistory = (vehicleId: string) => {
    return maintenanceRecords.filter((m) => m.vehicleId === vehicleId);
  };

  const resetToDefaults = () => {
    setTenants(SEED_TENANTS);
    setTenantState(SEED_TENANTS[0]);
    setUsers(SEED_USERS);
    setCurrentUserState(SEED_USERS[0]);
    setCustomers(SEED_CUSTOMERS);
    setVehicles(SEED_VEHICLES);
    setParts(SEED_PARTS);
    setServiceOrders(SEED_SERVICE_ORDERS);
    setMaintenanceRecords(SEED_MAINTENANCE_RECORDS);
    setStockMovements([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const lowStockParts = parts.filter(
    (p) => p.tenantId === tenant.id && p.stockQty <= p.minStock
  );

  // Permission flags & role-based restrictions
  const isSaasOwner = currentUser.role === "SUPER_ADMIN";
  const isShopOwner = currentUser.role === "ADMIN";
  const isManager = currentUser.role === "MANAGER";
  const isReceptionist = currentUser.role === "RECEPTIONIST";
  const isMechanic = currentUser.role === "MECHANIC";

  const canViewFinancials = !isMechanic;
  const canManageUsers =
    currentUser.role === "ADMIN" ||
    currentUser.role === "MANAGER" ||
    currentUser.role === "RECEPTIONIST" ||
    currentUser.role === "SUPER_ADMIN";
  const canFinalizeOS = !isMechanic;

  // Each mechanic only sees OS assigned to or executed by them
  const visibleOrders = isMechanic
    ? serviceOrders.filter((o) => o.tenantId === tenant.id && o.mechanicId === currentUser.id)
    : serviceOrders.filter((o) => o.tenantId === tenant.id);

  // Computed metrics for current user / tenant
  const targetOrders = visibleOrders;
  const openOrders = targetOrders.filter((o) => o.status === "OPEN").length;
  const inProgressOrders = targetOrders.filter((o) => o.status === "IN_PROGRESS").length;
  const waitingOrders = targetOrders.filter(
    (o) => o.status === "WAITING_PARTS" || o.status === "WAITING_APPROVAL"
  ).length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const completedToday = targetOrders.filter(
    (o) => o.status === "COMPLETED" && (o.completedAt || o.updatedAt).startsWith(todayStr)
  ).length;

  // Mechanics never see financials (always 0 for mechanics)
  const monthlyRevenue = isMechanic
    ? 0
    : targetOrders
        .filter((o) => o.status === "COMPLETED" || o.status === "DELIVERED")
        .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const totalPartsCost = isMechanic
    ? 0
    : parts
        .filter((p) => p.tenantId === tenant.id)
        .reduce((acc, p) => acc + p.costPrice * p.stockQty, 0);

  const totalProfit = isMechanic
    ? 0
    : targetOrders
        .filter((o) => o.status === "COMPLETED" || o.status === "DELIVERED")
        .reduce((acc, o) => acc + (o.totalLabor || 0), 0);

  const activeMechanicsCount = users.filter(
    (u) => u.tenantId === tenant.id && u.role === "MECHANIC"
  ).length;

  const metrics = {
    openOrders,
    inProgressOrders,
    waitingOrders,
    completedToday,
    monthlyRevenue,
    totalPartsCost,
    totalProfit,
    lowStockCount: lowStockParts.length,
    activeMechanicsCount,
  };

  return (
    <MotoShopContext.Provider
      value={{
        isLoaded,
        isAuthenticated,
        login,
        logout,
        tenant,
        tenants,
        setTenant,
        updateTenant,
        deleteTenant,
        toggleTenantStatus,
        addTenant,
        renewSubscription,
        simulateSubscriptionDays,
        currentUser,
        users,
        setCurrentUser,
        addUser,
        updateUser,
        deleteUser,
        isSaasOwner,
        isShopOwner,
        isManager,
        isReceptionist,
        isMechanic,
        canViewFinancials,
        canManageUsers,
        canFinalizeOS,
        visibleOrders,
        customers,
        addCustomer,
        updateCustomer,
        getCustomerById,
        vehicles,
        addVehicle,
        updateVehicle,
        getVehicleByPlate,
        getVehicleById,
        parts,
        addPart,
        updatePart,
        adjustStock,
        stockMovements,
        lowStockParts,
        serviceOrders,
        addServiceOrder,
        updateServiceOrder,
        updateOSStatus,
        toggleTimer,
        getServiceOrderById,
        maintenanceRecords,
        getVehicleMaintenanceHistory,
        resetToDefaults,
        metrics,
      }}
    >
      {children}
    </MotoShopContext.Provider>
  );

}

export function useMotoShop() {
  const context = useContext(MotoShopContext);
  if (!context) {
    throw new Error("useMotoShop must be used within a MotoShopProvider");
  }
  return context;
}
