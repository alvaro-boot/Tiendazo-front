"use client"

import type React from "react"

import { useState } from "react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Minus } from "lucide-react"

interface StockDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockDialog({ product, open, onOpenChange }: StockDialogProps) {
  const { updateStock } = useStore()
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add")
  const [quantity, setQuantity] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!product || quantity <= 0) return

    const adjustment = adjustmentType === "add" ? quantity : -quantity
    updateStock(product.id, adjustment)

    setQuantity(0)
    onOpenChange(false)
  }

  if (!product) return null

  const newStock = adjustmentType === "add" ? product.stock + quantity : product.stock - quantity

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar Stock</DialogTitle>
          <DialogDescription>Modifica el inventario de {product.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stock Actual</span>
              <span className="text-2xl font-bold">{product.stock}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Ajuste</Label>
            <RadioGroup value={adjustmentType} onValueChange={(value: any) => setAdjustmentType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="add" id="add" />
                <Label htmlFor="add" className="flex items-center gap-2 font-normal">
                  <Plus className="h-4 w-4 text-green-500" />
                  Agregar Stock
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="subtract" id="subtract" />
                <Label htmlFor="subtract" className="flex items-center gap-2 font-normal">
                  <Minus className="h-4 w-4 text-red-500" />
                  Restar Stock
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity || ""}
              onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
              required
            />
          </div>

          {quantity > 0 && (
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nuevo Stock</span>
                <span className={`text-2xl font-bold ${newStock < 0 ? "text-destructive" : ""}`}>{newStock}</span>
              </div>
              {newStock < 0 && <p className="mt-2 text-sm text-destructive">No hay suficiente stock disponible</p>}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={quantity <= 0 || newStock < 0}>
              Aplicar Ajuste
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
