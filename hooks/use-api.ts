"use client";

import { useState, useEffect } from "react";
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

      // Filtrar productos por tienda si se proporciona storeId
      const filteredProducts = storeId
        ? data.filter((product) => product.storeId === storeId)
        : data;

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
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
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
      setProducts((prev) =>
        prev.map((product) => (product.id === id ? updatedProduct : product))
      );
      return updatedProduct;
    } catch (err) {
      const errorMessage = handleApiError(err);
      throw errorMessage;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
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
export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getClients();
      setClients(data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage.message);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchClients();
  }, []);

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
export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await saleService.getSales();
      setSales(data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage.message);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchSales();
  }, []);

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
