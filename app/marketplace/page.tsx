"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, Search, MapPin, Star } from "lucide-react";
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

export default function MarketplacePage() {
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      const data = await marketplaceService.getPublicStores();
      setStores(data);
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

