"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Store, ShoppingCart, Search, Filter, MapPin, Phone, Mail, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { marketplaceService } from "@/lib/services";

interface StoreInfo {
  id: number;
  name: string;
  description: string;
  slug: string;
  logo: string;
  banner: string;
  address: string;
  phone: string;
  email: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  sellPrice: number;
  image: string;
  images: string[];
  stock: number;
  slug: string;
  category: {
    id: number;
    name: string;
  };
}

export default function StorePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [cart, setCart] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    if (slug) {
      loadStore();
      loadProducts();
    }
  }, [slug]);

  const loadStore = async () => {
    try {
      const data = await marketplaceService.getStoreBySlug(slug);
      setStore(data);
    } catch (error) {
      console.error("Error cargando tienda:", error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await marketplaceService.getStoreProducts(slug, {
        search: searchTerm || undefined,
        sort: sortBy,
        page: 1,
        limit: 50,
      });
      setProducts(response.products || response);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug) {
        loadProducts();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, sortBy, slug]);

  const addToCart = (productId: number) => {
    setCart((prev) => {
      const newCart = new Map(prev);
      const currentQty = newCart.get(productId) || 0;
      newCart.set(productId, currentQty + 1);
      return newCart;
    });
  };

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

  const cartTotal = Array.from(cart.entries()).reduce((sum, [productId, qty]) => {
    const product = products.find((p) => p.id === productId);
    return sum + (product ? Number(product.sellPrice) * qty : 0);
  }, 0);

  const cartItemsCount = Array.from(cart.values()).reduce((sum, qty) => sum + qty, 0);

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando tienda...</p>
      </div>
    );
  }

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
              <Link href="/marketplace/cart">
                <Button variant="outline" size="sm" className="relative">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Carrito
                  {cartItemsCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Store Banner */}
      {store.banner && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={store.banner}
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="flex items-end gap-4">
                {store.logo && (
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="h-24 w-24 rounded-2xl object-cover border-4 border-background shadow-soft-lg"
                  />
                )}
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{store.name}</h1>
                  {store.description && (
                    <p className="text-white/90 max-w-2xl">{store.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store Info */}
      {!store.banner && (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            {store.logo && (
              <img
                src={store.logo}
                alt={store.name}
                className="h-20 w-20 rounded-xl object-cover border-2 border-border"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
              {store.description && (
                <p className="text-muted-foreground">{store.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <section className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="price_asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price_desc">Precio: Mayor a Menor</SelectItem>
              <SelectItem value="name_asc">Nombre: A-Z</SelectItem>
              <SelectItem value="name_desc">Nombre: Z-A</SelectItem>
              <SelectItem value="popular">Más populares</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group hover:shadow-soft-lg transition-all duration-200 hover:scale-[1.02] border-2 border-border/50"
              >
                <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                  <img
                    src={product.image || product.images?.[0] || "/placeholder-product.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.stock <= 3 && product.stock > 0 && (
                    <Badge className="absolute top-2 right-2 bg-amber-500">
                      Últimas {product.stock}
                    </Badge>
                  )}
                  {product.stock === 0 && (
                    <Badge className="absolute top-2 right-2 bg-destructive">
                      Agotado
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
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(Number(product.sellPrice))}
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Agregar al Carrito
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">{store.name}</h3>
              {store.description && (
                <p className="text-sm text-muted-foreground">{store.description}</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {store.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{store.address}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{store.phone}</span>
                  </div>
                )}
                {store.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{store.email}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Tiendazo</h3>
              <p className="text-sm text-muted-foreground">
                © 2024 Tiendazo. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

