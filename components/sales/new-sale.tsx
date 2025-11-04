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
import { Search, Plus, Trash2, ShoppingCart, Minus, X, Package, AlertCircle, CheckCircle2, DollarSign, CreditCard, User, ChevronLeft, ChevronRight } from "lucide-react";
import { SaleDetail, productService } from "@/lib/services";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// Función para formatear precios con separadores de miles (formato colombiano)
const formatPrice = (price: number): string => {
  // Redondear a 2 decimales si es necesario
  const rounded = Math.round(price * 100) / 100;
  
  // Separar parte entera y decimal
  const parts = rounded.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] || '';
  
  // Agregar separadores de miles (punto como separador de miles)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Si tiene decimales significativos (no es .00), mostrarlos con coma
  // Si los decimales son "00" o no existen, no mostrarlos
  if (decimalPart && decimalPart !== '00' && decimalPart !== '0') {
    // Asegurar que tenga 2 dígitos
    const formattedDecimal = decimalPart.padEnd(2, '0').substring(0, 2);
    return `$${formattedInteger},${formattedDecimal}`;
  }
  
  // Si no tiene decimales o es .00, mostrar solo la parte entera
  return `$${formattedInteger}`;
};

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
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"details" | "summary">("details");

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
        storeId: storeId || user?.storeId || user?.store?.id,
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
      setIsCheckoutModalOpen(false);
      setCheckoutStep("details");
      alert("Venta registrada exitosamente");
    } catch (error) {
      console.error("Error al crear la venta:", error);
      alert("Error al registrar la venta");
    }
  };

  const handleOpenCheckout = () => {
    if (cart.length > 0) {
      setIsCheckoutModalOpen(true);
      setCheckoutStep("details");
    }
  };

  // Resetear paso cuando se cierra el modal
  useEffect(() => {
    if (!isCheckoutModalOpen) {
      setCheckoutStep("details");
    }
  }, [isCheckoutModalOpen]);

  const handleNextStep = () => {
    if (checkoutStep === "details") {
      setCheckoutStep("summary");
    }
  };

  const handlePreviousStep = () => {
    if (checkoutStep === "summary") {
      setCheckoutStep("details");
    }
  };

  const canProceedToNextStep = () => {
    if (checkoutStep === "details") {
      return paymentMethod !== "credit" || selectedClient !== "general";
    }
    return true;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Nueva Venta
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Registra una nueva venta de forma rápida e intuitiva
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
          <Card className="border-2 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Buscar y Agregar Productos
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
                  autoFocus
                />
              </div>
              {!loading && !error && products.length > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {filteredProducts.length} {filteredProducts.length === 1 ? "producto disponible" : "productos disponibles"}
                    {searchTerm && ` (de ${products.length} total)`}
                  </p>
                  {cart.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)} items en carrito
                    </Badge>
                  )}
                </div>
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
              <div className="mt-4 space-y-2 max-h-[500px] overflow-y-auto">
                {filteredProducts.map((product) => {
                  const cartItem = cart.find(item => item.productId === product.id);
                  const isInCart = !!cartItem;
                  const stockAvailable = product.stock - (cartItem?.quantity || 0);
                  
                  return (
                    <div
                      key={product.id}
                      className={`group flex items-center justify-between rounded-xl border-2 p-4 transition-all duration-200 ${
                        isInCart 
                          ? "bg-primary/5 border-primary/50 shadow-md" 
                          : "hover:bg-primary/5 hover:border-primary/50 hover:shadow-md hover:scale-[1.01]"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <p className="font-semibold text-base flex-1">{product.name}</p>
                          {isInCart && (
                            <Badge variant="default" className="text-xs flex-shrink-0">
                              En carrito: {cartItem.quantity}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            <span className={`font-medium ${stockAvailable <= 3 ? "text-amber-600" : "text-muted-foreground"}`}>
                              Stock: {stockAvailable}
                            </span>
                            {stockAvailable <= 3 && stockAvailable > 0 && (
                              <AlertCircle className="h-3 w-3 text-amber-600" />
                            )}
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-primary" />
                            <span className="font-semibold text-primary text-base">
                              {formatPrice(Number(product.sellPrice || 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        {isInCart ? (
                          <div className="flex items-center gap-1 bg-primary/10 rounded-lg p-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                              className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all"
                              disabled={cartItem.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold text-sm">
                              {cartItem.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                              className="h-7 w-7 rounded-full hover:bg-primary hover:text-primary-foreground transition-all"
                              disabled={stockAvailable <= 0}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => addToCart(product)}
                            className="hover:scale-110 transition-all shadow-md"
                            disabled={product.stock === 0}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
      </div>

      {/* Carrito de Compra - Visible al lado */}
      <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-1 lg:order-2">
        <Card className="border-2 shadow-lg sticky top-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Carrito de Compra
              {cart.length > 0 && (
                <Badge variant="default" className="ml-2">
                  {cart.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted/50 p-4 mb-4">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="font-medium text-muted-foreground">El carrito está vacío</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Busca y agrega productos para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {cart.map((item) => {
                    const product = products.find(p => p.id === item.productId);
                    const stockAvailable = product ? product.stock - item.quantity : 0;
                    
                    return (
                      <div
                        key={item.productId}
                        className="group flex items-center gap-3 rounded-lg border-2 p-3 bg-card hover:bg-muted/50 transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{item.productName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatPrice(item.price)} c/u
                            </span>
                            {stockAvailable <= 3 && stockAvailable >= 0 && (
                              <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                                Stock: {stockAvailable}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary p-0"
                              disabled={stockAvailable <= 0}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <p className="font-bold text-primary text-sm">
                              {formatPrice(item.subtotal)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.productId)}
                            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Items:</span>
                    <span className="font-semibold">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-base font-semibold">
                    <span>Subtotal:</span>
                    <span className="text-primary">{formatPrice(totals.subtotal)}</span>
                  </div>
                </div>
                <Button
                  onClick={handleOpenCheckout}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={cart.length === 0}
                >
                  <ChevronRight className="mr-2 h-5 w-5" />
                  Continuar con la Venta
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Modal de Checkout con Pasos - Solo Detalles y Resumen */}
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
              {checkoutStep === "details" && (
                <>
                  <User className="h-5 w-5 text-primary" />
                  Detalles de Venta
                </>
              )}
              {checkoutStep === "summary" && (
                <>
                  <DollarSign className="h-5 w-5 text-primary" />
                  Resumen de Venta
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Paso {checkoutStep === "details" ? "1" : "2"} de 2
            </DialogDescription>
          </DialogHeader>

          {/* Indicador de pasos */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                checkoutStep === "details" ? "bg-primary text-primary-foreground border-primary" : 
                checkoutStep === "summary" ? "bg-primary/10 text-primary border-primary" : 
                "bg-muted text-muted-foreground border-muted-foreground"
              }`}>
                {checkoutStep === "summary" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-semibold">1</span>
                )}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${
                checkoutStep === "details" ? "text-primary" : "text-muted-foreground"
              }`}>Detalles</span>
            </div>
            <div className={`h-0.5 w-8 sm:w-12 transition-all ${
              checkoutStep === "summary" ? "bg-primary" : "bg-muted"
            }`} />
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                checkoutStep === "summary" ? "bg-primary text-primary-foreground border-primary" : 
                "bg-muted text-muted-foreground border-muted-foreground"
              }`}>
                <span className="text-sm font-semibold">2</span>
              </div>
              <span className={`text-sm font-medium hidden sm:block ${
                checkoutStep === "summary" ? "text-primary" : "text-muted-foreground"
              }`}>Resumen</span>
            </div>
          </div>

          <div className="space-y-4 mt-4">
            {/* Paso 1: Detalles */}
            {checkoutStep === "details" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-semibold flex items-center gap-2">
                    <span>Número de Factura</span>
                    <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
                  </Label>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="FAC-001 (auto-generado si se deja vacío)"
                    className="h-11 border-2 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Cliente
                    {paymentMethod === "credit" && (
                      <Badge variant="destructive" className="text-xs">Requerido</Badge>
                    )}
                  </Label>
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
                  <Label className="font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Método de Pago
                  </Label>
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
                  <Label className="font-semibold">Notas (Opcional)</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas adicionales..."
                    className="h-11 border-2 focus:border-primary transition-colors"
                  />
                </div>

                {paymentMethod === "credit" && selectedClient === "general" && (
                  <div className="rounded-xl bg-destructive/10 border-2 border-destructive/20 p-4 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium text-destructive">
                        Debes seleccionar un cliente para realizar una venta a crédito
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Paso 2: Resumen */}
            {checkoutStep === "summary" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Items
                    </span>
                    <span className="font-semibold">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border">
                    <span className="text-muted-foreground font-medium">Subtotal</span>
                    <span className="font-semibold text-lg">{formatPrice(totals.subtotal)}</span>
                  </div>
                  <div className="border-t-2 pt-4 space-y-3">
                    <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/30">
                      <span className="text-xl font-bold">Total a Pagar</span>
                      <span className="text-3xl font-bold text-primary">
                        {formatPrice(totals.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navegación entre pasos */}
          <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={checkoutStep === "details" ? () => setIsCheckoutModalOpen(false) : handlePreviousStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {checkoutStep === "details" ? "Cerrar" : "Atrás"}
            </Button>

            {checkoutStep === "summary" ? (
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                size="lg"
                onClick={handleCompleteSale}
                disabled={cart.length === 0 || (paymentMethod === "credit" && selectedClient === "general")}
              >
                {cart.length === 0 ? (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Agrega productos al carrito
                  </>
                ) : paymentMethod === "credit" && selectedClient === "general" ? (
                  <>
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Selecciona un cliente
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Completar Venta
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNextStep}
                disabled={!canProceedToNextStep()}
                className="flex-1 bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Siguiente
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

