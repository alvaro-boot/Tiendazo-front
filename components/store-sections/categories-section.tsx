"use client";

import { Grid3x3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  id: number;
  name: string;
  category?: {
    id: number;
    name: string;
  };
}

interface CategoriesSectionProps {
  products: Product[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    template: string;
  };
  onCategoryClick: (categoryName: string) => void;
  config?: {
    title?: string;
    subtitle?: string;
  };
}

export function CategoriesSection({
  products,
  theme,
  onCategoryClick,
  config = {},
}: CategoriesSectionProps) {
  const {
    title = "Categorías",
    subtitle = "Explora nuestros productos por categoría",
  } = config;

  const categories = Array.from(
    new Set(products.map(p => p.category?.name).filter(Boolean))
  ) as string[];

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-10">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Grid3x3 
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categories.map((categoryName, index) => {
          const categoryProducts = products.filter(p => p.category?.name === categoryName);
          return (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2"
              style={{ 
                borderColor: theme.primaryColor + '30',
                backgroundColor: theme.backgroundColor,
              }}
              onClick={() => onCategoryClick(categoryName)}
            >
              <CardContent className="p-4 sm:p-6 text-center">
                <div 
                  className="text-3xl sm:text-4xl mb-2"
                  style={{ color: theme.primaryColor }}
                >
                  {categoryName.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-sm sm:text-base mb-1">{categoryName}</h3>
                <p className="text-xs sm:text-sm opacity-70">
                  {categoryProducts.length} {categoryProducts.length === 1 ? 'producto' : 'productos'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

