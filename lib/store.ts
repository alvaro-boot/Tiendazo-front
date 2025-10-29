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
  taxRate: number;
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
        const storeId = "store-1";
        const userId = "user-1";

        const mockStore: Store = {
          id: storeId,
          name: "Mi Tienda Principal",
          address: "Calle Principal 123",
          phone: "+1234567890",
          currency: "COP", // Peso colombiano por defecto
          taxRate: 0, // Sin impuestos por defecto
        };

        const mockUser: User = {
          id: userId,
          email: "admin@tienda.com",
          name: "Administrador",
          role: "admin",
          storeId,
        };

        const mockCategories: Category[] = [
          {
            id: "cat-1",
            name: "Bebidas",
            description: "Bebidas y refrescos",
            storeId,
          },
          {
            id: "cat-2",
            name: "Snacks",
            description: "Botanas y dulces",
            storeId,
          },
          {
            id: "cat-3",
            name: "Lácteos",
            description: "Productos lácteos",
            storeId,
          },
          {
            id: "cat-4",
            name: "Limpieza",
            description: "Productos de limpieza",
            storeId,
          },
        ];

        const mockProducts: Product[] = [
          {
            id: "prod-1",
            name: "Coca Cola 600ml",
            description: "Refresco de cola",
            sku: "CC-600",
            barcode: "7501234567890",
            categoryId: "cat-1",
            price: 3500, // Precio en pesos colombianos
            cost: 2500,
            stock: 48,
            minStock: 20,
            storeId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "prod-2",
            name: "Sabritas Original",
            description: "Papas fritas 45g",
            sku: "SAB-45",
            barcode: "7501234567891",
            categoryId: "cat-2",
            price: 2800, // Precio en pesos colombianos
            cost: 2000,
            stock: 35,
            minStock: 15,
            storeId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "prod-3",
            name: "Leche Lala 1L",
            description: "Leche entera",
            sku: "LALA-1L",
            barcode: "7501234567892",
            categoryId: "cat-3",
            price: 4200, // Precio en pesos colombianos
            cost: 3200,
            stock: 12,
            minStock: 10,
            storeId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "prod-4",
            name: "Detergente Roma",
            description: "Detergente en polvo 1kg",
            sku: "ROM-1K",
            barcode: "7501234567893",
            categoryId: "cat-4",
            price: 8500, // Precio en pesos colombianos
            cost: 6500,
            stock: 8,
            minStock: 5,
            storeId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        const mockClients: Client[] = [
          {
            id: "client-1",
            name: "Juan Pérez",
            phone: "+1234567891",
            email: "juan@example.com",
            address: "Calle 1 #123",
            storeId,
            totalDebt: 12600, // Deuda actualizada en pesos colombianos
            createdAt: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            id: "client-2",
            name: "María García",
            phone: "+1234567892",
            storeId,
            totalDebt: 0,
            createdAt: new Date(
              Date.now() - 15 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ];

        const mockSales: Sale[] = [
          {
            id: "sale-1",
            clientName: "Cliente General",
            items: [
              {
                productId: "prod-1",
                productName: "Coca Cola 600ml",
                quantity: 2,
                price: 3500,
                cost: 2500,
                subtotal: 7000,
              },
              {
                productId: "prod-2",
                productName: "Sabritas Original",
                quantity: 1,
                price: 2800,
                cost: 2000,
                subtotal: 2800,
              },
            ],
            subtotal: 9800,
            tax: 0, // Sin impuestos
            total: 9800,
            paymentMethod: "cash",
            storeId,
            userId,
            createdAt: new Date().toISOString(),
          },
          {
            id: "sale-2",
            clientId: "client-1",
            clientName: "Juan Pérez",
            items: [
              {
                productId: "prod-3",
                productName: "Leche Lala 1L",
                quantity: 3,
                price: 4200,
                cost: 3200,
                subtotal: 12600,
              },
            ],
            subtotal: 12600,
            tax: 0, // Sin impuestos
            total: 12600,
            paymentMethod: "fiado",
            storeId,
            userId,
            createdAt: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ];

        const mockDebts: Debt[] = [
          {
            id: "debt-1",
            clientId: "client-1",
            saleId: "sale-2",
            amount: 12600, // Monto actualizado en pesos colombianos
            paid: 0,
            remaining: 12600,
            status: "pending",
            storeId,
            createdAt: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
            payments: [],
          },
        ];

        set({
          user: mockUser,
          currentStore: mockStore,
          stores: [mockStore],
          categories: mockCategories,
          products: mockProducts,
          clients: mockClients,
          sales: mockSales,
          debts: mockDebts,
        });
      },
    }),
    {
      name: "tiendazo-storage",
    }
  )
);
