"use client";

import { MessageSquare, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ReviewsSectionProps {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    template: string;
  };
  config?: {
    title?: string;
    subtitle?: string;
    reviews?: Array<{
      rating: number;
      comment: string;
      author: string;
    }>;
  };
}

export function ReviewsSection({
  theme,
  config = {},
}: ReviewsSectionProps) {
  const {
    title = "Reseñas de Clientes",
    subtitle = "Lo que nuestros clientes dicen sobre nosotros",
    reviews = [
      {
        rating: 5,
        comment: "Excelente servicio y productos de calidad. Muy recomendado.",
        author: "Cliente Satisfecho",
      },
      {
        rating: 5,
        comment: "Entrega rápida y atención al cliente excepcional.",
        author: "Cliente Satisfecho",
      },
      {
        rating: 5,
        comment: "Productos de excelente calidad y precios justos.",
        author: "Cliente Satisfecho",
      },
    ],
  } = config;

  return (
    <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-10">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare 
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {reviews.map((review, index) => (
          <Card 
            key={index}
            className="border-2" 
            style={{ borderColor: theme.primaryColor + '30' }}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${
                      i <= review.rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm sm:text-base mb-3 opacity-90">
                "{review.comment}"
              </p>
              <p className="text-xs sm:text-sm font-semibold opacity-70">
                - {review.author}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

