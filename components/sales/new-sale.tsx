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
  const { clients } = useClients();
  const { createSale } = useSales();
  const { user } = useAuthContext();
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

  // Cargar productos solo para lectura
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await productService.getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.barcode.includes(searchTerm) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 10); // Mostrar hasta 10 resultados
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
      const saleDetails: SaleDetail[] = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.subtotal,
      }));

      const saleData = {
        invoiceNumber: invoiceNumber || `FAC-${Date.now()}`,
        total: totals.total,
        isCredit: paymentMethod === "credit",
        notes:
          notes ||
          `Venta ${paymentMethod === "credit" ? "a crédito" : "al contado"}`,
        storeId: 1, // Por defecto, debería venir del contexto
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
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Buscar Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, SKU o código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {searchTerm && filteredProducts.length > 0 && (
              <div className="mt-4 space-y-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent cursor-pointer"
                    onClick={() => addToCart(product)}
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.stock} | ${product.sellPrice.toFixed(2)}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchTerm && filteredProducts.length === 0 && !loading && (
              <div className="mt-4 text-center text-muted-foreground">
                <p>No se encontraron productos con ese término</p>
              </div>
            )}

            {loading && (
              <div className="mt-4 text-center text-muted-foreground">
                <p>Cargando productos...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carrito de Compra</CardTitle>
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
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">
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
                          >
                            -
                          </Button>
                          <span className="w-12 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${item.subtotal.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.productId)}
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
        <Card>
          <CardHeader>
            <CardTitle>Detalles de Venta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Número de Factura</Label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="FAC-001"
              />
            </div>

            <div className="space-y-2">
              <Label>Cliente (Opcional)</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
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
              <Label>Método de Pago</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: any) => setPaymentMethod(value)}
              >
                <SelectTrigger>
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
              <Label>Notas</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales..."
              />
            </div>

            {paymentMethod === "credit" && selectedClient === "general" && (
              <div className="rounded-lg bg-destructive/10 p-3">
                <p className="text-sm text-destructive">
                  Debes seleccionar un cliente para venta a crédito
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">
                  ${totals.total.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
            >
              Completar Venta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
