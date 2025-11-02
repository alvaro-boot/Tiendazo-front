"use client"

import { useState, useMemo, useEffect } from "react"
import { useSales } from "@/hooks/use-api"
import { useAuthContext } from "@/lib/auth-context"
import { Sale } from "@/lib/services"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Eye, ShoppingCart, TrendingUp, DollarSign } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function SalesHistory() {
  const { user } = useAuthContext()
  const { sales, fetchSales, loading } = useSales(user?.storeId)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  useEffect(() => {
    if (user?.storeId) {
      console.log("🔄 Fetching sales for storeId:", user.storeId)
      fetchSales()
    } else {
      console.warn("⚠️ No storeId available for user:", user)
    }
  }, [fetchSales, user?.storeId])

  // Ya viene filtrado por tienda desde el hook useSales, pero por seguridad filtramos de nuevo
  const filteredSalesByStore = useMemo(() => {
    console.log("🔍 Procesando ventas:", {
      total: sales.length,
      storeId: user?.storeId,
      sales: sales.map(s => ({
        id: s.id,
        storeId: s.storeId,
        invoiceNumber: s.invoiceNumber,
        total: s.total,
      })),
    })
    
    if (!user?.storeId) {
      console.warn("⚠️ No storeId, retornando array vacío")
      return []
    }
    
    const filtered = sales.filter((sale) => {
      const matches = sale.storeId === user.storeId
      if (!matches) {
        console.log("🔍 Venta filtrada:", { saleId: sale.id, saleStoreId: sale.storeId, userStoreId: user.storeId })
      }
      return matches
    })
    
    console.log("✅ Ventas filtradas:", {
      total: sales.length,
      filtradas: filtered.length,
      storeId: user?.storeId,
      ventas: filtered.slice(0, 3).map(s => ({
        id: s.id,
        invoiceNumber: s.invoiceNumber,
        total: s.total,
        profit: s.profit,
        hasDetails: !!s.details,
        detailsCount: s.details?.length || 0,
      })),
    })
    
    return filtered
  }, [sales, user?.storeId])

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
      {/* Cards de estadísticas mejoradas */}
      <div className="grid gap-6 md:grid-cols-3">
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
            <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
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
            <p className="text-3xl font-bold text-green-600">${totalProfit.toFixed(2)}</p>
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
        <CardContent>
          <Table>
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
                      {!user?.storeId && (
                        <p className="text-xs text-muted-foreground">Asegúrate de estar asociado a una tienda</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-muted/50 transition-colors border-b">
                    <TableCell className="font-mono text-sm font-semibold">
                      {sale.invoiceNumber || `V-${sale.id}`}
                    </TableCell>
                    <TableCell className="font-medium">{sale.client?.fullName || "Cliente general"}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(sale.createdAt).toLocaleString("es-ES")}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={sale.isCredit ? "outline" : "default"}
                        className={sale.isCredit ? "border-amber-500 text-amber-700 dark:text-amber-400" : ""}
                      >
                        {sale.isCredit ? "Fiado" : "Contado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg text-primary">${Number(sale.total).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedSale(sale)}
                        className="hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-2xl">
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
                    <p className="font-medium text-green-600">${Number(selectedSale.profit).toFixed(2)}</p>
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
                          <TableCell className="text-right">${Number(item.unitPrice).toFixed(2)}</TableCell>
                          <TableCell className="text-right">${Number(item.subtotal).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex justify-between border-t pt-2">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold">${Number(selectedSale.total).toFixed(2)}</span>
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
