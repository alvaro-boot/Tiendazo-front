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
import { useCart } from "@/hooks/use-cart";

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
  const { addItem, getCartItemsCount } = useCart();

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
      console.log("🔍 Cargando productos para tienda:", slug);
      console.log("🔍 Filtros:", { searchTerm, sortBy });
      
      const response = await marketplaceService.getStoreProducts(slug, {
        search: searchTerm || undefined,
        sort: sortBy,
        page: 1,
        limit: 50,
      });
      
      console.log("✅ Respuesta del backend:", response);
      
      // El backend devuelve { products: Product[], pagination: {...} }
      const products = Array.isArray(response) ? response : (response?.products || []);
      
      console.log("📦 Productos extraídos:", products);
      console.log("📦 Cantidad de productos:", products.length);
      
      setProducts(products);
    } catch (error) {
      console.error("❌ Error cargando productos:", error);
      console.error("❌ Detalles del error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sortBy]);

  const addToCart = (product: Product) => {
    if (store) {
      addItem(
        store.slug,
        product.id,
        product.name,
        Number(product.sellPrice),
        store.id,
        product.image || product.images?.[0],
        1
      );
    }
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

  const cartItemsCount = getCartItemsCount(store?.slug || undefined);

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
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <Link href="/marketplace" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                <Store className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent hidden sm:inline">
                Tiendazo Marketplace
              </span>
              <span className="text-sm sm:hidden font-bold">Tiendazo</span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
              <Link href="/marketplace/cart">
                <Button variant="outline" size="sm" className="relative h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Carrito</span>
                  {cartItemsCount > 0 && (
                    <Badge className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-[10px] sm:text-xs">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm hidden md:inline-flex">
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              </Link>
              <Link href="/register-client">
                <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm hidden lg:inline-flex">
                  Registrarse
                </Button>
              </Link>
              <Link href="/client/orders">
                <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm hidden xl:inline-flex">
                  Mis Pedidos
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
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto px-3 sm:px-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4">
                {store.logo && (
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-xl sm:rounded-2xl object-cover border-2 sm:border-4 border-background shadow-soft-lg flex-shrink-0"
                  />
                )}
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 px-2 sm:px-0">{store.name}</h1>
                  {store.description && (
                    <p className="text-sm sm:text-base text-white/90 max-w-2xl px-2 sm:px-0">{store.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store Info */}
      {!store.banner && (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            {store.logo && (
              <img
                src={store.logo}
                alt={store.name}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border-2 border-border flex-shrink-0"
              />
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{store.name}</h1>
              {store.description && (
                <p className="text-sm sm:text-base text-muted-foreground">{store.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <section className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Filters */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 h-10 sm:h-11 rounded-lg sm:rounded-xl text-sm sm:text-base"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48 h-10 sm:h-11 rounded-lg sm:rounded-xl text-sm sm:text-base">
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
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground text-base sm:text-lg">
              {searchTerm ? "No se encontraron productos con ese criterio de búsqueda" : "No se encontraron productos"}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="h-10 sm:h-11 text-sm sm:text-base"
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                    className="w-full h-10 sm:h-11 text-sm sm:text-base"
                    onClick={() => addToCart(product)}
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
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 mt-12 sm:mt-16 lg:mt-20">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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

