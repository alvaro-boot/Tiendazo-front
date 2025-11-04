"use client";

import { useState, useEffect } from "react";

interface CartItem {
  productId: number;
  productName: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
  storeId: number;
  storeSlug: string;
}

interface CartStore {
  [storeSlug: string]: CartItem[];
}

export function useCart() {
  const [cart, setCart] = useState<CartStore>({});

  // Cargar carrito del localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem("marketplace-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error cargando carrito:", error);
        localStorage.removeItem("marketplace-cart");
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("marketplace-cart", JSON.stringify(cart));
  }, [cart]);

  const addItem = (
    storeSlug: string,
    productId: number,
    productName: string,
    unitPrice: number,
    storeId: number,
    productImage?: string,
    quantity: number = 1
  ) => {
    setCart((prev) => {
      const storeCart = prev[storeSlug] || [];
      const existingItem = storeCart.find((item) => item.productId === productId);

      if (existingItem) {
        return {
          ...prev,
          [storeSlug]: storeCart.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        ...prev,
        [storeSlug]: [
          ...storeCart,
          {
            productId,
            productName,
            productImage,
            unitPrice,
            quantity,
            storeId,
            storeSlug,
          },
        ],
      };
    });
  };

  const removeItem = (storeSlug: string, productId: number) => {
    setCart((prev) => {
      const storeCart = prev[storeSlug] || [];
      return {
        ...prev,
        [storeSlug]: storeCart.filter((item) => item.productId !== productId),
      };
    });
  };

  const updateQuantity = (storeSlug: string, productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(storeSlug, productId);
      return;
    }

    setCart((prev) => {
      const storeCart = prev[storeSlug] || [];
      return {
        ...prev,
        [storeSlug]: storeCart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        ),
      };
    });
  };

  const clearCart = (storeSlug?: string) => {
    if (storeSlug) {
      setCart((prev) => {
        const newCart = { ...prev };
        delete newCart[storeSlug];
        return newCart;
      });
    } else {
      setCart({});
      localStorage.removeItem("marketplace-cart");
    }
  };

  const getCartItems = (storeSlug?: string): CartItem[] => {
    if (storeSlug) {
      return cart[storeSlug] || [];
    }
    // Retornar todos los items de todas las tiendas
    return Object.values(cart).flat();
  };

  const getCartTotal = (storeSlug?: string): number => {
    const items = getCartItems(storeSlug);
    return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  };

  const getCartItemsCount = (storeSlug?: string): number => {
    const items = getCartItems(storeSlug);
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartItems,
    getCartTotal,
    getCartItemsCount,
  };
}

