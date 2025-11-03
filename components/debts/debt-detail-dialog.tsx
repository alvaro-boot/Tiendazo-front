"use client"

import { useState, useEffect } from "react"
import { useDebts } from "@/hooks/use-debts"
import { Client, DebtPayment } from "@/lib/services"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Calendar, User, Phone, Mail } from "lucide-react"

interface DebtDetailDialogProps {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DebtDetailDialog({ client, open, onOpenChange }: DebtDetailDialogProps) {
  const { getClientPaymentHistory, loading } = useDebts()
  const [paymentHistory, setPaymentHistory] = useState<DebtPayment[]>([])

  useEffect(() => {
    if (open && client) {
      loadPaymentHistory()
    } else {
      setPaymentHistory([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client?.id])

  const loadPaymentHistory = async () => {
    if (!client) return
    
    try {
      console.log("📜 Cargando historial de pagos para cliente:", client.id)
      const history = await getClientPaymentHistory(client.id)
      console.log("✅ Historial de pagos obtenido:", history.length, "pagos")
      setPaymentHistory(Array.isArray(history) ? history : [])
    } catch (error: any) {
      console.error("❌ Error cargando historial de pagos:", error)
      setPaymentHistory([])
    }
  }

  if (!client) return null

  const clientDebt = Number(client.debt || 0)
  const totalPaid = paymentHistory.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CASH: "Efectivo",
      CARD: "Tarjeta",
      TRANSFER: "Transferencia",
      OTHER: "Otro",
    }
    return labels[type] || type
  }

  const getPaymentTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      CASH: "default",
      CARD: "secondary",
      TRANSFER: "outline",
      OTHER: "outline",
    }
    return variants[type] || "outline"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalle de Deuda</DialogTitle>
          <DialogDescription>
            Información completa del cliente y su historial de pagos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del cliente */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Cliente</span>
                  </div>
                  <p className="font-semibold text-lg">{client.fullName}</p>
                </div>
                {client.phone && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>Teléfono</span>
                    </div>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                )}
                {client.email && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <p className="font-medium">{client.email}</p>
                  </div>
                )}
                {client.address && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Dirección</span>
                    </div>
                    <p className="font-medium">{client.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumen de deuda */}
          <Card className="border-2 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Deuda Actual</p>
                  <p className="text-3xl font-bold text-red-600">${clientDebt.toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Total Pagado</p>
                  <p className="text-3xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Pagos Registrados</p>
                  <p className="text-3xl font-bold">{paymentHistory.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial de pagos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Historial de Pagos</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="text-center py-8 rounded-xl border-2 border-dashed bg-muted/50">
                <p className="text-muted-foreground">No hay pagos registrados</p>
                <p className="text-xs text-muted-foreground mt-1">Los pagos aparecerán aquí cuando se registren</p>
              </div>
            ) : (
              <div className="rounded-xl border-2 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2">
                      <TableHead className="font-semibold">Fecha</TableHead>
                      <TableHead className="font-semibold">Método</TableHead>
                      <TableHead className="text-right font-semibold">Monto</TableHead>
                      <TableHead className="text-right font-semibold">Deuda Anterior</TableHead>
                      <TableHead className="text-right font-semibold">Deuda Nueva</TableHead>
                      <TableHead className="font-semibold">Referencia</TableHead>
                      <TableHead className="font-semibold">Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleString("es-ES")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPaymentTypeBadge(payment.paymentType)}>
                            {getPaymentTypeLabel(payment.paymentType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          ${Number(payment.amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          ${Number(payment.previousDebt || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          ${Number(payment.newDebt || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.reference || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
