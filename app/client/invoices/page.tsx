"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Download, Search, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { orderService, Order } from "@/lib/services";

export default function ClientInvoicesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Solo pedidos pagados/entregados tienen factura
      const data = await orderService.getOrders({
        paymentStatus: "APPROVED",
      });
      setOrders(data);
    } catch (error) {
      console.error("Error cargando facturas:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    const rounded = Math.round(price * 100) / 100;
    const parts = rounded.toString().split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1] || "";
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if (decimalPart && decimalPart !== "00" && decimalPart !== "0") {
      const formattedDecimal = decimalPart.padEnd(2, "0").substring(0, 2);
      return `$${formattedInteger},${formattedDecimal}`;
    }
    return `$${formattedInteger}`;
  };

  const handleDownloadInvoice = async (order: Order) => {
    try {
      // TODO: Implementar descarga de factura PDF
      // Por ahora, solo mostramos un mensaje
      alert(`Descarga de factura para pedido ${order.orderNumber} - Próximamente`);
    } catch (error) {
      console.error("Error descargando factura:", error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPaymentStatus =
      paymentStatusFilter === "all" || order.paymentStatus === paymentStatusFilter;
    return matchesSearch && matchesPaymentStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Mis Facturas</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Consulta y descarga tus facturas</p>
        </div>

        {/* Filtros */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar facturas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base"
            />
          </div>
          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 h-10 sm:h-11 text-sm sm:text-base">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las facturas</SelectItem>
              <SelectItem value="APPROVED">Pagadas</SelectItem>
              <SelectItem value="PENDING">Pendientes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de facturas */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando facturas...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="border-2 shadow-lg">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No hay facturas</h2>
              <p className="text-muted-foreground mb-6">
                Aún no tienes facturas disponibles
              </p>
              <Link href="/marketplace">
                <Button>Ir al sitio web de la tienda</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="border-2 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Factura #{order.orderNumber}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(order.createdAt).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500">Pagada</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(order)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Pedido</p>
                      <p className="font-semibold">#{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total</p>
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Fecha</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString("es-CO")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

