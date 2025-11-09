"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/lib/auth-context";
import { useClients, useSales } from "@/hooks/use-api";
import { productService } from "@/lib/services";
import { formatCurrency } from "@/lib/utils";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  Loader2,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  User,
  X,
  Zap,
} from "lucide-react";

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

const formatPrice = (value: number) => formatCurrency(value);

export function NewSale() {
  const { user } = useAuthContext();
  const storeId = user?.storeId || user?.store?.id;
  const { clients } = useClients(storeId);
  const { createSale } = useSales(storeId);

  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "transfer" | "credit"
  >("cash");
  const [selectedClient, setSelectedClient] = useState<string>("general");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"details" | "summary">(
    "details",
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const filters = storeId ? { storeId } : undefined;
        const response = await productService.getProducts(filters);
        setProducts(
          response.map((product: any) => ({
            ...product,
            sellPrice: Number(product.sellPrice || 0),
            stock: Number(product.stock || 0),
          })),
        );
        setError(null);
      } catch (fetchError: any) {
        console.error("Error cargando productos", fetchError);
        setError(fetchError.message || "No fue posible cargar los productos");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [storeId, user]);

  const filteredProducts = useMemo(() => {
    const available = products.filter((product) => product.stock > 0);
    if (!search) {
      return available.slice(0, 20);
    }
    const term = search.toLowerCase();
    return available.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.barcode?.includes(term) ||
        product.description?.toLowerCase().includes(term),
    );
  }, [products, search]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    return { subtotal, total: subtotal };
  }, [cart]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert("No hay suficiente stock disponible");
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
              }
            : item,
        );
      }

      if (product.stock <= 0) {
        alert("Producto sin stock");
        return prev;
      }

      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.sellPrice,
          subtotal: product.sellPrice,
        },
      ];
    });
    setSearch("");
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }

    if (quantity > product.stock) {
      alert("No hay suficiente stock disponible");
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity, subtotal: quantity * item.price }
          : item,
      ),
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const performSale = async () => {
    try {
      setIsProcessing(true);

      const saleData = {
        invoiceNumber: invoiceNumber || `FAC-${Date.now()}`,
        total: totals.total,
        isCredit: paymentMethod === "credit",
        notes:
          notes ||
          `Venta ${paymentMethod === "credit" ? "a crédito" : "al contado"}`,
        storeId,
        clientId:
          selectedClient !== "general" ? Number(selectedClient) : undefined,
        details: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      };

      await createSale(saleData);

      setCart([]);
      setSelectedClient("general");
      setPaymentMethod("cash");
      setInvoiceNumber("");
      setNotes("");
      setIsCheckoutOpen(false);
      setCheckoutStep("details");
      alert("Venta registrada exitosamente");
    } catch (submitError) {
      console.error("Error al registrar la venta", submitError);
      alert("No fue posible registrar la venta");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteSale = () => {
    if (!cart.length) {
      alert("El carrito está vacío");
      return;
    }
    if (paymentMethod === "credit" && selectedClient === "general") {
      alert("Selecciona un cliente para venta a crédito");
      return;
    }
    void performSale();
  };

  const handleQuickSale = () => {
    if (!cart.length) {
      alert("El carrito está vacío");
      return;
    }
    if (paymentMethod === "credit" && selectedClient === "general") {
      alert("Selecciona un cliente para venta a crédito");
      setIsCheckoutOpen(true);
      setCheckoutStep("details");
      return;
    }
    void performSale();
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter" && filteredProducts.length > 0) {
      event.preventDefault();
      addToCart(filteredProducts[0]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Nueva Venta
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Registra ventas en segundos con búsqueda inteligente y venta rápida.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 order-2 lg:order-1 space-y-4">
          <Card className="prisma-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Package className="h-5 w-5 text-primary" />
                Productos disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={
                    products.length
                      ? `Buscar entre ${products.length} productos...`
                      : "Buscar por nombre o código de barras..."
                  }
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10 h-12 border focus-visible:ring-primary"
                  disabled={loading}
                />
              </div>

              {loading && (
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Cargando productos...
                </p>
              )}

              {error && (
                <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                  <p className="text-sm font-medium text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setError(null);
                      setSearch("");
                      void productService
                        .getProducts(storeId ? { storeId } : undefined)
                        .then((response) =>
                          setProducts(
                            response.map((product: any) => ({
                              ...product,
                              sellPrice: Number(product.sellPrice || 0),
                              stock: Number(product.stock || 0),
                            })),
                          ),
                        )
                        .catch((retryError) =>
                          setError(
                            retryError.message ||
                              "No fue posible cargar los productos",
                          ),
                        );
                    }}
                  >
                    Reintentar
                  </Button>
                </div>
              )}

              {!loading && !error && (
                <div className="mt-4 space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {filteredProducts.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-muted/50 p-6 text-center">
                      <p className="text-muted-foreground">
                        No se encontraron productos disponibles.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Verifica el stock o intenta con otro término de búsqueda.
                      </p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const cartItem = cart.find(
                        (item) => item.productId === product.id,
                      );
                      const remaining = product.stock - (cartItem?.quantity || 0);
                      const inCart = Boolean(cartItem);

                      return (
                        <div
                          key={product.id}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all ${
                            inCart
                              ? "border-primary/40 bg-primary/10"
                              : "hover:border-primary/40 hover:bg-primary/5"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-sm sm:text-base">
                              {product.name}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Package className="h-3.5 w-3.5" /> Stock: {remaining}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5 text-primary" />
                                <span className="font-semibold text-primary">
                                  {formatPrice(product.sellPrice)}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex items-center gap-2">
                            {inCart ? (
                              <div className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(
                                      product.id,
                                      (cartItem?.quantity || 1) - 1,
                                    )
                                  }
                                  disabled={(cartItem?.quantity || 1) <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-semibold">
                                  {cartItem?.quantity || 1}
                                </span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(
                                      product.id,
                                      (cartItem?.quantity || 0) + 1,
                                    )
                                  }
                                  disabled={remaining <= 0}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => addToCart(product)}
                                className="shadow-sm"
                                disabled={product.stock === 0}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Agregar
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="order-1 lg:order-2 space-y-4">
          <Card className="prisma-card sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Carrito de compra
                {cart.length > 0 && (
                  <Badge className="ml-2">{cart.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 rounded-full bg-muted/50 p-4">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-muted-foreground">
                    El carrito está vacío
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Agrega productos para iniciar la venta.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                    {cart.map((item) => {
                      const product = products.find(
                        (productItem) => productItem.id === item.productId,
                      );
                      const remaining = product
                        ? product.stock - item.quantity
                        : 0;

                      return (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between rounded-lg border px-3 py-2"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold">
                              {item.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(item.price)} c/u
                            </p>
                            {remaining <= 3 && (
                              <Badge
                                variant="outline"
                                className="mt-1 text-[0.65rem] text-amber-600 border-amber-500"
                              >
                                Stock restante: {remaining}
                              </Badge>
                            )}
                          </div>
                          <div className="ml-3 flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-semibold">
                                {item.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                disabled={remaining <= 0}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="min-w-[80px] text-right">
                              <p className="text-sm font-bold text-primary">
                                {formatPrice(item.subtotal)}
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => removeFromCart(item.productId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 border-t pt-3 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Total ítems</span>
                      <span className="font-semibold">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-base font-semibold">
                      <span>Subtotal</span>
                      <span className="text-primary">
                        {formatPrice(totals.subtotal)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      if (cart.length) {
                        setIsCheckoutOpen(true);
                        setCheckoutStep("details");
                      }
                    }}
                    className="h-12 w-full text-base font-semibold"
                    disabled={!cart.length || isProcessing}
                  >
                    <ChevronRight className="mr-2 h-5 w-5" />
                    Continuar con la venta
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleQuickSale}
                    disabled={!cart.length || isProcessing}
                    className="h-11 w-full text-sm font-semibold gap-2 border-primary/40 text-primary hover:bg-primary/10"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Procesando...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" /> Venta rápida
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {checkoutStep === "details" ? (
                <>
                  <User className="h-5 w-5 text-primary" /> Detalles de venta
                </>
              ) : (
                <>
                  <DollarSign className="h-5 w-5 text-primary" /> Resumen de venta
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Paso {checkoutStep === "details" ? "1" : "2"} de 2
            </DialogDescription>
          </DialogHeader>

          {checkoutStep === "details" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Número de factura (opcional)</Label>
                <Input
                  value={invoiceNumber}
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                  placeholder="FAC-001"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Cliente
                  {paymentMethod === "credit" && selectedClient === "general" && (
                    <Badge variant="destructive" className="text-xs">
                      Requerido en crédito
                    </Badge>
                  )}
                </Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cliente general" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Cliente general</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Método de pago
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
                <Label>Notas (opcional)</Label>
                <Input
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Observaciones de la venta"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Cerrar
                </Button>
                <Button
                  onClick={() => setCheckoutStep("summary")}
                  disabled={
                    paymentMethod === "credit" && selectedClient === "general"
                  }
                  className="flex items-center gap-2"
                >
                  Siguiente <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-semibold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-semibold">
                    {formatPrice(totals.subtotal)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border-2 border-primary/40 bg-primary/10 p-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Total a pagar
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {formatPrice(totals.total)}
                </p>
              </div>

              <div className="flex justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCheckoutStep("details")}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Atrás
                </Button>
                <Button
                  onClick={handleCompleteSale}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Confirmar venta
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

