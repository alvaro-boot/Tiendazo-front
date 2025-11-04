"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/lib/auth-context";
import { storeService, StoreData } from "@/lib/services";
import { config } from "@/lib/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Store, User, ShoppingBag, Globe, Settings as SettingsIcon } from "lucide-react";

interface StoreFormData {
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  currency: string;
  type: "INTERNAL" | "PUBLIC";
  isPublic: boolean;
  slug?: string;
}

export default function SettingsPage() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [storeData, setStoreData] = useState<any>(null);

  const storeForm = useForm<StoreFormData>({
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      currency: config.DEFAULT_CURRENCY,
      type: "INTERNAL",
      isPublic: false,
      slug: "",
    },
  });

  // Cargar datos de la tienda
  useEffect(() => {
    if (user?.storeId) {
      loadStoreData();
    }
  }, [user?.storeId]);

  const loadStoreData = async () => {
    try {
      const store = await storeService.getStoreById(user!.storeId!);
      setStoreData(store);
      storeForm.reset({
        name: store.name || "",
        description: store.description || "",
        address: store.address || "",
        phone: store.phone || "",
        email: store.email || "",
        currency: store.currency || config.DEFAULT_CURRENCY,
        type: (store as any).type || "INTERNAL",
        isPublic: (store as any).isPublic || false,
        slug: (store as any).slug || "",
      });
    } catch (err: any) {
      console.error("Error cargando datos de tienda:", err);
      setError("Error al cargar los datos de la tienda");
    }
  };

  const onStoreSubmit = async (data: StoreFormData) => {
    if (!user?.storeId) {
      setError("No se encontró la tienda asociada");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updateData: Partial<StoreData> = {
        name: data.name,
        description: data.description,
        address: data.address,
        phone: data.phone,
        email: data.email,
        currency: data.currency,
        type: data.type,
        isPublic: data.type === "PUBLIC" ? data.isPublic : false,
        slug: data.type === "PUBLIC" && data.slug ? data.slug : undefined,
      };

      await storeService.updateStore(user.storeId, updateData);
      setSuccess("Configuración de tienda actualizada exitosamente");
      
      // Recargar datos
      await loadStoreData();
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error actualizando tienda:", err);
      setError(err.response?.data?.message || err.message || "Error al actualizar la tienda");
    } finally {
      setLoading(false);
    }
  };

  const storeType = storeForm.watch("type");
  const isPublic = storeForm.watch("isPublic");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Configuración
        </h1>
        <p className="text-muted-foreground mt-2">
          Administra la configuración de tu tienda y perfil
        </p>
      </div>

      {error && (
        <div className="p-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 text-sm text-primary-foreground bg-primary/10 border border-primary rounded-lg">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Información de la Tienda
            </CardTitle>
            <CardDescription>Actualiza los datos de tu negocio</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={storeForm.handleSubmit(onStoreSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="store-name">Nombre de la Tienda *</Label>
                <Input
                  id="store-name"
                  {...storeForm.register("name", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-description">Descripción</Label>
                <Textarea
                  id="store-description"
                  placeholder="Descripción de tu tienda..."
                  {...storeForm.register("description")}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-address">Dirección *</Label>
                <Input
                  id="store-address"
                  {...storeForm.register("address", { required: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-phone">Teléfono</Label>
                  <Input
                    id="store-phone"
                    type="tel"
                    placeholder="+57 300 123 4567"
                    {...storeForm.register("phone")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-email">Email</Label>
                  <Input
                    id="store-email"
                    type="email"
                    placeholder="tienda@email.com"
                    {...storeForm.register("email")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-currency">Moneda</Label>
                <select
                  id="store-currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...storeForm.register("currency")}
                >
                  <option value="COP">Peso Colombiano (COP)</option>
                  <option value="USD">Dólar Americano (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="MXN">Peso Mexicano (MXN)</option>
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Configuración de Marketplace
            </CardTitle>
            <CardDescription>
              Activa o desactiva el acceso al marketplace público
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={storeForm.handleSubmit(onStoreSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="store-type">Tipo de Tienda</Label>
                <select
                  id="store-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...storeForm.register("type")}
                  onChange={(e) => {
                    const newType = e.target.value as "INTERNAL" | "PUBLIC";
                    storeForm.setValue("type", newType);
                    if (newType === "INTERNAL") {
                      storeForm.setValue("isPublic", false);
                    }
                  }}
                >
                  <option value="INTERNAL">POS - Solo ventas internas</option>
                  <option value="PUBLIC">Marketplace - Venta online pública</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  {storeType === "INTERNAL"
                    ? "Solo para ventas en el punto de venta físico"
                    : "Tu tienda aparecerá en el marketplace público y podrás vender online"}
                </p>
              </div>

              {storeType === "PUBLIC" && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is-public"
                        checked={isPublic}
                        onChange={(e) => storeForm.setValue("isPublic", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="is-public" className="cursor-pointer">
                        Hacer visible públicamente en el marketplace
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Si está activado, tu tienda aparecerá en la lista de tiendas públicas del marketplace
                    </p>
                  </div>

                  {isPublic && (
                    <div className="space-y-2">
                      <Label htmlFor="store-slug">URL de la Tienda (Slug)</Label>
                      <Input
                        id="store-slug"
                        type="text"
                        placeholder="mi-tienda"
                        {...storeForm.register("slug")}
                        onChange={(e) => {
                          // Convertir a slug: solo letras, números y guiones
                          const slug = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-")
                            .replace(/-+/g, "-")
                            .replace(/^-|-$/g, "");
                          storeForm.setValue("slug", slug);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        URL amigable para tu tienda. Si no lo llenas, se generará automáticamente.
                        <br />
                        Ejemplo: marketplace.com/tienda/{storeForm.watch("slug") || "mi-tienda"}
                      </p>
                      {storeForm.watch("slug") && (
                        <div className="mt-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="h-4 w-4 text-primary" />
                            <span className="font-medium">URL de tu tienda:</span>
                            <code className="text-xs bg-background px-2 py-1 rounded">
                              /marketplace/tienda/{storeForm.watch("slug")}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Configuración de Marketplace"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
