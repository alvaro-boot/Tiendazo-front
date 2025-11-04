"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";

export default function CartPage() {
  const router = useRouter();
  const { getCartItems, updateQuantity, removeItem, getCartTotal, clearCart } = useCart();
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const allItems = getCartItems();
  const stores = Array.from(new Set(allItems.map((item) => item.storeSlug)));

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

  const handleCheckout = (storeSlug: string) => {
    router.push(`/marketplace/checkout?store=${storeSlug}`);
  };

  const groupedByStore = stores.reduce((acc, storeSlug) => {
    acc[storeSlug] = allItems.filter((item) => item.storeSlug === storeSlug);
    return acc;
  }, {} as Record<string, typeof allItems>);

  if (allItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-soft">
          <div className="container mx-auto px-4 py-4">
            <Link href="/marketplace" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                <Store className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Tiendazo Marketplace
              </span>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto border-2 shadow-lg">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
              <p className="text-muted-foreground mb-6">
                Agrega productos al carrito para continuar
              </p>
              <Link href="/marketplace">
                <Button className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Continuar comprando
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link href="/marketplace" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                <Store className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent hidden sm:inline">
                Tiendazo Marketplace
              </span>
              <span className="text-sm sm:hidden font-bold">Tiendazo</span>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Volver</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Carrito de Compras</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {allItems.length} producto{allItems.length !== 1 ? "s" : ""} en tu carrito
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {stores.map((storeSlug) => {
              const storeItems = groupedByStore[storeSlug];
              const storeTotal = storeItems.reduce(
                (sum, item) => sum + item.unitPrice * item.quantity,
                0
              );

              return (
                <Card key={storeSlug} className="border-2 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-primary" />
                        {storeItems[0]?.storeSlug || "Tienda"}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearCart(storeSlug)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpiar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {storeItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div className="relative w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="h-8 w-8 sm:h-6 sm:w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                          <div>
                            <h3 className="font-semibold mb-1 line-clamp-2 text-sm sm:text-base">{item.productName}</h3>
                            <p className="text-base sm:text-lg font-bold text-primary">
                              {formatPrice(item.unitPrice)}
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 border rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  updateQuantity(storeSlug, item.productId, item.quantity - 1)
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-medium text-sm sm:text-base">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  updateQuantity(storeSlug, item.productId, item.quantity + 1)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex-1 flex items-center justify-between sm:justify-end gap-2">
                              <div className="text-left sm:text-right">
                                <p className="text-xs sm:text-sm text-muted-foreground sm:hidden">Subtotal:</p>
                                <p className="font-bold text-base sm:text-lg">
                                  {formatPrice(item.unitPrice * item.quantity)}
                                </p>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(storeSlug, item.productId)}
                                className="text-destructive hover:text-destructive flex-shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-3 sm:pt-4 flex items-center justify-between">
                      <span className="font-semibold text-sm sm:text-base">Subtotal de la tienda:</span>
                      <span className="text-lg sm:text-xl font-bold text-primary">
                        {formatPrice(storeTotal)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <Card className="border-2 shadow-lg sticky top-24">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Subtotal:</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Envío:</span>
                      <span className="text-muted-foreground text-[10px] sm:text-xs">Calculado en checkout</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-base sm:text-lg">
                      <span>Total:</span>
                      <span className="text-primary">{formatPrice(getCartTotal())}</span>
                    </div>
                  </div>

                  {stores.length === 1 ? (
                    <Button
                      className="w-full h-11 sm:h-12 text-sm sm:text-base"
                      size="lg"
                      onClick={() => handleCheckout(stores[0])}
                    >
                      <span className="hidden sm:inline">Proceder al Checkout</span>
                      <span className="sm:hidden">Checkout</span>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-2" />
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">
                        Selecciona una tienda para continuar
                      </p>
                      {stores.map((storeSlug) => (
                        <Button
                          key={storeSlug}
                          variant="outline"
                          className="w-full h-10 sm:h-11 text-xs sm:text-sm"
                          onClick={() => handleCheckout(storeSlug)}
                        >
                          <span className="hidden sm:inline">Checkout - </span>
                          {storeSlug}
                        </Button>
                      ))}
                    </div>
                  )}

                  <Link href="/marketplace">
                    <Button variant="outline" className="w-full h-10 sm:h-11 text-xs sm:text-sm">
                      <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Continuar comprando</span>
                      <span className="sm:hidden">Continuar</span>
                    </Button>
                  </Link>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

