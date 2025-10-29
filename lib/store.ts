import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "employee";
  storeId: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  currency: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  categoryId: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  imageUrl?: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  storeId: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  storeId: string;
  totalDebt: number;
  createdAt: string;
}

export interface Sale {
  id: string;
  clientId?: string;
  clientName?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: "cash" | "card" | "transfer" | "fiado";
  storeId: string;
  userId: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  cost: number;
  subtotal: number;
}

export interface Debt {
  id: string;
  clientId: string;
  saleId: string;
  amount: number;
  paid: number;
  remaining: number;
  status: "pending" | "partial" | "paid";
  dueDate?: string;
  storeId: string;
  createdAt: string;
  payments: DebtPayment[];
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  paymentMethod: "cash" | "card" | "transfer";
  createdAt: string;
  notes?: string;
}

// Store State
interface StoreState {
  user: User | null;
  currentStore: Store | null;
  stores: Store[];
  products: Product[];
  categories: Category[];
  clients: Client[];
  sales: Sale[];
  debts: Debt[];

  // Auth actions
  setUser: (user: User | null) => void;
  logout: () => void;

  // Store actions
  setCurrentStore: (store: Store) => void;
  addStore: (store: Store) => void;
  updateStore: (id: string, store: Partial<Store>) => void;

  // Product actions
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, quantity: number) => void;

  // Category actions
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Client actions
  addClient: (client: Client) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Sale actions
  addSale: (sale: Sale) => void;

  // Debt actions
  addDebt: (debt: Debt) => void;
  addPayment: (debtId: string, payment: DebtPayment) => void;

  // Initialize with mock data
  initializeMockData: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      currentStore: null,
      stores: [],
      products: [],
      categories: [],
      clients: [],
      sales: [],
      debts: [],

      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),

      setCurrentStore: (store) => set({ currentStore: store }),
      addStore: (store) =>
        set((state) => ({ stores: [...state.stores, store] })),
      updateStore: (id, store) =>
        set((state) => ({
          stores: state.stores.map((s) =>
            s.id === id ? { ...s, ...store } : s
          ),
          currentStore:
            state.currentStore?.id === id
              ? { ...state.currentStore, ...store }
              : state.currentStore,
        })),

      addProduct: (product) =>
        set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, product) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...product } : p
          ),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
      updateStock: (id, quantity) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, stock: p.stock + quantity } : p
          ),
        })),

      addCategory: (category) =>
        set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (id, category) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      addClient: (client) =>
        set((state) => ({ clients: [...state.clients, client] })),
      updateClient: (id, client) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...client } : c
          ),
        })),
      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        })),

      addSale: (sale) =>
        set((state) => {
          const updatedProducts = state.products.map((p) => {
            const saleItem = sale.items.find((item) => item.productId === p.id);
            if (saleItem) {
              return { ...p, stock: p.stock - saleItem.quantity };
            }
            return p;
          });

          return {
            sales: [sale, ...state.sales],
            products: updatedProducts,
          };
        }),

      addDebt: (debt) =>
        set((state) => {
          const updatedClients = state.clients.map((c) =>
            c.id === debt.clientId
              ? { ...c, totalDebt: c.totalDebt + debt.amount }
              : c
          );
          return {
            debts: [...state.debts, debt],
            clients: updatedClients,
          };
        }),

      addPayment: (debtId, payment) =>
        set((state) => {
          const updatedDebts = state.debts.map((d) => {
            if (d.id === debtId) {
              const newPaid = d.paid + payment.amount;
              const newRemaining = d.amount - newPaid;
              return {
                ...d,
                paid: newPaid,
                remaining: newRemaining,
                status:
                  newRemaining === 0 ? ("paid" as const) : ("partial" as const),
                payments: [...d.payments, payment],
              };
            }
            return d;
          });

          const debt = state.debts.find((d) => d.id === debtId);
          const updatedClients = debt
            ? state.clients.map((c) =>
                c.id === debt.clientId
                  ? { ...c, totalDebt: c.totalDebt - payment.amount }
                  : c
              )
            : state.clients;

          return {
            debts: updatedDebts,
            clients: updatedClients,
          };
        }),

      initializeMockData: () => {
        // Función vacía - datos de prueba eliminados para producción
        // Los usuarios deben crear su propia tienda y datos desde cero
        set({
          user: null,
          currentStore: null,
          stores: [],
          categories: [],
          products: [],
          clients: [],
          sales: [],
          debts: [],
        });
      },
    }),
    {
      name: "tiendazo-storage",
    }
  )
);
