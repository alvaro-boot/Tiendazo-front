"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useSales } from "@/hooks/use-api"
import { useAuthContext } from "@/lib/auth-context"
import { Sale, saleService } from "@/lib/services"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Eye, ShoppingCart, TrendingUp, DollarSign, Trash2, Calendar, Filter } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"

export function SalesHistory() {
  const { user, isAdmin } = useAuthContext()
  // Normalizar storeId para usar store.id si storeId no está disponible
  // Usar useMemo para evitar recalcular en cada render
  const storeId = useMemo(() => {
    return user?.storeId || user?.store?.id
  }, [user?.storeId, user?.store?.id])
  
  const { fetchSales, deleteSale } = useSales(storeId)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Filtros de fecha - por defecto día actual (usar fecha local)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [dateFilter, setDateFilter] = useState<"today" | "custom">("today")
  
  // Cargar ventas filtradas por fecha
  const [sales, setSales] = useState<Sale[]>([])
  
  // Función para cargar ventas filtradas
  const loadFilteredSales = useCallback(async () => {
    if (!storeId) {
      setSales([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      let filters: any = { storeId }
      
      if (dateFilter === "today") {
        // Cargar ventas del día actual (usar fecha local, no UTC)
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        
        filters.startDate = `${year}-${month}-${day}`
        filters.endDate = `${year}-${month}-${day}`
      } else if (dateFilter === "custom" && selectedDate) {
        // Cargar ventas de la fecha seleccionada (usar fecha directamente del input, ya viene en formato YYYY-MM-DD)
        // El input type="date" devuelve la fecha en formato YYYY-MM-DD en zona horaria local
        filters.startDate = selectedDate
        filters.endDate = selectedDate
      }
      
      console.log("📅 Cargando ventas con filtros:", filters)
      const data = await saleService.getSales(filters)
      console.log("✅ Ventas cargadas:", data.length)
      setSales(data)
    } catch (err) {
      console.error("❌ Error cargando ventas:", err)
      setSales([])
    } finally {
      setLoading(false)
    }
  }, [storeId, selectedDate, dateFilter])
  
  // Cargar ventas con filtro de fecha cuando cambie selectedDate o storeId
  useEffect(() => {
    loadFilteredSales()
  }, [loadFilteredSales])

  // Las ventas ya vienen filtradas por fecha desde el backend, solo necesitamos filtrar por tienda
  const filteredSalesByStore = useMemo(() => {
    const currentStoreId = storeId || user?.storeId || user?.store?.id
    
    if (!currentStoreId) {
      console.warn("⚠️ No storeId, retornando array vacío")
      return []
    }
    
    // Las ventas ya vienen filtradas por fecha desde el backend
    return sales.filter((sale) => {
      return sale.storeId === currentStoreId
    })
  }, [sales, storeId, user?.storeId, user?.store])

  const filteredSales = useMemo(() => {
    if (!searchTerm) return filteredSalesByStore
    return filteredSalesByStore.filter(
      (sale) =>
        sale.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toString().includes(searchTerm),
    )
  }, [filteredSalesByStore, searchTerm])

  const totalRevenue = useMemo(() => {
    return filteredSalesByStore.reduce((sum, sale) => sum + Number(sale.total), 0)
  }, [filteredSalesByStore])

  const totalProfit = useMemo(() => {
    return filteredSalesByStore.reduce((sum, sale) => sum + Number(sale.profit || 0), 0)
  }, [filteredSalesByStore])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filtros de fecha */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros de Fecha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex gap-2 flex-wrap w-full md:w-auto">
              <Button
                variant={dateFilter === "today" ? "default" : "outline"}
                onClick={() => {
                  setDateFilter("today")
                  const today = new Date()
                  const year = today.getFullYear()
                  const month = String(today.getMonth() + 1).padStart(2, '0')
                  const day = String(today.getDate()).padStart(2, '0')
                  setSelectedDate(`${year}-${month}-${day}`)
                }}
                className="transition-all hover:scale-105 flex-1 md:flex-none justify-center"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Hoy
              </Button>
              <Button
                variant={dateFilter === "custom" ? "default" : "outline"}
                onClick={() => setDateFilter("custom")}
                className="transition-all hover:scale-105 flex-1 md:flex-none justify-center"
              >
                Fecha Personalizada
              </Button>
            </div>
            {dateFilter === "custom" && (
              <div className="space-y-2 flex-1 md:max-w-xs">
                <Label htmlFor="selectedDate" className="text-sm font-medium">
                  Seleccionar Fecha
                </Label>
                <Input
                  id="selectedDate"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-11 border-2 focus:border-primary transition-colors"
                />
              </div>
            )}
            {dateFilter === "today" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Mostrando ventas del {new Date(selectedDate).toLocaleDateString("es-ES", { 
                  weekday: "long", 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cards de estadísticas mejoradas */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <div className="rounded-full bg-blue-500/10 p-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{filteredSalesByStore.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Ventas registradas</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <div className="rounded-full bg-green-500/10 p-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">Ingresos acumulados</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Total</CardTitle>
            <div className="rounded-full bg-purple-500/10 p-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{formatCurrency(totalProfit)}</p>
            <p className="text-xs text-muted-foreground mt-1">Ganancia neta</p>
          </CardContent>
        </Card>
      </div>

      {/* Card de historial mejorado */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Historial de Ventas</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Busca y visualiza todas tus ventas</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar ventas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-2 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Factura</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Cargando ventas...
                    </TableCell>
                  </TableRow>
                ) : filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm">No se encontraron ventas</p>
                        {!storeId && (
                          <p className="text-xs text-muted-foreground">Asegúrate de estar asociado a una tienda</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id} className="hover:bg-muted/50 transition-colors border-b">
                      <TableCell className="font-mono text-xs sm:text-sm font-semibold">
                        {sale.invoiceNumber || `V-${sale.id}`}
                      </TableCell>
                      <TableCell className="font-medium">{sale.client?.fullName || "Cliente general"}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {new Date(sale.createdAt).toLocaleString("es-ES")}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={sale.isCredit ? "outline" : "default"}
                          className={sale.isCredit ? "border-amber-500 text-amber-700 dark:text-amber-400" : ""}
                        >
                          {sale.isCredit ? "Fiado" : "Contado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-base sm:text-lg text-primary">
                        {formatCurrency(Number(sale.total))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedSale(sale)}
                            className="hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={async () => {
                                if (confirm(`¿Estás seguro de eliminar la venta ${sale.invoiceNumber}?`)) {
                                  try {
                                    await deleteSale(sale.id);
                                    // Recargar las ventas después de eliminar
                                    await loadFilteredSales();
                                    alert("Venta eliminada exitosamente");
                                  } catch (error: any) {
                                    alert(`Error al eliminar venta: ${error.message || "Error desconocido"}`);
                                  }
                                }
                              }}
                              className="hover:bg-destructive/10 hover:text-destructive transition-all hover:scale-110"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Venta</DialogTitle>
            <DialogDescription>Factura: {selectedSale?.invoiceNumber}</DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedSale.client?.fullName || "Cliente general"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{new Date(selectedSale.createdAt).toLocaleString("es-ES")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Venta</p>
                  <Badge variant={selectedSale.isCredit ? "outline" : "default"}>
                    {selectedSale.isCredit ? "Fiado" : "Contado"}
                  </Badge>
                </div>
                {selectedSale.profit && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ganancia</p>
                    <p className="font-medium text-green-600">{formatCurrency(Number(selectedSale.profit))}</p>
                  </div>
                )}
              </div>

              {selectedSale.details && selectedSale.details.length > 0 && (
                <div>
                  <p className="mb-2 font-medium">Productos</p>
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
                      {selectedSale.details.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product?.name || `Producto ${item.productId}`}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(item.unitPrice))}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(item.subtotal))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex flex-col gap-2 border-t pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold">{formatCurrency(Number(selectedSale.total))}</span>
                </div>
                {selectedSale.notes && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Notas</p>
                    <p className="text-sm">{selectedSale.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
