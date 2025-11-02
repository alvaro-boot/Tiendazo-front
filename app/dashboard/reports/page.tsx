"use client"

import { useState, useEffect, useMemo } from "react"
import { useSales } from "@/hooks/use-api"
import { useAuthContext } from "@/lib/auth-context"
import { saleService } from "@/lib/services"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { TrendingUp, DollarSign, ShoppingCart, Calendar, Download, Filter } from "lucide-react"

export default function ReportsPage() {
  const { user } = useAuthContext()
  // Normalizar storeId para usar store.id si storeId no está disponible
  // Usar useMemo para evitar recalcular en cada render y causar bucles infinitos
  const storeId = useMemo(() => {
    return user?.storeId || user?.store?.id
  }, [user?.storeId, user?.store?.id])
  
  const { sales, fetchSales, loading } = useSales(storeId)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [filteredSales, setFilteredSales] = useState<any[]>([])
  const [reportData, setReportData] = useState<any>(null)

  // Establecer fechas por defecto (último mes)
  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 1)
    
    setStartDate(start.toISOString().split("T")[0])
    setEndDate(end.toISOString().split("T")[0])
  }, [])

  // Cargar ventas al montar y cuando cambien las fechas
  useEffect(() => {
    if (storeId && startDate && endDate) {
      console.log("🔄 Cargando reporte con filtros:", { storeId, startDate, endDate })
      loadSales()
    } else {
      console.log("⏳ Esperando datos:", { 
        hasUser: !!user, 
        hasStoreId: !!storeId,
        storeId: storeId,
        userStoreId: user?.storeId,
        userStoreIdFromStore: user?.store?.id,
        hasDates: !!(startDate && endDate) 
      })
    }
  }, [storeId, startDate, endDate])

  const loadSales = async () => {
    try {
      const currentStoreId = storeId || user?.storeId || user?.store?.id
      const filters: any = { storeId: currentStoreId }
      if (startDate) filters.startDate = startDate
      if (endDate) filters.endDate = endDate

      console.log("📤 Filtrando ventas con:", { filters, currentStoreId, userStoreId: user?.storeId, userStore: user?.store })

      const salesData = await saleService.getSales(filters)
      setFilteredSales(salesData)
      
      // Calcular datos del reporte
      const totalRevenue = salesData.reduce((sum: number, sale: any) => sum + Number(sale.total || 0), 0)
      const totalProfit = salesData.reduce((sum: number, sale: any) => sum + Number(sale.profit || 0), 0)
      const totalCount = salesData.length
      const creditSales = salesData.filter((s: any) => s.isCredit).length
      const cashSales = totalCount - creditSales
      const averageTicket = totalCount > 0 ? totalRevenue / totalCount : 0

      setReportData({
        totalRevenue,
        totalProfit,
        totalCount,
        creditSales,
        cashSales,
        averageTicket,
        sales: salesData,
      })

      console.log("📊 Reporte generado:", {
        totalRevenue,
        totalProfit,
        totalCount,
        creditSales,
        cashSales,
        averageTicket,
      })
    } catch (error) {
      console.error("❌ Error cargando reporte:", error)
      setFilteredSales([])
      setReportData(null)
    }
  }

  // Datos para gráfico de ventas por día
  const salesByDay = useMemo(() => {
    if (!reportData?.sales) return []
    
    const dayMap = new Map<string, { date: string; revenue: number; profit: number; count: number }>()
    
    reportData.sales.forEach((sale: any) => {
      const date = new Date(sale.createdAt).toLocaleDateString("es-ES", { 
        year: "numeric", 
        month: "short", 
        day: "numeric" 
      })
      
      const existing = dayMap.get(date) || { date, revenue: 0, profit: 0, count: 0 }
      existing.revenue += Number(sale.total || 0)
      existing.profit += Number(sale.profit || 0)
      existing.count += 1
      
      dayMap.set(date, existing)
    })
    
    return Array.from(dayMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [reportData])

  // Top productos vendidos
  const topProducts = useMemo(() => {
    if (!reportData?.sales) return []
    
    const productMap = new Map<string, { name: string; quantity: number; revenue: number; profit: number }>()
    
    reportData.sales.forEach((sale: any) => {
      if (sale.details) {
        sale.details.forEach((detail: any) => {
          const productName = detail.product?.name || `Producto ${detail.productId}`
          const existing = productMap.get(productName) || { name: productName, quantity: 0, revenue: 0, profit: 0 }
          
          existing.quantity += detail.quantity || 0
          existing.revenue += Number(detail.subtotal || 0)
          // Calcular ganancia: (precio venta - precio compra) * cantidad
          const unitProfit = (detail.unitPrice || 0) - (detail.product?.purchasePrice || 0)
          existing.profit += unitProfit * (detail.quantity || 0)
          
          productMap.set(productName, existing)
        })
      }
    })
    
    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }, [reportData])

  // Métodos de pago
  const paymentMethods = useMemo(() => {
    if (!reportData?.sales) return []
    
    const methods = new Map<string, number>()
    reportData.sales.forEach((sale: any) => {
      const method = sale.isCredit ? "Crédito" : "Contado"
      methods.set(method, (methods.get(method) || 0) + 1)
    })
    
    return Array.from(methods.entries()).map(([name, value]) => ({ name, value }))
  }, [reportData])

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--muted))",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7c7c",
  ]

  const handleExport = () => {
    // TODO: Implementar exportación a Excel
    alert("Funcionalidad de exportación próximamente")
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Reportes
          </h1>
          <p className="text-muted-foreground mt-2">Análisis detallado de ventas, ingresos y ganancias</p>
        </div>
        <Button 
          onClick={handleExport}
          variant="outline"
          className="transition-all hover:scale-105"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Filtros de fecha */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros de Fecha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label>Acciones Rápidas</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setDate(start.getDate() - 7)
                    setStartDate(start.toISOString().split("T")[0])
                    setEndDate(end.toISOString().split("T")[0])
                  }}
                  className="flex-1"
                >
                  7 días
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setMonth(start.getMonth() - 1)
                    setStartDate(start.toISOString().split("T")[0])
                    setEndDate(end.toISOString().split("T")[0])
                  }}
                  className="flex-1"
                >
                  1 mes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setMonth(start.getMonth() - 3)
                    setStartDate(start.toISOString().split("T")[0])
                    setEndDate(end.toISOString().split("T")[0])
                  }}
                  className="flex-1"
                >
                  3 meses
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : !reportData ? (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No hay datos para mostrar en el período seleccionado</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Resumen</TabsTrigger>
            <TabsTrigger value="sales">Ventas</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            {/* Cards de estadísticas principales */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                  <div className="rounded-full bg-blue-500/10 p-2">
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{reportData.totalCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">En el período seleccionado</p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <div className="rounded-full bg-green-500/10 p-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">${reportData.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Ingresos acumulados</p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ganancia Total</CardTitle>
                  <div className="rounded-full bg-purple-500/10 p-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">${reportData.totalProfit.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Ganancia neta</p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                  <div className="rounded-full bg-amber-500/10 p-2">
                    <DollarSign className="h-5 w-5 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">${reportData.averageTicket.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Por transacción</p>
                </CardContent>
              </Card>
            </div>

            {/* Resumen adicional */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Métodos de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Contado</span>
                      <span className="text-lg font-bold text-green-600">
                        {reportData.cashSales} ({reportData.totalCount > 0 ? ((reportData.cashSales / reportData.totalCount) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Crédito</span>
                      <span className="text-lg font-bold text-amber-600">
                        {reportData.creditSales} ({reportData.totalCount > 0 ? ((reportData.creditSales / reportData.totalCount) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Período del Reporte</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Desde: <span className="font-semibold">{startDate ? new Date(startDate).toLocaleDateString("es-ES") : "N/A"}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Hasta: <span className="font-semibold">{endDate ? new Date(endDate).toLocaleDateString("es-ES") : "N/A"}</span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>Listado de Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Factura</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Ganancia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No hay ventas en el período seleccionado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSales.map((sale: any) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-mono text-sm">
                            {sale.invoiceNumber || `V-${sale.id}`}
                          </TableCell>
                          <TableCell>{sale.client?.fullName || "Cliente general"}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(sale.createdAt).toLocaleDateString("es-ES")}
                          </TableCell>
                          <TableCell>
                            {sale.isCredit ? (
                              <span className="text-amber-600 font-medium">Crédito</span>
                            ) : (
                              <span className="text-green-600 font-medium">Contado</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ${Number(sale.total || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            ${Number(sale.profit || 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>Top 10 Productos Más Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Ingresos</TableHead>
                      <TableHead className="text-right">Ganancia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No hay productos vendidos en el período
                        </TableCell>
                      </TableRow>
                    ) : (
                      topProducts.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="text-right">{product.quantity}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ${product.revenue.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            ${product.profit.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle>Ventas por Día</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesByDay}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} name="Ingresos" />
                      <Line type="monotone" dataKey="profit" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Ganancia" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle>Métodos de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg md:col-span-2">
                <CardHeader>
                  <CardTitle>Ingresos por Día</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesByDay}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Ingresos" />
                      <Bar dataKey="profit" fill="hsl(var(--chart-2))" name="Ganancia" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {topProducts.length > 0 && (
                <Card className="border-2 shadow-lg md:col-span-2">
                  <CardHeader>
                    <CardTitle>Top 10 Productos por Ingresos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topProducts.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="name" 
                          className="text-xs" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                        />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "6px",
                          }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Ingresos" />
                        <Bar dataKey="profit" fill="hsl(var(--chart-2))" name="Ganancia" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
