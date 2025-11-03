import api from "./api";
import { config } from "./config";

// Tipos de datos
export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  storeId?: number; // ID de la tienda asociada (normalizado)
  store?: { // Objeto store completo del backend
    id: number;
    name: string;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
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

// SaleDetail completo (con subtotal calculado) - usado al recibir datos del backend
export interface SaleDetail {
  id?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: Product;
}

// SaleDetail para crear venta - NO incluye subtotal porque el backend lo calcula
export interface CreateSaleDetailData {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: number;
  invoiceNumber: string;
  total: number;
  profit?: number;
  isCredit: boolean;
  notes?: string;
  storeId: number;
  clientId?: number;
  userId: number;
  client?: Client;
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
  details: CreateSaleDetailData[]; // Cambiado a CreateSaleDetailData
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

export interface Category {
  id: number;
  name: string;
  description: string;
  image?: string;
  storeId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryData {
  name: string;
  description: string;
  image?: string;
  storeId: number;
}

export interface ClientData {
  fullName: string;
  email?: string;
  phone: string;
  address?: string;
  storeId: number;
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

  async refreshSession(): Promise<{ access_token: string; expiresAt: string }> {
    const response = await api.post("/auth/refresh");
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
      // Agregar configuración por defecto de moneda si no se proporciona
      const storeDataWithDefaults = {
        ...storeData,
        currency: storeData.currency || config.DEFAULT_CURRENCY,
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

// Servicios de categorías
export const categoryService = {
  async getCategories(storeId?: number): Promise<Category[]> {
    const params = storeId ? `?storeId=${storeId}` : "";
    const response = await api.get(`/categories${params}`);
    return response.data;
  },

  async createCategory(categoryData: CategoryData): Promise<Category> {
    const response = await api.post("/categories", categoryData);
    return response.data;
  },

  async getCategoryById(id: number): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async updateCategory(
    id: number,
    categoryData: Partial<CategoryData>
  ): Promise<Category> {
    const response = await api.patch(`/categories/${id}`, categoryData);
    return response.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};

// Servicios de productos
export const productService = {
  async getProducts(filters?: {
    q?: string;
    categoryId?: number;
    storeId?: number;
  }): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.q) params.append("q", filters.q);
    if (filters?.categoryId) params.append("categoryId", filters.categoryId.toString());
    if (filters?.storeId) params.append("storeId", filters.storeId.toString());
    
    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  async getLowStockProducts(storeId?: number): Promise<Product[]> {
    const params = storeId ? `?storeId=${storeId}` : "";
    const response = await api.get(`/products/low-stock${params}`);
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

  async updateStock(
    id: number,
    quantity: number,
    operation: "add" | "subtract" | "set"
  ): Promise<Product> {
    const response = await api.patch(`/products/${id}/stock`, {
      quantity,
      operation,
    });
    return response.data;
  },
};

// Servicios de ventas
export const saleService = {
  async getSales(filters?: {
    storeId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<Sale[]> {
    const params = new URLSearchParams();
    if (filters?.storeId) params.append("storeId", filters.storeId.toString());
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    
    const queryString = params.toString();
    const response = await api.get(`/sales${queryString ? `?${queryString}` : ""}`);
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

  async getSalesReport(filters?: {
    startDate?: string;
    endDate?: string;
    storeId?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.storeId) params.append("storeId", filters.storeId.toString());
    
    const queryString = params.toString();
    const response = await api.get(`/sales/report${queryString ? `?${queryString}` : ""}`);
    return response.data;
  },
};

// Servicios de clientes
export const clientService = {
  async getClients(filters?: { q?: string; storeId?: number }): Promise<Client[]> {
    const params = new URLSearchParams();
    if (filters?.q) params.append("q", filters.q);
    if (filters?.storeId) params.append("storeId", filters.storeId.toString());
    
    const queryString = params.toString();
    const response = await api.get(`/clients${queryString ? `?${queryString}` : ""}`);
    return response.data;
  },

  async getClientsWithDebt(storeId?: number): Promise<Client[]> {
    const params = storeId ? `?storeId=${storeId}` : "";
    const response = await api.get(`/clients/with-debt${params}`);
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

  async updateDebt(
    id: number,
    amount: number,
    operation: "add" | "subtract" | "set"
  ): Promise<Client> {
    const response = await api.patch(`/clients/${id}/debt`, {
      amount,
      operation,
    });
    return response.data;
  },
};

export interface InventoryMovement {
  id: number;
  productId: number;
  type: "IN" | "OUT" | "ADJUSTMENT" | "SALE" | "RETURN";
  quantity: number;
  unitPrice: number;
  reason: string;
  reference?: string;
  createdAt: string;
}

export interface StockAdjustment {
  productId: number;
  newStock: number;
  reason: string;
}

// Servicios de inventario
export const inventoryService = {
  async createMovement(movementData: {
    productId: number;
    type: "IN" | "OUT" | "ADJUSTMENT" | "SALE" | "RETURN";
    quantity: number;
    unitPrice: number;
    reason: string;
    reference?: string;
  }): Promise<InventoryMovement> {
    const response = await api.post("/inventory/movement", movementData);
    return response.data;
  },

  async adjustStock(adjustmentData: StockAdjustment): Promise<Product> {
    const response = await api.post("/inventory/adjust-stock", adjustmentData);
    return response.data;
  },

  async getMovements(productId?: number): Promise<InventoryMovement[]> {
    const params = productId ? `?productId=${productId}` : "";
    const response = await api.get(`/inventory/movements${params}`);
    return response.data;
  },

  async getLowStockProducts(storeId?: number): Promise<Product[]> {
    const params = storeId ? `?storeId=${storeId}` : "";
    const response = await api.get(`/inventory/low-stock${params}`);
    return response.data;
  },

  async getInventoryReport(storeId?: number): Promise<any> {
    const params = storeId ? `?storeId=${storeId}` : "";
    const response = await api.get(`/inventory/report${params}`);
    return response.data;
  },

  async getMovementById(id: number): Promise<InventoryMovement> {
    const response = await api.get(`/inventory/movements/${id}`);
    return response.data;
  },

  async getStockHistory(productId: number): Promise<InventoryMovement[]> {
    const response = await api.get(`/inventory/stock-history/${productId}`);
    return response.data;
  },
};

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  storeId?: number;
  clientId?: number;
  productId?: number;
  format?: "json" | "excel";
}

// Servicios de reportes
export const reportService = {
  async generateReport(reportData: {
    type: "SALES" | "INVENTORY" | "DEBTS" | "PROFITS" | "CLIENTS" | "PRODUCTS";
    startDate?: string;
    endDate?: string;
    storeId?: number;
    format?: "json" | "excel";
  }): Promise<any> {
    const response = await api.post("/reports/generate", reportData);
    return response.data;
  },

  async getSalesReport(filters: ReportFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.storeId) params.append("storeId", filters.storeId.toString());
    if (filters.clientId) params.append("clientId", filters.clientId.toString());
    if (filters.format) params.append("format", filters.format);
    
    const response = await api.get(`/reports/sales?${params.toString()}`);
    return response.data;
  },

  async getInventoryReport(filters: ReportFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters.storeId) params.append("storeId", filters.storeId.toString());
    if (filters.productId) params.append("productId", filters.productId.toString());
    if (filters.format) params.append("format", filters.format);
    
    const response = await api.get(`/reports/inventory?${params.toString()}`);
    return response.data;
  },

  async getDebtsReport(filters: ReportFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.clientId) params.append("clientId", filters.clientId.toString());
    if (filters.format) params.append("format", filters.format);
    
    const response = await api.get(`/reports/debts?${params.toString()}`);
    return response.data;
  },

  async getProfitsReport(filters: ReportFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.storeId) params.append("storeId", filters.storeId.toString());
    if (filters.format) params.append("format", filters.format);
    
    const response = await api.get(`/reports/profits?${params.toString()}`);
    return response.data;
  },
};

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// Servicios de subida de archivos
export const uploadService = {
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post("/uploads/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post("/uploads/document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export interface DebtPayment {
  id: number;
  clientId: number;
  amount: number;
  paymentType: "CASH" | "TRANSFER" | "CARD" | "OTHER";
  reference?: string;
  notes?: string;
  userId: number;
  previousDebt: number;
  newDebt: number;
  createdAt: string;
  updatedAt?: string;
  client?: Client;
  user?: User;
}

// Interfaz para representar un cliente con deuda para la UI
export interface ClientDebtInfo {
  client: Client;
  totalDebt: number;
  lastPayment?: DebtPayment;
  paymentCount: number;
}

// Servicios de fiados
export const debtService = {
  async registerPayment(paymentData: {
    clientId: number;
    amount: number;
    paymentType: "CASH" | "TRANSFER" | "CARD" | "OTHER";
    reference?: string;
    notes?: string;
  }): Promise<DebtPayment> {
    const response = await api.post("/debts/payment", paymentData);
    return response.data;
  },

  async getPaymentById(id: number): Promise<DebtPayment> {
    const response = await api.get(`/debts/payments/${id}`);
    return response.data;
  },

  async getPayments(filters?: {
    startDate?: string;
    endDate?: string;
    clientId?: number;
  }): Promise<DebtPayment[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.clientId) params.append("clientId", filters.clientId.toString());
    
    const response = await api.get(`/debts/payments?${params.toString()}`);
    return response.data;
  },

  async getDebtsReport(filters?: {
    startDate?: string;
    endDate?: string;
    clientId?: number;
    storeId?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.clientId) params.append("clientId", filters.clientId.toString());
    if (filters?.storeId) params.append("storeId", filters.storeId.toString());
    
    const response = await api.get(`/debts/report?${params.toString()}`);
    return response.data;
  },

  async getClientsWithDebt(storeId?: number): Promise<Client[]> {
    const params = storeId ? `?storeId=${storeId}` : "";
    const response = await api.get(`/debts/clients-with-debt${params}`);
    return response.data;
  },

  async getTotalDebt(storeId?: number): Promise<{ total: number }> {
    const params = storeId ? `?storeId=${storeId}` : "";
    const response = await api.get(`/debts/total-debt${params}`);
    // El backend devuelve directamente un número, normalizar a objeto
    const total = typeof response.data === 'number' ? response.data : response.data.total || 0;
    return { total };
  },

  async getClientPaymentHistory(clientId: number): Promise<DebtPayment[]> {
    const response = await api.get(`/debts/client-history/${clientId}`);
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
        // NO cerrar sesión automáticamente - solo lanzar error
        // Los componentes individuales manejarán el error
        throw new Error("Token expirado o inválido");
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
