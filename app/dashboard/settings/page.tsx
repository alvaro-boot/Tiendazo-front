"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/lib/auth-context";
import { storeService, storeThemeService, StoreData, StoreTheme, StoreThemeData } from "@/lib/services";
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
import { Store, User, Globe, Settings as SettingsIcon } from "lucide-react";

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
  const [themeData, setThemeData] = useState<StoreTheme | null>(null);
  const [themeLoading, setThemeLoading] = useState(false);

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

  // Cargar datos de la tienda y tema
  useEffect(() => {
    if (user?.storeId) {
      loadStoreData();
      loadThemeData();
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

  const loadThemeData = async () => {
    if (!user?.storeId) return;
    
    try {
      setThemeLoading(true);
      const theme = await storeThemeService.getTheme(user.storeId);
      setThemeData(theme);
    } catch (err: any) {
      // Si no existe tema, se creará automáticamente al guardar
      console.log("No se encontró tema para esta tienda, se creará uno nuevo");
      setThemeData(null);
    } finally {
      setThemeLoading(false);
    }
  };

  const onThemeSubmit = async (themeFormData: StoreThemeData) => {
    if (!user?.storeId) {
      setError("No se encontró la tienda asociada");
      return;
    }

    setThemeLoading(true);
    setError("");
    setSuccess("");

    try {
      let theme: StoreTheme;
      
      if (themeData) {
        // Actualizar tema existente
        theme = await storeThemeService.updateTheme(user.storeId, themeFormData);
      } else {
        // Crear nuevo tema
        theme = await storeThemeService.createTheme(user.storeId, themeFormData);
      }

      setThemeData(theme);
      setSuccess("Personalización de tema guardada exitosamente");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error guardando tema:", err);
      setError(err.response?.data?.message || err.message || "Error al guardar el tema");
    } finally {
      setThemeLoading(false);
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
        {/* Información de la Tienda */}
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
              <Globe className="h-5 w-5 text-primary" />
              Configuración del Sitio Web
            </CardTitle>
            <CardDescription>
              Activa o desactiva la página web pública generada por el sistema
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
                  <option value="PUBLIC">Sitio web público</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  {storeType === "INTERNAL"
                    ? "Solo para ventas en el punto de venta físico"
                    : "Tu tienda tendrá un sitio web público para vender en línea"}
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
                        Hacer visible públicamente el sitio web de la tienda
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Si está activado, el sitio web generado será accesible para tus clientes.
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
                        Ejemplo: tiendaonline.com/{storeForm.watch("slug") || "mi-tienda"}
                      </p>
                      {storeForm.watch("slug") && (
                        <div className="mt-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="h-4 w-4 text-primary" />
                            <span className="font-medium">URL de tu tienda:</span>
                            <code className="text-xs bg-background px-2 py-1 rounded">
                              /tiendas/{storeForm.watch("slug")}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Guardando..." : "Guardar configuración del sitio web"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Personalización de Tema - Solo para tiendas PUBLIC */}
      {storeType === "PUBLIC" && (
        <Card className="border-2 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              Personalización de Tema
            </CardTitle>
            <CardDescription>
              Personaliza el diseño y apariencia de tu página web
            </CardDescription>
          </CardHeader>
          <CardContent>
            {themeLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando tema...</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const themeData: StoreThemeData = {
                    template: formData.get("template") as "MODERN" | "MINIMALIST" | "ELEGANT",
                    primaryColor: formData.get("primaryColor") as string || undefined,
                    secondaryColor: formData.get("secondaryColor") as string || undefined,
                    accentColor: formData.get("accentColor") as string || undefined,
                    backgroundColor: formData.get("backgroundColor") as string || undefined,
                    textColor: formData.get("textColor") as string || undefined,
                    fontFamily: formData.get("fontFamily") as string || undefined,
                    headingFont: formData.get("headingFont") as string || undefined,
                    bodyFont: formData.get("bodyFont") as string || undefined,
                    showReviews: formData.get("showReviews") === "on",
                    showFeatured: formData.get("showFeatured") === "on",
                    showCategories: formData.get("showCategories") === "on",
                    showContact: formData.get("showContact") === "on",
                    showBlog: formData.get("showBlog") === "on",
                    googleAnalyticsId: formData.get("googleAnalyticsId") as string || undefined,
                    facebookPixelId: formData.get("facebookPixelId") as string || undefined,
                    mailchimpListId: formData.get("mailchimpListId") as string || undefined,
                  };
                  onThemeSubmit(themeData);
                }}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="template">Plantilla</Label>
                    <select
                      id="template"
                      name="template"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      defaultValue={themeData?.template || "MODERN"}
                    >
                      <option value="MODERN">Moderno</option>
                      <option value="MINIMALIST">Minimalista</option>
                      <option value="ELEGANT">Elegante</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Tipografía</Label>
                    <select
                      id="fontFamily"
                      name="fontFamily"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      defaultValue={themeData?.fontFamily || "Inter"}
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Open Sans">Open Sans</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Color Primario</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="primaryColorPicker"
                        className="h-10 w-20 rounded border"
                        defaultValue={themeData?.primaryColor || "#3B82F6"}
                        onChange={(e) => {
                          const input = document.getElementById("primaryColor") as HTMLInputElement;
                          if (input) input.value = e.target.value;
                        }}
                      />
                      <Input
                        id="primaryColor"
                        name="primaryColor"
                        type="text"
                        placeholder="#3B82F6"
                        defaultValue={themeData?.primaryColor || "#3B82F6"}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Color Secundario</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="secondaryColorPicker"
                        className="h-10 w-20 rounded border"
                        defaultValue={themeData?.secondaryColor || "#8B5CF6"}
                        onChange={(e) => {
                          const input = document.getElementById("secondaryColor") as HTMLInputElement;
                          if (input) input.value = e.target.value;
                        }}
                      />
                      <Input
                        id="secondaryColor"
                        name="secondaryColor"
                        type="text"
                        placeholder="#8B5CF6"
                        defaultValue={themeData?.secondaryColor || "#8B5CF6"}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Color de Acento</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="accentColorPicker"
                        className="h-10 w-20 rounded border"
                        defaultValue={themeData?.accentColor || "#10B981"}
                        onChange={(e) => {
                          const input = document.getElementById("accentColor") as HTMLInputElement;
                          if (input) input.value = e.target.value;
                        }}
                      />
                      <Input
                        id="accentColor"
                        name="accentColor"
                        type="text"
                        placeholder="#10B981"
                        defaultValue={themeData?.accentColor || "#10B981"}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Color de Fondo</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        id="backgroundColorPicker"
                        className="h-10 w-20 rounded border"
                        defaultValue={themeData?.backgroundColor || "#FFFFFF"}
                        onChange={(e) => {
                          const input = document.getElementById("backgroundColor") as HTMLInputElement;
                          if (input) input.value = e.target.value;
                        }}
                      />
                      <Input
                        id="backgroundColor"
                        name="backgroundColor"
                        type="text"
                        placeholder="#FFFFFF"
                        defaultValue={themeData?.backgroundColor || "#FFFFFF"}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <Label className="text-base font-semibold">Secciones de la Página</Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="show-reviews"
                        name="showReviews"
                        defaultChecked={themeData?.showReviews ?? true}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="show-reviews" className="cursor-pointer">Mostrar Reseñas</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="show-featured"
                        name="showFeatured"
                        defaultChecked={themeData?.showFeatured ?? true}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="show-featured" className="cursor-pointer">Productos Destacados</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="show-categories"
                        name="showCategories"
                        defaultChecked={themeData?.showCategories ?? true}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="show-categories" className="cursor-pointer">Categorías</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="show-contact"
                        name="showContact"
                        defaultChecked={themeData?.showContact ?? true}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="show-contact" className="cursor-pointer">Información de Contacto</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="show-blog"
                        name="showBlog"
                        defaultChecked={themeData?.showBlog ?? false}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="show-blog" className="cursor-pointer">Blog/Noticias</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <Label className="text-base font-semibold">Integraciones de Marketing</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                      <Input
                        id="googleAnalyticsId"
                        name="googleAnalyticsId"
                        type="text"
                        placeholder="UA-XXXXXXXXX-X"
                        defaultValue={themeData?.googleAnalyticsId || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                      <Input
                        id="facebookPixelId"
                        name="facebookPixelId"
                        type="text"
                        placeholder="123456789"
                        defaultValue={themeData?.facebookPixelId || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mailchimpListId">Mailchimp List ID</Label>
                      <Input
                        id="mailchimpListId"
                        name="mailchimpListId"
                        type="text"
                        placeholder="abc123"
                        defaultValue={themeData?.mailchimpListId || ""}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button type="submit" className="w-full" disabled={themeLoading}>
                    {themeLoading ? "Guardando..." : "Guardar Personalización"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
