"use client"

import type React from "react"

import { useState } from "react"
import { useStore, type Debt, type DebtPayment } from "@/lib/store"
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
  debt: Debt | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentDialog({ debt, open, onOpenChange }: PaymentDialogProps) {
  const { clients, addPayment } = useStore()
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash")
  const [notes, setNotes] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!debt) return

    const paymentAmount = Number.parseFloat(amount)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("Ingresa un monto válido")
      return
    }

    if (paymentAmount > debt.remaining) {
      alert("El monto no puede ser mayor a la deuda restante")
      return
    }

    const newPayment: DebtPayment = {
      id: `payment-${Date.now()}`,
      debtId: debt.id,
      amount: paymentAmount,
      paymentMethod,
      createdAt: new Date().toISOString(),
      notes: notes || undefined,
    }

    addPayment(debt.id, newPayment)

    setAmount("")
    setNotes("")
    setPaymentMethod("cash")
    onOpenChange(false)
  }

  if (!debt) return null

  const client = clients.find((c) => c.id === debt.clientId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>Cliente: {client?.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Deuda Restante</span>
              <span className="text-2xl font-bold">${debt.remaining.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto a Pagar *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={debt.remaining}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Método de Pago</Label>
            <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {amount && Number.parseFloat(amount) > 0 && (
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nuevo Saldo</span>
                <span className="text-xl font-bold">${(debt.remaining - Number.parseFloat(amount)).toFixed(2)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Registrar Pago</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
