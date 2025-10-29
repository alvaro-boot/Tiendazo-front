"use client"

import { useStore, type Debt } from "@/lib/store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DebtDetailDialogProps {
  debt: Debt | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DebtDetailDialog({ debt, open, onOpenChange }: DebtDetailDialogProps) {
  const { clients, sales } = useStore()

  if (!debt) return null

  const client = clients.find((c) => c.id === debt.clientId)
  const sale = sales.find((s) => s.id === debt.saleId)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "warning" | "destructive"; label: string }> = {
      pending: { variant: "destructive", label: "Pendiente" },
      partial: { variant: "warning", label: "Parcial" },
      paid: { variant: "default", label: "Pagado" },
    }
    return variants[status] || variants.pending
  }

  const statusInfo = getStatusBadge(debt.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle de Fiado</DialogTitle>
          <DialogDescription>Cliente: {client?.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Creación</p>
              <p className="font-medium">{new Date(debt.createdAt).toLocaleDateString("es-ES")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monto Total</span>
              <span className="font-medium">${debt.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pagado</span>
              <span className="font-medium text-green-600">${debt.paid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-lg font-semibold">Restante</span>
              <span className="text-xl font-bold">${debt.remaining.toFixed(2)}</span>
            </div>
          </div>

          {sale && (
            <div>
              <p className="mb-2 font-medium">Productos de la Venta</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {debt.payments.length > 0 && (
            <div>
              <p className="mb-2 font-medium">Historial de Pagos</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debt.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.createdAt).toLocaleDateString("es-ES")}</TableCell>
                      <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                      <TableCell className="text-right font-medium">${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
