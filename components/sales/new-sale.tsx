"use client";

import { useState, useMemo, useEffect } from "react";
import { useClients, useSales } from "@/hooks/use-api";
import { useAuthContext } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Trash2, ShoppingCart } from "lucide-react";
import { SaleDetail, productService } from "@/lib/services";

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export function NewSale() {
  const { user } = useAuthContext();
  const storeId = user?.storeId || user?.store?.id;
  const { clients } = useClients(storeId);
  const { createSale } = useSales(storeId);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("general");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "transfer" | "credit"
  >("cash");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos solo para lectura, filtrados por tienda
  useEffect(() => {
    const loadProducts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("🛒 Cargando productos para venta, storeId:", user.storeId);
        
        const filters = user.storeId ? { storeId: user.storeId } : undefined;
        const productsData = await productService.getProducts(filters);
        
        console.log("✅ Productos cargados:", productsData.length);
        
        // Normalizar los datos: asegurar que los precios sean números
        const normalizedProducts = productsData.map((product) => ({
          ...product,
          purchasePrice: Number(product.purchasePrice || 0),
          sellPrice: Number(product.sellPrice || 0),
          stock: Number(product.stock || 0),
          minStock: Number(product.minStock || 0),
        }));
        setProducts(normalizedProducts);
      } catch (error: any) {
        console.error("❌ Error al cargar productos:", error);
        setError(error.message || "Error al cargar productos");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [user?.storeId, user]);

  const filteredProducts = useMemo(() => {
    // Si no hay búsqueda, mostrar todos los productos con stock (limitado a 20 para no saturar)
    // Si hay búsqueda, filtrar por el término
    const productsWithStock = products.filter((p) => p.stock > 0);
    
    if (!searchTerm) {
      return productsWithStock.slice(0, 20); // Mostrar hasta 20 productos sin búsqueda
    }
    
    return productsWithStock.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchTerm)) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.productId === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert("No hay suficiente stock disponible");
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
              }
            : item
        )
      );
    } else {
      if (product.stock === 0) {
        alert("Producto sin stock");
        return;
      }
      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.sellPrice,
        subtotal: product.sellPrice,
      };
      setCart([...cart, newItem]);
    }
    setSearchTerm("");
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (quantity > product.stock) {
      alert("No hay suficiente stock disponible");
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity, subtotal: quantity * item.price }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal; // Sin impuestos por ahora
    return { subtotal, total };
  }, [cart]);

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    if (paymentMethod === "credit" && selectedClient === "general") {
      alert("Selecciona un cliente para venta a crédito");
      return;
    }

    try {
      // El backend calcula el subtotal automáticamente, no debemos enviarlo
      const saleDetails = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        // NO incluir subtotal - el backend lo calcula
      }));

      const saleData = {
        invoiceNumber: invoiceNumber || `FAC-${Date.now()}`,
        total: totals.total,
        isCredit: paymentMethod === "credit",
        notes:
          notes ||
          `Venta ${paymentMethod === "credit" ? "a crédito" : "al contado"}`,
        storeId: user?.storeId || 1,
        clientId:
          selectedClient !== "general" ? parseInt(selectedClient) : undefined,
        details: saleDetails,
      };

      await createSale(saleData);

      setCart([]);
      setSelectedClient("general");
      setPaymentMethod("cash");
      setInvoiceNumber("");
      setNotes("");
      alert("Venta registrada exitosamente");
    } catch (error) {
      console.error("Error al crear la venta:", error);
      alert("Error al registrar la venta");
    }
  };

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Buscar Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={products.length > 0 ? `Buscar entre ${products.length} productos...` : "Buscar por nombre o código de barras..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-2 text-base focus:border-primary transition-colors"
                disabled={loading}
              />
            </div>
            {!loading && !error && products.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {filteredProducts.length} {filteredProducts.length === 1 ? "producto disponible" : "productos disponibles"}
                {searchTerm && ` (de ${products.length} total)`}
              </p>
            )}

            {loading && (
              <div className="mt-4 text-center py-8 text-muted-foreground">
                <p>Cargando productos...</p>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl bg-destructive/10 border-2 border-destructive/20 p-4">
                <p className="text-sm font-medium text-destructive">
                  ⚠️ {error}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    setError(null);
                    const loadProducts = async () => {
                      try {
                        setLoading(true);
                        const filters = user?.storeId ? { storeId: user.storeId } : undefined;
                        const productsData = await productService.getProducts(filters);
                        const normalizedProducts = productsData.map((product) => ({
                          ...product,
                          purchasePrice: Number(product.purchasePrice || 0),
                          sellPrice: Number(product.sellPrice || 0),
                          stock: Number(product.stock || 0),
                          minStock: Number(product.minStock || 0),
                        }));
                        setProducts(normalizedProducts);
                      } catch (err: any) {
                        setError(err.message || "Error al cargar productos");
                      } finally {
                        setLoading(false);
                      }
                    };
                    loadProducts();
                  }}
                >
                  Reintentar
                </Button>
              </div>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group flex items-center justify-between rounded-xl border-2 p-4 hover:bg-primary/5 hover:border-primary/50 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-base">{product.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Stock: <span className="font-medium">{product.stock}</span> | 
                        Precio: <span className="font-semibold text-primary">${Number(product.sellPrice || 0).toFixed(2)}</span>
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="ml-4 hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && searchTerm && filteredProducts.length === 0 && (
              <div className="mt-4 text-center py-8 rounded-xl border-2 border-dashed bg-muted/50">
                <p className="text-muted-foreground">No se encontraron productos con ese término</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Intenta con otro término de búsqueda o revisa el stock disponible
                </p>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="mt-4 text-center py-8 rounded-xl border-2 border-dashed bg-muted/50">
                <p className="text-muted-foreground">No hay productos disponibles</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ve a la página de productos para crear productos o revisa el filtro de tienda
                </p>
              </div>
            )}

            {!loading && !error && products.length > 0 && !searchTerm && filteredProducts.length === 0 && (
              <div className="mt-4 text-center py-8 rounded-xl border-2 border-dashed bg-muted/50">
                <p className="text-muted-foreground">No hay productos con stock disponible</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Todos los productos están sin stock. Ve a la página de productos para agregar stock.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Carrito de Compra
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">El carrito está vacío</p>
                <p className="text-sm text-muted-foreground">
                  Busca productos para agregar a la venta
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.productId} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-semibold text-base">
                        {item.productName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="h-8 w-8 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-all hover:scale-110"
                          >
                            -
                          </Button>
                          <span className="w-12 text-center font-semibold text-base">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="h-8 w-8 rounded-full hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${item.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary text-lg">
                        ${item.subtotal.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.productId)}
                          className="hover:bg-destructive/10 hover:text-destructive transition-all hover:scale-110"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              Detalles de Venta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold">Número de Factura</Label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="FAC-001"
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Cliente (Opcional)</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="h-11 border-2">
                  <SelectValue placeholder="Cliente General" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Cliente General</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Método de Pago</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: any) => setPaymentMethod(value)}
              >
                <SelectTrigger className="h-11 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="credit">Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Notas</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales..."
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>

            {paymentMethod === "credit" && selectedClient === "general" && (
              <div className="rounded-xl bg-destructive/10 border-2 border-destructive/20 p-4 animate-in fade-in">
                <p className="text-sm font-medium text-destructive">
                  ⚠️ Debes seleccionar un cliente para venta a crédito
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-muted-foreground font-medium">Subtotal</span>
              <span className="font-semibold text-lg">${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="border-t-2 pt-4 space-y-3">
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20">
                <span className="text-xl font-bold">Total</span>
                <span className="text-3xl font-bold text-primary">
                  ${totals.total.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              size="lg"
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
            >
              {cart.length === 0 ? "Agrega productos al carrito" : "Completar Venta"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
