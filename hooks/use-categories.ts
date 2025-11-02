import { useState, useEffect, useCallback } from "react";
import { categoryService, Category, CategoryData } from "@/lib/services";

export function useCategories(storeId?: number) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!storeId) {
      setLoading(false);
      setCategories([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Cargando categorías para tienda:", storeId);
      const data = await categoryService.getCategories(storeId);
      console.log("✅ Categorías cargadas:", data);
      setCategories(data || []);
    } catch (err: any) {
      console.error("❌ Error cargando categorías:", err);
      setError(err.message || "Error al cargar categorías");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const createCategory = async (categoryData: CategoryData): Promise<Category> => {
    try {
      const newCategory = await categoryService.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err: any) {
      setError(err.message || "Error al crear categoría");
      throw err;
    }
  };

  const updateCategory = async (id: number, categoryData: Partial<CategoryData>): Promise<Category> => {
    try {
      const updatedCategory = await categoryService.updateCategory(id, categoryData);
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
      return updatedCategory;
    } catch (err: any) {
      setError(err.message || "Error al actualizar categoría");
      throw err;
    }
  };

  const deleteCategory = async (id: number): Promise<void> => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err: any) {
      setError(err.message || "Error al eliminar categoría");
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchCategories,
    refetch: fetchCategories,
  };
}
