"use client";

import { useState, useEffect, useCallback } from "react";
import {
  storeService,
  productService,
  clientService,
  saleService,
  Store,
  Product,
  Client,
  Sale,
  StoreData,
  ProductData,
  ClientData,
  SaleData,
} from "@/lib/services";
import { handleApiError } from "@/lib/services";

// Hook para tiendas
export const useStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storeService.getStores();
      setStores(data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage.message);
    } finally {
      setLoading(false);
    }
  };

  const createStore = async (storeData: StoreData) => {
    try {
      const newStore = await storeService.createStore(storeData);
      setStores((prev) => [...prev, newStore]);
      return newStore;
    } catch (err) {
      const errorMessage = handleApiError(err);
      throw errorMessage;
    }
  };

  const updateStore = async (id: number, storeData: Partial<StoreData>) => {
    try {
      const updatedStore = await storeService.updateStore(id, storeData);
      setStores((prev) =>
        prev.map((store) => (store.id === id ? updatedStore : store))
      );
      return updatedStore;
    } catch (err) {
      const errorMessage = handleApiError(err);
      throw errorMessage;
    }
  };

  const deleteStore = async (id: number) => {
    try {
      await storeService.deleteStore(id);
      setStores((prev) => prev.filter((store) => store.id !== id));
    } catch (err) {
      const errorMessage = handleApiError(err);
      throw errorMessage;
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return {
    stores,
    loading,
    error,
    fetchStores,
    createStore,
    updateStore,
    deleteStore,
  };
};

// Hook para productos
export const useProducts = (storeId?: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts();

      // Normalizar los datos: asegurar que los precios sean números
      const normalizedData = data.map((product) => ({
        ...product,
        purchasePrice: Number(product.purchasePrice || 0),
        sellPrice: Number(product.sellPrice || 0),
        stock: Number(product.stock || 0),
        minStock: Number(product.minStock || 0),
      }));

      // Filtrar productos por tienda si se proporciona storeId
      const filteredProducts = storeId
        ? normalizedData.filter((product) => product.storeId === storeId)
        : normalizedData;

      setProducts(filteredProducts);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage.message);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: ProductData) => {
    try {
      const newProduct = await productService.createProduct(productData);
      // Normalizar el producto creado
      const normalizedProduct = {
        ...newProduct,
        purchasePrice: Number(newProduct.purchasePrice || 0),
        sellPrice: Number(newProduct.sellPrice || 0),
        stock: Number(newProduct.stock || 0),
        minStock: Number(newProduct.minStock || 0),
      };
      // Recargar productos desde el servidor para obtener datos actualizados
      await fetchProducts();
      return normalizedProduct;
    } catch (err) {
      const errorMessage = handleApiError(err);
      throw errorMessage;
    }
  };

  const updateProduct = async (
    id: number,
    productData: Partial<ProductData>
  ) => {
    try {
      const updatedProduct = await productService.updateProduct(
        id,
        productData
      );
      // Recargar productos desde el servidor para obtener datos actualizados
      await fetchProducts();
      // Normalizar el producto actualizado para retornarlo
      const normalizedProduct = {
        ...updatedProduct,
        purchasePrice: Number(updatedProduct.purchasePrice || 0),
        sellPrice: Number(updatedProduct.sellPrice || 0),
        stock: Number(updatedProduct.stock || 0),
        minStock: Number(updatedProduct.minStock || 0),
      };
      return normalizedProduct;
    } catch (err) {
      const errorMessage = handleApiError(err);
      throw errorMessage;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await productService.deleteProduct(id);
      // Recargar productos desde el servidor para obtener datos actualizados
      await fetchProducts();
    } catch (err) {
      const errorMessage = handleApiError(err);
      throw errorMessage;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [storeId]); // Ejecutar cuando cambie el storeId

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};

// Hook para clientes
export const useClients = (storeId?: number) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usar useCallback para memoizar fetchClients y evitar recreaciones innecesarias
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("👥 Obteniendo clientes, storeId:", storeId);
      const data = await clientService.getClients(storeId ? { storeId } : undefined);
      console.log("✅ Clientes obtenidos:", data.length);
      setClients(data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage.message);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [storeId]); // Solo recrear cuando cambie storeId

  useEffect(() => {
    // Solo ejecutar si hay un storeId válido
    if (storeId !== undefined && storeId !== null) {
      console.log("🔄 useClients: Ejecutando fetchClients para storeId:", storeId);
      fetchClients();
    } else {
      console.log("⏸️ useClients: No hay storeId, no se cargarán clientes");
      setLoading(false);
      setClients([]);
    }
  }, [storeId, fetchClients]);

  const createClient = async (clientData: ClientData) => {
    try {
      const newClient = await clientService.createClient(clientData);
      setClients((prev) => [...prev, newClient]);
      return newClient;
    } catch (err) {
      const errorMessage = handleApiError(err);
      throw errorMessage;
    }
  };

  const updateClient = async (id: number, clientData: Partial<ClientData>) => {
    try {
      const updatedClient = await clientService.updateClient(id, clientData);
      setClients((prev) =>
        prev.map((client) => (client.id === id ? updatedClient : client))
      );
      return updatedClient;
    } catch (err) {
      const errorMessage = handleApiError(err);
      throw errorMessage;
    }
  };

  const deleteClient = async (id: number) => {
    try {
      await clientService.deleteClient(id);
      setClients((prev) => prev.filter((client) => client.id !== id));
    } catch (err) {
      const errorMessage = handleApiError(err);
      throw errorMessage;
    }
  };

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
};

// Hook para ventas
export const useSales = (storeId?: number) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usar useCallback para memoizar fetchSales y evitar recreaciones innecesarias
  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🛒 Obteniendo ventas, storeId:", storeId);
      const data = await saleService.getSales(storeId ? { storeId } : undefined);
      console.log("✅ Ventas obtenidas:", data.length);
      setSales(data);
    } catch (err: any) {
      console.error("❌ Error obteniendo ventas:", err);
      const errorMessage = handleApiError(err);
      setError(errorMessage.message);
      setSales([]); // Asegurar que sales sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  }, [storeId]); // Solo recrear cuando cambie storeId

  useEffect(() => {
    // Solo ejecutar si hay un storeId válido
    if (storeId !== undefined && storeId !== null) {
      console.log("🔄 useSales: Ejecutando fetchSales para storeId:", storeId);
      fetchSales();
    } else {
      console.log("⏸️ useSales: No hay storeId, no se cargarán ventas");
      setLoading(false);
      setSales([]);
    }
  }, [storeId, fetchSales]);

  const createSale = async (saleData: SaleData) => {
    try {
      const newSale = await saleService.createSale(saleData);
      setSales((prev) => [...prev, newSale]);
      return newSale;
    } catch (err) {
      const errorMessage = handleApiError(err);
      throw errorMessage;
    }
  };

  const updateSale = async (id: number, saleData: Partial<SaleData>) => {
    try {
      const updatedSale = await saleService.updateSale(id, saleData);
      setSales((prev) =>
        prev.map((sale) => (sale.id === id ? updatedSale : sale))
      );
      return updatedSale;
    } catch (err) {
      const errorMessage = handleApiError(err);
      throw errorMessage;
    }
  };

  const deleteSale = async (id: number) => {
    try {
      await saleService.deleteSale(id);
      setSales((prev) => prev.filter((sale) => sale.id !== id));
    } catch (err) {
      const errorMessage = handleApiError(err);
      throw errorMessage;
    }
  };


  return {
    sales,
    loading,
    error,
    fetchSales,
    createSale,
    updateSale,
    deleteSale,
  };
};
