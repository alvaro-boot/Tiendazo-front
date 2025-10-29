"use client"

import { useState, useMemo } from "react"
import { useStore, type Debt } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, DollarSign, Eye } from "lucide-react"
import { PaymentDialog } from "@/components/debts/payment-dialog"
import { DebtDetailDialog } from "@/components/debts/debt-detail-dialog"

export default function DebtsPage() {
  const { debts, clients } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const filteredDebts = useMemo(() => {
    return debts.filter((debt) => {
      const client = clients.find((c) => c.id === debt.clientId)
      const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || debt.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [debts, clients, searchTerm, statusFilter])

  const totalDebts = debts.filter((d) => d.status !== "paid").length
  const totalAmount = debts.reduce((sum, d) => sum + d.remaining, 0)
  const overdueDebts = debts.filter((d) => {
    if (!d.dueDate || d.status === "paid") return false
    return new Date(d.dueDate) < new Date()
  }).length

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "Cliente Desconocido"
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "warning" | "destructive"; label: string }> = {
      pending: { variant: "destructive", label: "Pendiente" },
      partial: { variant: "warning", label: "Parcial" },
      paid: { variant: "default", label: "Pagado" },
    }
    return variants[status] || variants.pending
  }

  const handleAddPayment = (debt: Debt) => {
    setSelectedDebt(debt)
    setIsPaymentDialogOpen(true)
  }

  const handleViewDetail = (debt: Debt) => {
    setSelectedDebt(debt)
    setIsDetailDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fiados</h1>
        <p className="text-muted-foreground">Gestiona las deudas de tus clientes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fiados Activos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDebts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueDebts}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Lista de Fiados</CardTitle>
            <div className="flex gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Monto Total</TableHead>
                <TableHead className="text-right">Pagado</TableHead>
                <TableHead className="text-right">Restante</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDebts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No se encontraron fiados
                  </TableCell>
                </TableRow>
              ) : (
                filteredDebts.map((debt) => {
                  const statusInfo = getStatusBadge(debt.status)
                  return (
                    <TableRow key={debt.id}>
                      <TableCell className="font-medium">{getClientName(debt.clientId)}</TableCell>
                      <TableCell>{new Date(debt.createdAt).toLocaleDateString("es-ES")}</TableCell>
                      <TableCell className="text-right">${debt.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${debt.paid.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">${debt.remaining.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetail(debt)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {debt.status !== "paid" && (
                            <Button variant="ghost" size="sm" onClick={() => handleAddPayment(debt)}>
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PaymentDialog debt={selectedDebt} open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen} />

      <DebtDetailDialog debt={selectedDebt} open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen} />
    </div>
  )
}
