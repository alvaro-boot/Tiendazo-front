"use client"

import { useState, useMemo, useEffect } from "react"
import { useDebts } from "@/hooks/use-debts"
import { useAuthContext } from "@/lib/auth-context"
import { useClients } from "@/hooks/use-api"
import { Client, DebtPayment } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, DollarSign, Eye, TrendingDown, AlertCircle, Calendar, FileText, Download } from "lucide-react"
import { PaymentDialog } from "@/components/debts/payment-dialog"
import { DebtDetailDialog } from "@/components/debts/debt-detail-dialog"

export default function DebtsPage() {
  const { user } = useAuthContext()
  const storeId = user?.storeId || user?.store?.id
  const { clientsDebtInfo, totalDebt, loading, error, fetchClientsWithDebt, getDebtsReport } = useDebts()
  const { clients } = useClients(storeId)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [showDebtsReport, setShowDebtsReport] = useState(false)

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalClients = clientsDebtInfo.length
    const totalAmount = clientsDebtInfo.reduce((sum, info) => sum + info.totalDebt, 0)
    const clientsWithPayments = clientsDebtInfo.filter((info) => info.paymentCount > 0).length
    
    return {
      totalClients,
      totalAmount,
      clientsWithPayments,
    }
  }, [clientsDebtInfo])

  // Filtrar clientes con deuda
  const filteredClients = useMemo(() => {
    return clientsDebtInfo.filter((info) => {
      const client = info.client
      const matchesSearch = 
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // El status filter no aplica aquí ya que todos tienen deuda > 0
      return matchesSearch
    }).sort((a, b) => b.totalDebt - a.totalDebt) // Ordenar por deuda descendente
  }, [clientsDebtInfo, searchTerm])

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CASH: "Efectivo",
      CARD: "Tarjeta",
      TRANSFER: "Transferencia",
      OTHER: "Otro",
    }
    return labels[type] || type
  }

  const handleAddPayment = (client: Client) => {
    setSelectedClient(client)
    setIsPaymentDialogOpen(true)
  }

  const handleViewDetail = (client: Client) => {
    setSelectedClient(client)
    setIsDetailDialogOpen(true)
  }

  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false)
    setSelectedClient(null)
    fetchClientsWithDebt()
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Fiados
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Gestiona las deudas de tus clientes</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowDebtsReport(!showDebtsReport)}
          className="transition-all hover:scale-105 w-full sm:w-auto"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {showDebtsReport ? "Ocultar Reporte" : "Ver Reporte"}
        </Button>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes con Deuda</CardTitle>
            <div className="rounded-full bg-red-500/10 p-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalClients}</p>
            <p className="text-xs text-muted-foreground mt-1">Clientes con deuda pendiente</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deuda Total</CardTitle>
            <div className="rounded-full bg-amber-500/10 p-2">
              <DollarSign className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">${totalDebt.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Monto total pendiente</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Pagos Registrados</CardTitle>
            <div className="rounded-full bg-blue-500/10 p-2">
              <TrendingDown className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.clientsWithPayments}</p>
            <p className="text-xs text-muted-foreground mt-1">Clientes con historial de pagos</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de clientes con deuda */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Clientes con Deuda</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Gestiona los pagos de deuda</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-2 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-destructive/10 border-2 border-destructive/20 p-4 text-center">
              <p className="text-sm font-medium text-destructive">⚠️ {error}</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium">No se encontraron clientes con deuda</p>
              <p className="text-xs mt-1">No hay deudas pendientes en este momento</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="font-semibold min-w-[150px]">Cliente</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell min-w-[120px]">Contacto</TableHead>
                    <TableHead className="text-right font-semibold min-w-[100px]">Deuda Total</TableHead>
                    <TableHead className="text-right font-semibold hidden lg:table-cell min-w-[120px]">Último Pago</TableHead>
                    <TableHead className="text-center font-semibold hidden sm:table-cell min-w-[80px]">Pagos</TableHead>
                    <TableHead className="text-right font-semibold min-w-[120px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {filteredClients.map((info) => {
                  const client = info.client
                  return (
                    <TableRow key={client.id} className="hover:bg-muted/50 transition-colors border-b">
                      <TableCell className="font-semibold text-base">
                        <div>
                          <p>{client.fullName}</p>
                          {client.phone && (
                            <p className="text-xs text-muted-foreground md:hidden mt-1">{client.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        <div className="space-y-1">
                          {client.phone && (
                            <p className="text-sm">{client.phone}</p>
                          )}
                          {client.email && (
                            <p className="text-xs text-muted-foreground">{client.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-lg sm:text-xl font-bold text-red-600">
                          ${info.totalDebt.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground hidden lg:table-cell">
                        {info.lastPayment ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              ${Number(info.lastPayment.amount).toFixed(2)}
                            </p>
                            <p className="text-xs">
                              {new Date(info.lastPayment.createdAt).toLocaleDateString("es-ES")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getPaymentTypeLabel(info.lastPayment.paymentType)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin pagos</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <Badge variant="outline" className="font-semibold">
                          {info.paymentCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(client)}
                            className="hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {info.totalDebt > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddPayment(client)}
                              className="hover:bg-green-500/10 hover:text-green-600 transition-all hover:scale-110"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentDialog
        client={selectedClient}
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onSuccess={handlePaymentSuccess}
      />

      <DebtDetailDialog
        client={selectedClient}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />

      {/* Reporte de deudas */}
      {showDebtsReport && (
        <DebtsReportSection 
          getDebtsReport={getDebtsReport}
          loading={loading}
        />
      )}
    </div>
  )
}

// Componente para mostrar reportes de deudas
function DebtsReportSection({ 
  getDebtsReport, 
  loading 
}: { 
  getDebtsReport: (filters?: { startDate?: string; endDate?: string; clientId?: number }) => Promise<any>
  loading: boolean 
}) {
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [reportData, setReportData] = useState<any>(null)
  const [reportLoading, setReportLoading] = useState(false)

  // Establecer fechas por defecto (último mes)
  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 1)
    
    setStartDate(start.toISOString().split("T")[0])
    setEndDate(end.toISOString().split("T")[0])
  }, [])

  // Cargar reporte cuando cambien las fechas
  useEffect(() => {
    if (startDate && endDate) {
      loadReport()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  const loadReport = async () => {
    try {
      setReportLoading(true)
      console.log("💰 Cargando reporte de deudas con filtros:", { startDate, endDate })
      const report = await getDebtsReport({ startDate, endDate })
      console.log("✅ Reporte de deudas obtenido:", report)
      setReportData(report)
    } catch (error: any) {
      console.error("❌ Error cargando reporte de deudas:", error)
      setReportData(null)
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Reporte de Fiados y Pagos
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Análisis de pagos de deuda por período</p>
          </div>
          <div className="flex gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 border-2 w-40"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 border-2 w-40"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {reportLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !reportData ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No hay datos para el período seleccionado</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Estadísticas */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    ${reportData.summary?.totalPayments?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">En el período</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
                  <FileText className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {reportData.summary?.totalCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Pagos registrados</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pago Promedio</CardTitle>
                  <TrendingDown className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    ${reportData.summary?.averagePayment?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Por transacción</p>
                </CardContent>
              </Card>
            </div>

            {/* Pagos por tipo */}
            {reportData.summary?.paymentsByType && Object.keys(reportData.summary.paymentsByType).length > 0 && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Pagos por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo de Pago</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(reportData.summary.paymentsByType).map(([type, data]: [string, any]) => (
                        <TableRow key={type}>
                          <TableCell className="font-medium">
                            {type === "CASH" ? "Efectivo" : 
                             type === "CARD" ? "Tarjeta" :
                             type === "TRANSFER" ? "Transferencia" : type}
                          </TableCell>
                          <TableCell className="text-right">{data.count}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ${data.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Historial de pagos */}
            {reportData.payments && reportData.payments.length > 0 && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Historial de Pagos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-right">Deuda Anterior</TableHead>
                        <TableHead className="text-right">Deuda Nueva</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.payments.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.client?.fullName || `Cliente ${payment.clientId}`}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString("es-ES")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {payment.paymentType === "CASH" ? "Efectivo" :
                               payment.paymentType === "CARD" ? "Tarjeta" :
                               payment.paymentType === "TRANSFER" ? "Transferencia" : payment.paymentType}
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
