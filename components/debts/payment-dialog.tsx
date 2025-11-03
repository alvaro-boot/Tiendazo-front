"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useDebts } from "@/hooks/use-debts"
import { Client } from "@/lib/services"
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

interface PaymentDialogProps {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function PaymentDialog({ client, open, onOpenChange, onSuccess }: PaymentDialogProps) {
  const { registerPayment, loading } = useDebts()
  const [amount, setAmount] = useState("")
  const [paymentType, setPaymentType] = useState<"CASH" | "TRANSFER" | "CARD" | "OTHER">("CASH")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Resetear formulario cuando se abre/cierra
  useEffect(() => {
    if (open && client) {
      setAmount("")
      setPaymentType("CASH")
      setReference("")
      setNotes("")
      setError(null)
    }
  }, [open, client])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!client) return

    const paymentAmount = Number.parseFloat(amount)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError("Ingresa un monto válido")
      return
    }

    const clientDebt = Number(client.debt || 0)
    if (paymentAmount > clientDebt) {
      setError(`El monto no puede ser mayor a la deuda restante ($${clientDebt.toFixed(2)})`)
      return
    }

    try {
      await registerPayment({
        clientId: client.id,
        amount: paymentAmount,
        paymentType,
        reference: reference || undefined,
        notes: notes || undefined,
      })

      setAmount("")
      setReference("")
      setNotes("")
      setPaymentType("CASH")
      onOpenChange(false)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || "Error al registrar el pago")
      console.error("❌ Error en PaymentDialog:", err)
    }
  }

  if (!client) return null

  const clientDebt = Number(client.debt || 0)
  const paymentAmount = Number.parseFloat(amount) || 0
  const newDebt = clientDebt - paymentAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-xl">Registrar Pago</DialogTitle>
          <DialogDescription>
            Cliente: <span className="font-semibold">{client.fullName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Deuda Actual</span>
              <span className="text-2xl font-bold text-red-600">${clientDebt.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 border-2 border-destructive/20 p-3">
              <p className="text-sm font-medium text-destructive">⚠️ {error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount" className="font-semibold">Monto a Pagar *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={clientDebt}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 border-2 focus:border-primary transition-colors"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Método de Pago</Label>
            <Select 
              value={paymentType} 
              onValueChange={(value: any) => setPaymentType(value)}
              disabled={loading}
            >
              <SelectTrigger className="h-11 border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Efectivo</SelectItem>
                <SelectItem value="CARD">Tarjeta</SelectItem>
                <SelectItem value="TRANSFER">Transferencia</SelectItem>
                <SelectItem value="OTHER">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Referencia (Opcional)</Label>
            <Input
              id="reference"
              type="text"
              placeholder="Número de transferencia, comprobante, etc."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="h-11 border-2 focus:border-primary transition-colors"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-2 focus:border-primary transition-colors"
              rows={3}
              disabled={loading}
            />
          </div>

          {amount && paymentAmount > 0 && (
            <div className="rounded-xl border-2 border-green-200 bg-green-50 dark:bg-green-950/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-900 dark:text-green-100">Nuevo Saldo</span>
                <span className="text-xl font-bold text-green-600">
                  ${newDebt.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !amount || paymentAmount <= 0}>
              {loading ? "Registrando..." : "Registrar Pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

