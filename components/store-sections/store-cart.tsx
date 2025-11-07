"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

interface StoreCartProps {
  storeSlug: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    template: string;
  };
  formatPrice: (price: number) => string;
}

export function StoreCart({
  storeSlug,
  theme,
  formatPrice,
}: StoreCartProps) {
  const [open, setOpen] = useState(false);
  const {
    getCartItems,
    getCartTotal,
    getCartItemsCount,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { toast } = useToast();

  const cartItems = getCartItems(storeSlug);
  const cartTotal = getCartTotal(storeSlug);
  const cartItemsCount = getCartItemsCount(storeSlug);

  // Abrir el carrito cuando se agregue un producto
  useEffect(() => {
    if (cartItemsCount > 0 && !open) {
      // Opcional: abrir automáticamente cuando se agrega el primer producto
      // setOpen(true);
    }
  }, [cartItemsCount, open]);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos al carrito antes de finalizar la compra.",
        variant: "destructive",
      });
      return;
    }

    // Aquí se puede implementar la lógica de checkout
    console.log("Proceder al checkout", cartItems);
    toast({
      title: "Procesando compra",
      description: "Funcionalidad de checkout en desarrollo. Próximamente disponible.",
    });
  };

  const handleRemoveItem = (productId: number, productName: string) => {
    removeItem(storeSlug, productId);
    toast({
      title: "Producto eliminado",
      description: `${productName} se eliminó del carrito.`,
      duration: 2000,
    });
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    
    clearCart(storeSlug);
    toast({
      title: "Carrito vaciado",
      description: "Todos los productos se eliminaron del carrito.",
      duration: 2000,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant={theme.template === 'MINIMALIST' ? 'outline' : 'ghost'}
          size="sm"
          className="relative h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
          style={{
            color: theme.template === 'MODERN' || theme.template === 'ELEGANT' ? 'white' : theme.textColor,
            borderColor: theme.template === 'MINIMALIST' ? theme.primaryColor : undefined,
          }}
        >
          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
          <span className="hidden sm:inline">Carrito</span>
          {cartItemsCount > 0 && (
            <Badge
              className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-[10px] sm:text-xs absolute -top-1 -right-1"
              style={{
                backgroundColor: theme.template === 'MODERN' ? theme.accentColor :
                                theme.template === 'MINIMALIST' ? theme.primaryColor :
                                theme.accentColor,
              }}
            >
              {cartItemsCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:w-96 p-0 flex flex-col"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
        }}
      >
        <SheetHeader className="p-4 sm:p-6 border-b" style={{ borderColor: theme.primaryColor + '30' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" style={{ color: theme.primaryColor }} />
              <SheetTitle style={{ color: theme.textColor }}>
                Carrito de Compras
              </SheetTitle>
            </div>
            {cartItemsCount > 0 && (
              <Badge
                style={{
                  backgroundColor: theme.primaryColor,
                  color: 'white',
                }}
              >
                {cartItemsCount} {cartItemsCount === 1 ? 'producto' : 'productos'}
              </Badge>
            )}
          </div>
          <SheetDescription style={{ color: theme.textColor + '80' }}>
            {cartItemsCount === 0
              ? "Tu carrito está vacío"
              : `${cartItemsCount} ${cartItemsCount === 1 ? 'producto' : 'productos'} en tu carrito`}
          </SheetDescription>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30" style={{ color: theme.primaryColor }} />
              <p className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>
                Tu carrito está vacío
              </p>
              <p className="text-sm opacity-70" style={{ color: theme.textColor }}>
                Agrega productos para comenzar
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4 sm:p-6">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 p-4 rounded-lg border-2"
                    style={{
                      borderColor: theme.primaryColor + '30',
                      backgroundColor: theme.backgroundColor,
                    }}
                  >
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2" style={{ color: theme.textColor }}>
                        {item.productName}
                      </h4>
                      <p className="text-sm font-bold mb-2" style={{ color: theme.primaryColor }}>
                        {formatPrice(item.unitPrice)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(storeSlug, item.productId, item.quantity - 1)}
                          style={{
                            borderColor: theme.primaryColor,
                            color: theme.primaryColor,
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-semibold w-8 text-center" style={{ color: theme.textColor }}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(storeSlug, item.productId, item.quantity + 1)}
                          style={{
                            borderColor: theme.primaryColor,
                            color: theme.primaryColor,
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto"
                          onClick={() => handleRemoveItem(item.productId, item.productName)}
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold mt-2" style={{ color: theme.textColor }}>
                        Subtotal: {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-4 sm:p-6 space-y-4" style={{ borderColor: theme.primaryColor + '30' }}>
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-semibold" style={{ color: theme.textColor }}>
                  Total:
                </span>
                <span className="text-xl sm:text-2xl font-bold" style={{ color: theme.primaryColor }}>
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <Separator style={{ backgroundColor: theme.primaryColor + '30' }} />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClearCart}
                  disabled={cartItems.length === 0}
                  style={{
                    borderColor: theme.primaryColor,
                    color: theme.primaryColor,
                  }}
                >
                  Vaciar Carrito
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCheckout}
                  style={{
                    backgroundColor: theme.primaryColor,
                    color: 'white',
                  }}
                >
                  Finalizar Compra
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

