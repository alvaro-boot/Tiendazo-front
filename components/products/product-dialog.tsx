"use client"

import { useEffect } from "react"
import { useProducts } from "@/hooks/use-api"
import { useCategories } from "@/hooks/use-categories"
import { useAuthContext } from "@/lib/auth-context"
import { Product, ProductData } from "@/lib/services"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"

interface ProductDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ProductFormData {
  name: string
  description: string
  barcode: string
  categoryId: number
  purchasePrice: number
  sellPrice: number
  stock: number
  minStock: number
  isPublic: boolean
}

export function ProductDialog({ product, open, onOpenChange }: ProductDialogProps) {
  const { user } = useAuthContext();
  const { categories, loading: categoriesLoading, refetch: fetchCategories } = useCategories(user?.storeId);
  const { createProduct, updateProduct, fetchProducts } = useProducts(user?.storeId);
  const { register, handleSubmit, reset, setValue, watch } = useForm<ProductFormData>()

  // Cargar categorías cuando se abre el diálogo
  useEffect(() => {
    if (open && user?.storeId) {
      fetchCategories();
    }
  }, [open, user?.storeId, fetchCategories])

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || "",
        barcode: product.barcode || "",
        categoryId: product.categoryId,
        purchasePrice: product.purchasePrice,
        sellPrice: product.sellPrice,
        stock: product.stock,
        minStock: product.minStock,
        isPublic: product.isPublic || false,
      })
    } else {
      reset({
        name: "",
        description: "",
        barcode: "",
        categoryId: categories[0]?.id || 0,
        purchasePrice: 0,
        sellPrice: 0,
        stock: 0,
        minStock: 5,
        isPublic: false,
      })
    }
  }, [product, reset, categories])

  const onSubmit = async (data: ProductFormData) => {
    if (!user?.storeId) {
      alert("Error: No se pudo identificar la tienda");
      return;
    }

    try {
      const productData: ProductData = {
        name: data.name,
        description: data.description,
        barcode: data.barcode,
        categoryId: data.categoryId,
        purchasePrice: data.purchasePrice,
        sellPrice: data.sellPrice,
        stock: data.stock,
        minStock: data.minStock,
        isPublic: data.isPublic,
        storeId: user.storeId,
      };

    if (product) {
        console.log("📝 Actualizando producto:", product.id);
        await updateProduct(product.id, productData);
        console.log("✅ Producto actualizado exitosamente");
    } else {
        console.log("➕ Creando nuevo producto");
        await createProduct(productData);
        console.log("✅ Producto creado exitosamente");
      }

      // La recarga ya se hace automáticamente en createProduct/updateProduct
      // No es necesario llamar fetchProducts() de nuevo aquí
      console.log("🔄 Lista de productos actualizada automáticamente");
      
      // Cerrar el diálogo (esto disparará el callback en el componente padre)
      onOpenChange(false);
    } catch (error: any) {
      console.error("❌ Error al guardar producto:", error);
      alert(`Error al guardar producto: ${error.message || "Error desconocido"}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {product ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {product ? "Actualiza la información del producto" : "Agrega un nuevo producto al inventario"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">Nombre *</Label>
              <Input 
                id="name" 
                {...register("name", { required: true })} 
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId" className="font-semibold">Categoría *</Label>
              <Select value={String(watch("categoryId") || "")} onValueChange={(value) => setValue("categoryId", Number(value))}>
                <SelectTrigger className="h-11 border-2 focus:border-primary">
                  <SelectValue placeholder={categoriesLoading ? "Cargando categorías..." : categories.length === 0 ? "No hay categorías. Crea una primero." : "Selecciona una categoría"} />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>Cargando categorías...</SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="no-categories" disabled>No hay categorías disponibles</SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {categories.length === 0 && !categoriesLoading && (
                <p className="text-xs text-muted-foreground">
                  Ve a la página de productos y haz clic en "Categorías" para crear una categoría primero.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold">Descripción</Label>
            <Textarea 
              id="description" 
              {...register("description")} 
              className="border-2 focus:border-primary transition-colors min-h-[100px]"
            />
          </div>

            <div className="space-y-2">
            <Label htmlFor="barcode" className="font-semibold">Código de Barras</Label>
            <Input 
              id="barcode" 
              {...register("barcode")} 
              className="h-11 border-2 focus:border-primary transition-colors"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice" className="font-semibold">Precio de Compra *</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                {...register("purchasePrice", { required: true, valueAsNumber: true })}
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellPrice" className="font-semibold">Precio de Venta *</Label>
              <Input
                id="sellPrice"
                type="number"
                step="0.01"
                {...register("sellPrice", { required: true, valueAsNumber: true })}
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stock" className="font-semibold">Stock Inicial</Label>
              <Input 
                id="stock" 
                type="number" 
                {...register("stock", { valueAsNumber: true })} 
                disabled={!!product}
                className="h-11 border-2 focus:border-primary transition-colors disabled:opacity-50"
              />
              {product && (
                <p className="text-xs text-muted-foreground">Usa el botón de ajuste de stock para modificar</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock" className="font-semibold">Stock Mínimo *</Label>
              <Input 
                id="minStock" 
                type="number" 
                {...register("minStock", { required: true, valueAsNumber: true })} 
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start space-x-3 p-4 rounded-lg border-2 bg-muted/30 hover:bg-muted/50 transition-colors">
              <Checkbox
                id="isPublic"
                checked={watch("isPublic")}
                onCheckedChange={(checked) => setValue("isPublic", checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <Label htmlFor="isPublic" className="font-semibold cursor-pointer text-base">
                  Producto Público (Visible en Marketplace)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Si está marcado, este producto será visible en el marketplace público de tu tienda y podrá ser comprado por clientes
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="transition-all hover:scale-105"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              {product ? "Actualizar" : "Crear"} Producto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
