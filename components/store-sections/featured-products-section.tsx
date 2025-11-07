"use client";

import { Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  sellPrice: number;
  image: string;
  images: string[];
  stock: number;
  category: {
    id: number;
    name: string;
  };
}

interface FeaturedProductsSectionProps {
  products: Product[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    template: string;
  };
  onAddToCart: (product: Product) => void;
  formatPrice: (price: number) => string;
  config?: {
    title?: string;
    subtitle?: string;
    maxProducts?: number;
    showBadge?: boolean;
  };
}

export function FeaturedProductsSection({
  products,
  theme,
  onAddToCart,
  formatPrice,
  config = {},
}: FeaturedProductsSectionProps) {
  const {
    title = "Productos Destacados",
    subtitle = "Nuestros productos más populares y mejor valorados",
    maxProducts = 4,
    showBadge = true,
  } = config;

  const featuredProducts = products.slice(0, maxProducts);

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-10">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Award 
            className="h-6 w-6 sm:h-8 sm:w-8"
            style={{ color: theme.primaryColor }}
          />
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold"
            style={{ color: theme.textColor }}
          >
            {title}
          </h2>
        </div>
        <p 
          className="text-sm sm:text-base opacity-80"
          style={{ color: theme.textColor }}
        >
          {subtitle}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {featuredProducts.map((product) => (
          <Card
            key={product.id}
            className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2"
            style={{ borderColor: theme.primaryColor + '30' }}
          >
            <div className="relative aspect-square overflow-hidden rounded-t-2xl">
              <img
                src={product.image || product.images?.[0] || "/placeholder-product.jpg"}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {showBadge && (
                <Badge 
                  className="absolute top-2 left-2"
                  style={{ backgroundColor: theme.accentColor }}
                >
                  Destacado
                </Badge>
              )}
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-2">{product.name}</CardTitle>
              {product.category && (
                <CardDescription>{product.category.name}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span 
                  className="text-2xl font-bold"
                  style={{ color: theme.primaryColor }}
                >
                  {formatPrice(Number(product.sellPrice))}
                </span>
              </div>
              <Button
                className="w-full h-10 sm:h-11 text-sm sm:text-base"
                style={{
                  backgroundColor: theme.primaryColor,
                  borderColor: theme.primaryColor,
                }}
                onClick={() => onAddToCart(product)}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Agregar al Carrito</span>
                <span className="sm:hidden">Agregar</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

