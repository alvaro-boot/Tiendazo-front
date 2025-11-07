"use client";

import { Newspaper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BlogSectionProps {
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
    posts?: Array<{
      title: string;
      excerpt: string;
      image?: string;
      link?: string;
    }>;
  };
}

export function BlogSection({
  theme,
  config = {},
}: BlogSectionProps) {
  const {
    title = "Blog y Noticias",
    subtitle = "Mantente al día con nuestras últimas novedades",
    posts = [
      {
        title: "Nuevos Productos Disponibles",
        excerpt: "Descubre nuestra nueva colección de productos exclusivos.",
        image: undefined,
        link: "#",
      },
      {
        title: "Ofertas Especiales",
        excerpt: "No te pierdas nuestras promociones y descuentos especiales.",
        image: undefined,
        link: "#",
      },
      {
        title: "Consejos y Tips",
        excerpt: "Aprende cómo aprovechar al máximo nuestros productos.",
        image: undefined,
        link: "#",
      },
    ],
  } = config;

  return (
    <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-10">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Newspaper 
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
        {posts.map((post, index) => (
          <Card 
            key={index}
            className="border-2 overflow-hidden" 
            style={{ borderColor: theme.primaryColor + '30' }}
          >
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-32 sm:h-40 object-cover"
              />
            ) : (
              <div 
                className="h-32 sm:h-40"
                style={{ 
                  backgroundColor: index === 0 
                    ? theme.primaryColor + '20' 
                    : index === 1 
                    ? theme.secondaryColor + '20' 
                    : theme.accentColor + '20' 
                }}
              />
            )}
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-semibold text-base sm:text-lg mb-2">
                {post.title}
              </h3>
              <p className="text-sm sm:text-base opacity-70 mb-3 line-clamp-2">
                {post.excerpt}
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                style={{ color: theme.primaryColor }}
                onClick={() => post.link && window.open(post.link, '_blank')}
              >
                Leer más →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

