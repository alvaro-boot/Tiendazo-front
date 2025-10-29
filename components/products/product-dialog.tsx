"use client"

import { useEffect } from "react"
import { useStore, type Product } from "@/lib/store"
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
  sku: string
  barcode: string
  categoryId: string
  price: number
  cost: number
  stock: number
  minStock: number
}

export function ProductDialog({ product, open, onOpenChange }: ProductDialogProps) {
  const { categories, currentStore, addProduct, updateProduct } = useStore()
  const { register, handleSubmit, reset, setValue, watch } = useForm<ProductFormData>()

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        sku: product.sku,
        barcode: product.barcode,
        categoryId: product.categoryId,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        minStock: product.minStock,
      })
    } else {
      reset({
        name: "",
        description: "",
        sku: "",
        barcode: "",
        categoryId: categories[0]?.id || "",
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 5,
      })
    }
  }, [product, reset, categories])

  const onSubmit = (data: ProductFormData) => {
    if (product) {
      updateProduct(product.id, {
        ...data,
        updatedAt: new Date().toISOString(),
      })
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        ...data,
        storeId: currentStore?.id || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addProduct(newProduct)
    }
    onOpenChange(false)
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
              <Select value={watch("categoryId")} onValueChange={(value) => setValue("categoryId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" {...register("sku", { required: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input id="barcode" {...register("barcode")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Precio de Venta *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", { required: true, valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Costo *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                {...register("cost", { required: true, valueAsNumber: true })}
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
