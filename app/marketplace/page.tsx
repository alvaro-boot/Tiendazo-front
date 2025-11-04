"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, Search, MapPin, Star, Package, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { marketplaceService } from "@/lib/services";

interface PublicStore {
  id: number;
  name: string;
  description: string;
  slug: string;
  logo: string;
  banner: string;
  address: string;
  phone: string;
  email: string;
  latitude?: number;
  longitude?: number;
}

interface Product {
  id: number;
  name: string;
  sellPrice: number;
  image?: string;
  images?: string[];
  stock: number;
  category?: {
    id: number;
    name: string;
  };
}

interface StoreWithProducts extends PublicStore {
  products?: Product[];
  productsCount?: number;
}

export default function MarketplacePage() {
  const [stores, setStores] = useState<StoreWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      const data = await marketplaceService.getPublicStores();
      
      // Cargar productos para cada tienda
      const storesWithProducts = await Promise.all(
        data.map(async (store) => {
          try {
            const productsResponse = await marketplaceService.getStoreProducts(store.slug, {
              page: 1,
              limit: 6, // Mostrar solo los primeros 6 productos
            });
            
            return {
              ...store,
              products: productsResponse.products || [],
              productsCount: productsResponse.pagination?.total || 0,
            };
          } catch (error) {
            console.error(`Error cargando productos para tienda ${store.slug}:`, error);
            return {
              ...store,
              products: [],
              productsCount: 0,
            };
          }
        })
      );
      
      setStores(storesWithProducts);
    } catch (error) {
      console.error("Error cargando tiendas:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number): string => {
    const rounded = Math.round(price * 100) / 100;
    const parts = rounded.toString().split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '';
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (decimalPart && decimalPart !== '00' && decimalPart !== '0') {
      const formattedDecimal = decimalPart.padEnd(2, '0').substring(0, 2);
      return `$${formattedInteger},${formattedDecimal}`;
    }
    return `$${formattedInteger}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/marketplace" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                <Store className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Tiendazo Marketplace
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Descubre las Mejores Tiendas
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explora productos únicos de tiendas locales y encuentra lo que necesitas
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar tiendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-xl text-base"
            />
          </div>
        </div>

        {/* Stores Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando tiendas...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron tiendas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <Link key={store.id} href={`/marketplace/tienda/${store.slug}`}>
                <Card className="group hover:shadow-soft-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border-2 border-border/50">
                  {store.banner && (
                    <div className="relative h-48 overflow-hidden rounded-t-2xl">
                      <img
                        src={store.banner}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {store.logo ? (
                        <img
                          src={store.logo}
                          alt={store.name}
                          className="h-12 w-12 rounded-xl object-cover border-2 border-border"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                          <Store className="h-6 w-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="truncate">{store.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {store.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {store.address && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{store.address}</span>
                          </div>
                        )}
                        {store.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{store.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Productos destacados */}
                      {store.products && store.products.length > 0 && (
                        <div className="border-t pt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Package className="h-4 w-4 text-primary" />
                              <span>Productos</span>
                              {store.productsCount && store.productsCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {store.productsCount} disponible{store.productsCount !== 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {store.products.slice(0, 4).map((product) => (
                              <div
                                key={product.id}
                                className="group relative overflow-hidden rounded-lg border border-border/50 hover:border-primary/50 transition-all cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `/marketplace/tienda/${store.slug}`;
                                }}
                              >
                                <div className="relative aspect-square overflow-hidden bg-muted/50">
                                  {product.image || product.images?.[0] ? (
                                    <img
                                      src={product.image || product.images?.[0]}
                                      alt={product.name}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                      <Package className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                  )}
                                  {product.stock === 0 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                      <Badge variant="destructive" className="text-xs">
                                        Agotado
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                <div className="p-2 space-y-1">
                                  <h4 className="text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs font-bold text-primary">
                                    {formatPrice(Number(product.sellPrice))}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {store.productsCount && store.productsCount > 4 && (
                            <Link
                              href={`/marketplace/tienda/${store.slug}`}
                              className="block text-center text-sm text-primary hover:underline font-medium"
                            >
                              Ver todos los productos ({store.productsCount})
                            </Link>
                          )}
                        </div>
                      )}

                      {(!store.products || store.products.length === 0) && (
                        <div className="border-t pt-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            No hay productos disponibles
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Tiendazo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

