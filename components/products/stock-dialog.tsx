"use client"

import type React from "react"

import { useState } from "react"
import { productService } from "@/lib/services"
import { Product } from "@/lib/services"
import { useProducts } from "@/hooks/use-api"
import { useAuthContext } from "@/lib/auth-context"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Minus } from "lucide-react"

interface StockDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockDialog({ product, open, onOpenChange }: StockDialogProps) {
  const { user } = useAuthContext()
  const { fetchProducts } = useProducts(user?.storeId)
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract" | "set">("add")
  const [quantity, setQuantity] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product || quantity <= 0) return

    try {
      setLoading(true)
      const operation = adjustmentType === "set" ? "set" : adjustmentType === "add" ? "add" : "subtract"
      
      await productService.updateStock(product.id, quantity, operation)
      await fetchProducts()

      setQuantity(0)
      onOpenChange(false)
    } catch (error: any) {
      console.error("❌ Error al actualizar stock:", error);
      alert(`Error al actualizar stock: ${error.message || "Error desconocido"}`);
    } finally {
      setLoading(false)
    }
  }

  if (!product) return null

  const newStock = adjustmentType === "set" 
    ? quantity 
    : adjustmentType === "add" 
    ? product.stock + quantity 
    : product.stock - quantity

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg w-full">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Ajustar Stock
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Modifica el inventario de <span className="font-semibold">{product.name}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Stock Actual</span>
              <span className="text-4xl font-bold text-primary">{product.stock}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-semibold">Tipo de Ajuste</Label>
            <RadioGroup value={adjustmentType} onValueChange={(value: any) => setAdjustmentType(value)} className="space-y-3">
              <div className="flex items-center space-x-3 rounded-lg border-2 p-3 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer">
                <RadioGroupItem value="add" id="add" />
                <Label htmlFor="add" className="flex items-center gap-2 font-normal cursor-pointer flex-1">
                  <Plus className="h-5 w-5 text-green-500" />
                  Agregar Stock
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border-2 p-3 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer">
                <RadioGroupItem value="subtract" id="subtract" />
                <Label htmlFor="subtract" className="flex items-center gap-2 font-normal cursor-pointer flex-1">
                  <Minus className="h-5 w-5 text-red-500" />
                  Restar Stock
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border-2 p-3 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer">
                <RadioGroupItem value="set" id="set" />
                <Label htmlFor="set" className="flex items-center gap-2 font-normal cursor-pointer flex-1">
                  Establecer Cantidad
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="font-semibold">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity || ""}
              onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
              required
              className="h-11 border-2 focus:border-primary transition-colors text-lg font-semibold"
            />
          </div>

          {quantity > 0 && (
            <div className="rounded-xl border-2 p-6 bg-gradient-to-br from-muted to-transparent">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Nuevo Stock</span>
                <span className={`text-4xl font-bold ${newStock < 0 ? "text-destructive" : "text-primary"}`}>
                  {adjustmentType === "set" ? quantity : newStock}
                </span>
              </div>
              {newStock < 0 && adjustmentType !== "set" && (
                <p className="mt-3 text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg">
                  ⚠️ No hay suficiente stock disponible
                </p>
              )}
            </div>
          )}

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
              disabled={quantity <= 0 || (newStock < 0 && adjustmentType !== "set") || loading}
              className="bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Aplicando..." : "Aplicar Ajuste"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
