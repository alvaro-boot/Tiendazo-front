"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Store, ArrowLeft, Package, MapPin, Phone, Mail, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/use-cart";
import { marketplaceService, orderService } from "@/lib/services";
import { formatCurrency } from "@/lib/utils";

interface ShippingForm {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  notes?: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeSlug = searchParams.get("store");
  
  const { getCartItems, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [store, setStore] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<ShippingForm>({
    shippingName: "",
    shippingPhone: "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZipCode: "",
    shippingCountry: "Colombia",
    notes: "",
  });

  useEffect(() => {
    if (!storeSlug) {
      router.push("/marketplace/cart");
      return;
    }

    loadStore();
    loadCartItems();
  }, [storeSlug]);

  const loadStore = async () => {
    try {
      const storeData = await marketplaceService.getStoreBySlug(storeSlug!);
      setStore(storeData);
    } catch (error) {
      console.error("Error cargando tienda:", error);
      setError("Error al cargar la tienda");
    }
  };

  const loadCartItems = () => {
    const items = getCartItems(storeSlug || undefined);
    setCartItems(items);
    
    if (items.length === 0) {
      router.push("/marketplace/cart");
    }
  };

  const formatPrice = (price: number): string => formatCurrency(price);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validaciones básicas
    if (!formData.shippingName.trim()) {
      setError("El nombre es requerido");
      setLoading(false);
      return;
    }

    if (!formData.shippingPhone.trim()) {
      setError("El teléfono es requerido");
      setLoading(false);
      return;
    }

    if (!formData.shippingAddress.trim()) {
      setError("La dirección es requerida");
      setLoading(false);
      return;
    }

    if (!formData.shippingCity.trim()) {
      setError("La ciudad es requerida");
      setLoading(false);
      return;
    }

    try {
      // Crear pedido
      const orderData = {
        storeId: store.id,
        paymentMethod: "ONLINE",
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingName: formData.shippingName,
        shippingPhone: formData.shippingPhone,
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingState: formData.shippingState,
        shippingZipCode: formData.shippingZipCode,
        shippingCountry: formData.shippingCountry,
        notes: formData.notes,
      };

      const order = await orderService.createOrder(orderData);
      
      // Limpiar carrito de esta tienda
      clearCart(storeSlug || undefined);
      
      // Redirigir a página de confirmación o a pasarela de pagos
      if (order.paymentGatewaySessionUrl) {
        window.location.href = order.paymentGatewaySessionUrl;
      } else {
        router.push(`/client/orders?order=${order.orderNumber}`);
      }
    } catch (err: any) {
      console.error("Error creando pedido:", err);
      setError(err.response?.data?.message || err.message || "Error al crear el pedido");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getCartTotal(storeSlug || undefined);
  const shipping = 0; // TODO: Calcular envío según ubicación
  const tax = subtotal * 0.19; // IVA 19% (Colombia)
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link href="/marketplace" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                <Store className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent hidden sm:inline">
                Prisma Commerce Marketplace
              </span>
              <span className="text-sm sm:hidden font-bold">Prisma</span>
            </Link>
            <Link href="/marketplace/cart">
              <Button variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Volver al carrito</span>
                <span className="sm:hidden">Volver</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Checkout</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Completa tu información para finalizar el pedido</p>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 text-xs sm:text-sm text-destructive-foreground bg-destructive/10 border border-destructive rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Información de envío */}
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Información de Envío
                  </CardTitle>
                  <CardDescription>Ingresa los datos para el envío de tu pedido</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shippingName" className="text-sm">Nombre completo *</Label>
                      <Input
                        id="shippingName"
                        value={formData.shippingName}
                        onChange={(e) =>
                          setFormData({ ...formData, shippingName: e.target.value })
                        }
                        required
                        placeholder="Juan Pérez"
                        className="h-10 sm:h-11 text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingPhone" className="text-sm">Teléfono *</Label>
                      <Input
                        id="shippingPhone"
                        type="tel"
                        value={formData.shippingPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, shippingPhone: e.target.value })
                        }
                        required
                        placeholder="+57 300 123 4567"
                        className="h-10 sm:h-11 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress" className="text-sm">Dirección *</Label>
                    <Input
                      id="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, shippingAddress: e.target.value })
                      }
                      required
                      placeholder="Calle 123 #45-67"
                      className="h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shippingCity" className="text-sm">Ciudad *</Label>
                      <Input
                        id="shippingCity"
                        value={formData.shippingCity}
                        onChange={(e) =>
                          setFormData({ ...formData, shippingCity: e.target.value })
                        }
                        required
                        placeholder="Bogotá"
                        className="h-10 sm:h-11 text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingState" className="text-sm">Departamento</Label>
                      <Input
                        id="shippingState"
                        value={formData.shippingState}
                        onChange={(e) =>
                          setFormData({ ...formData, shippingState: e.target.value })
                        }
                        placeholder="Cundinamarca"
                        className="h-10 sm:h-11 text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingZipCode" className="text-sm">Código Postal</Label>
                      <Input
                        id="shippingZipCode"
                        value={formData.shippingZipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, shippingZipCode: e.target.value })
                        }
                        placeholder="110111"
                        className="h-10 sm:h-11 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingCountry">País</Label>
                    <Input
                      id="shippingCountry"
                      value={formData.shippingCountry}
                      onChange={(e) =>
                        setFormData({ ...formData, shippingCountry: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Instrucciones especiales para la entrega..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Método de pago */}
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Método de Pago
                  </CardTitle>
                  <CardDescription>El pago se procesará después de confirmar el pedido</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Serás redirigido a la pasarela de pagos para completar el pago de forma segura.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <Card className="border-2 shadow-lg sticky top-20 lg:top-24">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="flex-1 truncate">
                          {item.productName} x{item.quantity}
                        </span>
                        <span className="ml-2">{formatPrice(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Envío:</span>
                      <span>{formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IVA (19%):</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 sm:h-12 text-sm sm:text-base" size="lg" disabled={loading}>
                    {loading ? "Procesando..." : "Confirmar Pedido"}
                  </Button>

                  <Link href="/marketplace/cart">
                    <Button variant="outline" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
                      <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Volver al carrito</span>
                      <span className="sm:hidden">Volver</span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

