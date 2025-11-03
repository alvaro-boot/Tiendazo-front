"use client"

import { useState } from "react"
import { Client } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DollarSign, AlertCircle } from "lucide-react"
import { clientService } from "@/lib/services"

interface AddDebtDialogProps {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddDebtDialog({ client, open, onOpenChange, onSuccess }: AddDebtDialogProps) {
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!client) return

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Por favor ingresa un monto válido mayor a 0")
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await clientService.addDebtManually(client.id, amountNum, notes || undefined)
      
      // Limpiar formulario
      setAmount("")
      setNotes("")
      
      // Cerrar diálogo
      onOpenChange(false)
      
      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess()
      }
      
      alert(`Deuda de $${amountNum.toFixed(2)} agregada exitosamente a ${client.fullName}`)
    } catch (err: any) {
      console.error("Error agregando deuda:", err)
      setError(err.message || "Error al agregar deuda")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setAmount("")
    setNotes("")
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg w-full">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Agregar Deuda Manual
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Agrega deuda manualmente al cliente sin afectar el stock de productos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {client && (
            <div className="p-4 bg-muted/50 rounded-lg border-2">
              <p className="text-sm font-medium text-muted-foreground">Cliente:</p>
              <p className="text-lg font-semibold">{client.fullName}</p>
              {client.phone && (
                <p className="text-sm text-muted-foreground">{client.phone}</p>
              )}
              <p className="text-sm font-medium text-muted-foreground mt-2">
                Deuda actual: <span className="text-destructive font-bold">${Number(client.debt || 0).toFixed(2)}</span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount" className="font-semibold">
              Monto a Agregar *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-11 border-2 focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="font-semibold">
              Notas (Opcional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Deuda por producto prestado, ajuste manual, etc."
              className="min-h-[100px] border-2 focus:border-primary transition-colors"
              rows={4}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Nota:</strong> Esta acción solo agregará la deuda al cliente. No se afectará el stock de productos en el inventario.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="transition-all hover:scale-105"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            {loading ? "Agregando..." : "Agregar Deuda"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

