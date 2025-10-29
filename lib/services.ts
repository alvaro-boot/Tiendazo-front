import api from "./api";
import { config } from "./config";

// Tipos de datos
export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  storeId?: number; // ID de la tienda asociada
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  fullName: string;
  email: string;
  password: string;
  role: "ADMIN" | "EMPLOYEE";
  storeId?: number; // ID de la tienda (opcional para empleados)
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface Store {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  currency?: string; // Moneda de la tienda
  taxRate?: number; // Tasa de impuesto (0-1)
  createdAt: string;
  updatedAt: string;
}

export interface StoreData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  currency?: string; // Moneda de la tienda
  taxRate?: number; // Tasa de impuesto (0-1)
}

export interface Product {
  id: number;
  name: string;
  description: string;
  purchasePrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  barcode: string;
  categoryId: number;
  storeId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductData {
  name: string;
  description: string;
  purchasePrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  barcode: string;
  categoryId: number;
  storeId: number;
}

export interface SaleDetail {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  invoiceNumber: string;
  total: number;
  isCredit: boolean;
  notes: string;
  storeId: number;
  clientId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  details: SaleDetail[];
}

export interface SaleData {
  invoiceNumber: string;
  total: number;
  isCredit: boolean;
  notes: string;
  storeId: number;
  clientId?: number;
  details: SaleDetail[];
}

export interface Client {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

// Servicios de autenticación
export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  async register(userData: RegisterData): Promise<User> {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

// Servicios de tiendas
export const storeService = {
  async getStores(): Promise<Store[]> {
    const response = await api.get("/stores");
    return response.data;
  },

  async createStore(storeData: StoreData): Promise<Store> {
    // Crear una instancia de axios sin interceptores para crear tiendas sin token
    const axios = require("axios");

    try {
      // Agregar configuración por defecto de moneda e impuestos si no se proporcionan
      const storeDataWithDefaults = {
        ...storeData,
        currency: storeData.currency || config.DEFAULT_CURRENCY,
        taxRate:
          storeData.taxRate !== undefined
            ? storeData.taxRate
            : config.DEFAULT_TAX_RATE,
      };

      console.log(
        "🏪 Enviando datos de tienda a la API:",
        storeDataWithDefaults
      );
      console.log("🔗 URL:", `${config.API_BASE_URL}/stores`);

      const response = await axios.post(
        `${config.API_BASE_URL}/stores`,
        storeDataWithDefaults,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("✅ Respuesta de la API de tiendas:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error en creación de tienda:", error);
      throw error;
    }
  },

  async getStoreById(id: number): Promise<Store> {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  },

  async updateStore(id: number, storeData: Partial<StoreData>): Promise<Store> {
    const response = await api.put(`/stores/${id}`, storeData);
    return response.data;
  },

  async deleteStore(id: number): Promise<void> {
    await api.delete(`/stores/${id}`);
  },
};

// Servicios de productos
export const productService = {
  async getProducts(): Promise<Product[]> {
    const response = await api.get("/products");
    return response.data;
  },

  async createProduct(productData: ProductData): Promise<Product> {
    const response = await api.post("/products", productData);
    return response.data;
  },

  async getProductById(id: number): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async updateProduct(
    id: number,
    productData: Partial<ProductData>
  ): Promise<Product> {
    const response = await api.patch(`/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async searchProducts(query: string): Promise<Product[]> {
    const response = await api.get(`/products/search?q=${query}`);
    return response.data;
  },
};

// Servicios de ventas
export const saleService = {
  async getSales(): Promise<Sale[]> {
    const response = await api.get("/sales");
    return response.data;
  },

  async createSale(saleData: SaleData): Promise<Sale> {
    const response = await api.post("/sales", saleData);
    return response.data;
  },

  async getSaleById(id: number): Promise<Sale> {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  async updateSale(id: number, saleData: Partial<SaleData>): Promise<Sale> {
    const response = await api.patch(`/sales/${id}`, saleData);
    return response.data;
  },

  async deleteSale(id: number): Promise<void> {
    await api.delete(`/sales/${id}`);
  },

  async cancelSale(id: number): Promise<Sale> {
    const response = await api.patch(`/sales/${id}/cancel`);
    return response.data;
  },

  async getSalesReport(startDate: string, endDate: string): Promise<any> {
    const response = await api.get(
      `/sales/report?start=${startDate}&end=${endDate}`
    );
    return response.data;
  },
};

// Servicios de clientes
export const clientService = {
  async getClients(): Promise<Client[]> {
    const response = await api.get("/clients");
    return response.data;
  },

  async createClient(clientData: ClientData): Promise<Client> {
    const response = await api.post("/clients", clientData);
    return response.data;
  },

  async getClientById(id: number): Promise<Client> {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  async updateClient(
    id: number,
    clientData: Partial<ClientData>
  ): Promise<Client> {
    const response = await api.patch(`/clients/${id}`, clientData);
    return response.data;
  },

  async deleteClient(id: number): Promise<void> {
    await api.delete(`/clients/${id}`);
  },

  async searchClients(query: string): Promise<Client[]> {
    const response = await api.get(`/clients/search?q=${query}`);
    return response.data;
  },
};

// Servicio de health check
export const healthService = {
  async checkHealth(): Promise<any> {
    const response = await api.get("/health");
    return response.data;
  },
};

// Utilidad para manejo de errores
export const handleApiError = (error: any) => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || "Error del servidor";

    switch (status) {
      case 401:
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        break;
      case 403:
        throw new Error("No tienes permisos para realizar esta acción");
      case 404:
        throw new Error("Recurso no encontrado");
      case 500:
        throw new Error("Error interno del servidor");
      default:
        throw new Error(`Error ${status}: ${message}`);
    }
  } else if (error.code === "ECONNABORTED") {
    throw new Error("Tiempo de espera agotado. Verifica tu conexión.");
  } else {
    throw new Error("Error de conexión. Verifica tu internet.");
  }
};
