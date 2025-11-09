"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Store, ShoppingCart, Search, MapPin, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { marketplaceService, storeThemeService, StoreTheme } from "@/lib/services";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import {
  FeaturedProductsSection,
  CategoriesSection,
  ReviewsSection,
  BlogSection,
  ContactSection,
} from "@/components/store-sections";
import { StoreCart } from "@/components/store-sections/store-cart";

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
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Copia de todos los productos
  const [theme, setTheme] = useState<StoreTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      loadStore();
      loadProducts();
    }
  }, [slug]);

  const loadStore = async () => {
    try {
      const data = await marketplaceService.getStoreBySlug(slug);
      
      // Limpiar y validar datos de la tienda
      const cleanName = data.name?.trim() || "";
      const cleanDescription = data.description?.trim() || "";
      
      // Validar que el nombre no sea placeholder o basura
      const isValidName = cleanName && 
        cleanName.length > 2 && 
        !cleanName.toLowerCase().includes('pendejo') &&
        !cleanName.toLowerCase().includes('test') &&
        !cleanName.toLowerCase().includes('placeholder') &&
        !cleanName.toLowerCase().includes('hola pendejo');
      
      const isValidDescription = cleanDescription && 
        cleanDescription.length > 10 && 
        !cleanDescription.includes('<') && 
        !cleanDescription.toLowerCase().includes('pendejo') &&
        !cleanDescription.toLowerCase().includes('hola pendejo');
      
      const cleanData: StoreInfo = {
        ...data,
        name: isValidName ? cleanName : "Mi Tienda",
        description: isValidDescription ? cleanDescription : "",
        address: data.address?.trim() || "",
        phone: data.phone?.trim() || "",
        email: data.email?.trim() || "",
        logo: data.logo?.trim() || "",
        banner: data.banner?.trim() || "",
      };
      
      console.log("🏪 Tienda cargada:", cleanData);
      setStore(cleanData);
      
      // Cargar tema de la tienda usando el método público
      try {
        const themeData = await marketplaceService.getStoreTheme(slug);
        setTheme(themeData);
        console.log("✅ Tema cargado:", themeData);
      } catch (error) {
        // Si no hay tema, usar valores por defecto
        console.log("⚠️ No se encontró tema personalizado, usando valores por defecto", error);
      }
    } catch (error) {
      console.error("Error cargando tienda:", error);
    } finally {
      setLoading(false);
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
      setAllProducts(products); // Guardar copia de todos los productos
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
    if (!store) {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto. Tienda no encontrada.",
        variant: "destructive",
      });
      return;
    }

    if (product.stock === 0) {
      toast({
        title: "Producto agotado",
        description: "Este producto no está disponible en este momento.",
        variant: "destructive",
      });
      return;
    }

    addItem(
      store.slug,
      product.id,
      product.name,
      Number(product.sellPrice),
      store.id,
      product.image || product.images?.[0],
      1
    );

    toast({
      title: "Producto agregado",
      description: `${product.name} se agregó al carrito.`,
      duration: 2000,
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

  // Título de la página dinámico
  useEffect(() => {
    if (store) {
      document.title = `${store.name}${store.description && store.description.length > 30 ? ' - ' + store.description.substring(0, 30) + '...' : ''}`;
    }
  }, [store]);

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando tienda...</p>
      </div>
    );
  }

  // Aplicar estilos del tema
  const template = theme?.template || "MODERN";
  const primaryColor = theme?.primaryColor || (template === "ELEGANT" ? "#1a1a1a" : template === "MINIMALIST" ? "#000000" : "#3B82F6");
  const secondaryColor = theme?.secondaryColor || (template === "ELEGANT" ? "#8B7355" : template === "MINIMALIST" ? "#666666" : "#8B5CF6");
  const accentColor = theme?.accentColor || (template === "ELEGANT" ? "#D4AF37" : template === "MINIMALIST" ? "#000000" : "#10B981");
  const backgroundColor = theme?.backgroundColor || (template === "ELEGANT" ? "#FAFAFA" : "#FFFFFF");
  const textColor = theme?.textColor || (template === "ELEGANT" ? "#2C2C2C" : template === "MINIMALIST" ? "#000000" : "#1F2937");
  const fontFamily = theme?.fontFamily || (template === "ELEGANT" ? "Georgia, serif" : template === "MINIMALIST" ? "Helvetica, Arial, sans-serif" : "Inter, sans-serif");

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        fontFamily: fontFamily,
      }}
    >
      <style jsx global>{`
        :root {
          --store-primary: ${primaryColor};
          --store-secondary: ${secondaryColor};
          --store-accent: ${accentColor};
          --store-bg: ${backgroundColor};
          --store-text: ${textColor};
        }
        
        /* Estilos según el template */
        ${template === 'MODERN' ? `
          .store-header {
            background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%) !important;
            color: white !important;
          }
        ` : template === 'MINIMALIST' ? `
          .store-header {
            border-bottom: 1px solid #e5e5e5 !important;
            background: ${backgroundColor} !important;
          }
        ` : template === 'ELEGANT' ? `
          .store-header {
            background: ${primaryColor} !important;
            color: white !important;
            border-bottom: 4px solid ${accentColor} !important;
          }
        ` : ''}
      `}</style>
      {/* Header Personalizado de la Tienda */}
      <header 
        className={`store-header sticky top-0 z-50 shadow-md ${
          template === 'MODERN' ? '' : 
          template === 'MINIMALIST' ? 'border-b' : 
          ''
        }`}
        style={{
          background: template === 'MODERN' ? `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` :
                        template === 'MINIMALIST' ? backgroundColor :
                        primaryColor,
          borderBottomColor: template === 'ELEGANT' ? accentColor : undefined,
          borderBottomWidth: template === 'ELEGANT' ? '4px' : undefined,
          color: template === 'MODERN' || template === 'ELEGANT' ? 'white' : textColor,
        }}
      >
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo y Nombre de la Tienda */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div 
                  className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl"
                  style={{
                    background: template === 'MODERN' ? 'rgba(255,255,255,0.2)' :
                                template === 'MINIMALIST' ? primaryColor :
                                'rgba(255,255,255,0.2)',
                  }}
                >
                  <Store className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              )}
              <span 
                className="text-base sm:text-lg lg:text-xl font-bold"
                style={{
                  color: template === 'MODERN' || template === 'ELEGANT' ? 'white' : textColor,
                }}
              >
                {store.name}
              </span>
            </div>
            
            {/* Navegación de la Tienda */}
            <nav className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
              <Link href={`/marketplace/tienda/${slug}`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                  style={{
                    color: template === 'MODERN' || template === 'ELEGANT' ? 'white' : textColor,
                  }}
                >
                  Inicio
                </Button>
              </Link>
              <Link href={`/marketplace/tienda/${slug}#productos`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm hidden sm:inline-flex"
                  style={{
                    color: template === 'MODERN' || template === 'ELEGANT' ? 'white' : textColor,
                  }}
                >
                  Productos
                </Button>
              </Link>
              <Link href={`/marketplace/tienda/${slug}#contacto`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm hidden md:inline-flex"
                  style={{
                    color: template === 'MODERN' || template === 'ELEGANT' ? 'white' : textColor,
                  }}
                >
                  Contacto
                </Button>
              </Link>
              <StoreCart
                storeSlug={slug}
                theme={{
                  primaryColor,
                  secondaryColor,
                  accentColor,
                  backgroundColor,
                  textColor,
                  template,
                }}
                formatPrice={formatPrice}
              />
            </nav>
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
            onError={(e) => {
              // Si el banner falla, ocultar el banner
              e.currentTarget.style.display = 'none';
            }}
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
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 px-2 sm:px-0">{store.name}</h1>
                  {store.description && store.description.trim() && store.description.length > 10 && (
                    <p className="text-sm sm:text-base text-white/90 max-w-2xl px-2 sm:px-0 line-clamp-2">{store.description}</p>
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
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{store.name}</h1>
              {store.description && store.description.trim() && store.description.length > 10 && (
                <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">{store.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Secciones dinámicas según configuración del tema */}
      {theme?.showFeatured && (
        <FeaturedProductsSection
          products={allProducts}
          theme={{
            primaryColor,
            secondaryColor,
            accentColor,
            backgroundColor,
            textColor,
            template,
          }}
          onAddToCart={addToCart}
          formatPrice={formatPrice}
          config={(() => {
            try {
              if (theme.layoutConfig) {
                const parsed = typeof theme.layoutConfig === 'string' 
                  ? JSON.parse(theme.layoutConfig) 
                  : theme.layoutConfig;
                return parsed?.featured;
              }
            } catch (e) {
              console.error('Error parsing featured config:', e);
            }
            return undefined;
          })()}
        />
      )}

      {theme?.showCategories && (
        <CategoriesSection
          products={allProducts}
          theme={{
            primaryColor,
            secondaryColor,
            accentColor,
            backgroundColor,
            textColor,
            template,
          }}
          onCategoryClick={(categoryName) => {
            const filtered = allProducts.filter(p => p.category?.name === categoryName);
            setProducts(filtered);
            setTimeout(() => {
              document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          config={(() => {
            try {
              if (theme.layoutConfig) {
                const parsed = typeof theme.layoutConfig === 'string' 
                  ? JSON.parse(theme.layoutConfig) 
                  : theme.layoutConfig;
                return parsed?.categories;
              }
            } catch (e) {
              console.error('Error parsing categories config:', e);
            }
            return undefined;
          })()}
        />
      )}

      {theme?.showReviews && (
        <ReviewsSection
          theme={{
            primaryColor,
            secondaryColor,
            accentColor,
            backgroundColor,
            textColor,
            template,
          }}
          config={(() => {
            try {
              if (theme.layoutConfig) {
                const parsed = typeof theme.layoutConfig === 'string' 
                  ? JSON.parse(theme.layoutConfig) 
                  : theme.layoutConfig;
                return parsed?.reviews;
              }
            } catch (e) {
              console.error('Error parsing reviews config:', e);
            }
            return undefined;
          })()}
        />
      )}

      {theme?.showBlog && (
        <BlogSection
          theme={{
            primaryColor,
            secondaryColor,
            accentColor,
            backgroundColor,
            textColor,
            template,
          }}
          config={(() => {
            try {
              if (theme.layoutConfig) {
                const parsed = typeof theme.layoutConfig === 'string' 
                  ? JSON.parse(theme.layoutConfig) 
                  : theme.layoutConfig;
                return parsed?.blog;
              }
            } catch (e) {
              console.error('Error parsing blog config:', e);
            }
            return undefined;
          })()}
        />
      )}

      {/* Products Section */}
      <section id="productos" className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
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
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: primaryColor }}
                    >
                      {formatPrice(Number(product.sellPrice))}
                    </span>
                  </div>
                  <Button
                    className="w-full h-10 sm:h-11 text-sm sm:text-base"
                    style={{
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                    }}
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

      {/* Sección de Contacto */}
      {theme?.showContact && (
        <ContactSection
          store={store}
          theme={{
            primaryColor,
            secondaryColor,
            accentColor,
            backgroundColor,
            textColor,
            template,
          }}
          config={(() => {
            try {
              if (theme.layoutConfig) {
                const parsed = typeof theme.layoutConfig === 'string' 
                  ? JSON.parse(theme.layoutConfig) 
                  : theme.layoutConfig;
                return parsed?.contact;
              }
            } catch (e) {
              console.error('Error parsing contact config:', e);
            }
            return undefined;
          })()}
        />
      )}
    </div>
  );
}

