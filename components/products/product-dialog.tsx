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
}

export function ProductDialog({ product, open, onOpenChange }: ProductDialogProps) {
  const { user } = useAuthContext();
  const { categories } = useCategories(user?.storeId);
  const { createProduct, updateProduct, fetchProducts } = useProducts(user?.storeId);
  const { register, handleSubmit, reset, setValue, watch } = useForm<ProductFormData>()

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

      await fetchProducts();
      onOpenChange(false);
    } catch (error: any) {
      console.error("❌ Error al guardar producto:", error);
      alert(`Error al guardar producto: ${error.message || "Error desconocido"}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {product ? "Actualiza la información del producto" : "Agrega un nuevo producto al inventario"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" {...register("name", { required: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoría *</Label>
              <Select value={String(watch("categoryId") || "")} onValueChange={(value) => setValue("categoryId", Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Código de Barras</Label>
            <Input id="barcode" {...register("barcode")} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Precio de Compra *</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                {...register("purchasePrice", { required: true, valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellPrice">Precio de Venta *</Label>
              <Input
                id="sellPrice"
                type="number"
                step="0.01"
                {...register("sellPrice", { required: true, valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Inicial</Label>
              <Input id="stock" type="number" {...register("stock", { valueAsNumber: true })} disabled={!!product} />
              {product && (
                <p className="text-xs text-muted-foreground">Usa el botón de ajuste de stock para modificar</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Stock Mínimo *</Label>
              <Input id="minStock" type="number" {...register("minStock", { required: true, valueAsNumber: true })} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{product ? "Actualizar" : "Crear"} Producto</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
