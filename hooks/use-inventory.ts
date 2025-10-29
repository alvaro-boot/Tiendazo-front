import { useState, useEffect } from "react";
import { 
  inventoryService, 
  InventoryMovement, 
  StockAdjustment, 
  Product 
} from "@/lib/services";

export function useInventory() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = async (productId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getMovements(productId);
      setMovements(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar movimientos");
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockProducts = async (storeId?: number) => {
    try {
      const data = await inventoryService.getLowStockProducts(storeId);
      setLowStockProducts(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar productos con stock bajo");
    }
  };

  const createMovement = async (movementData: {
    productId: number;
    type: "IN" | "OUT" | "ADJUSTMENT" | "SALE" | "RETURN";
    quantity: number;
    unitPrice: number;
    reason: string;
    reference?: string;
  }): Promise<InventoryMovement> => {
    try {
      const newMovement = await inventoryService.createMovement(movementData);
      setMovements(prev => [newMovement, ...prev]);
      return newMovement;
    } catch (err: any) {
      setError(err.message || "Error al crear movimiento");
      throw err;
    }
  };

  const adjustStock = async (adjustmentData: StockAdjustment): Promise<Product> => {
    try {
      const updatedProduct = await inventoryService.adjustStock(adjustmentData);
      // Actualizar el producto en la lista si existe
      setLowStockProducts(prev => 
        prev.map(p => p.id === adjustmentData.productId ? updatedProduct : p)
      );
      return updatedProduct;
    } catch (err: any) {
      setError(err.message || "Error al ajustar stock");
      throw err;
    }
  };

  const getStockHistory = async (productId: number): Promise<InventoryMovement[]> => {
    try {
      return await inventoryService.getStockHistory(productId);
    } catch (err: any) {
      setError(err.message || "Error al obtener historial de stock");
      throw err;
    }
  };

  const getInventoryReport = async (storeId?: number): Promise<any> => {
    try {
      return await inventoryService.getInventoryReport(storeId);
    } catch (err: any) {
      setError(err.message || "Error al generar reporte de inventario");
      throw err;
    }
  };

  useEffect(() => {
    fetchMovements();
    fetchLowStockProducts();
  }, []);

  return {
    movements,
    lowStockProducts,
    loading,
    error,
    createMovement,
    adjustStock,
    getStockHistory,
    getInventoryReport,
    fetchMovements,
    fetchLowStockProducts,
  };
}
