"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthContext } from "@/lib/auth-context";
import { storeService } from "@/lib/services";
import { config } from "@/lib/config";
import { Building2, User } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const { register, isAuthenticated, isAdmin } = useAuthContext();

  // Datos del usuario
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Datos de la tienda
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeType, setStoreType] = useState<"INTERNAL" | "PUBLIC">("INTERNAL");
  const [isPublic, setIsPublic] = useState(false);
  const [storeSlug, setStoreSlug] = useState("");

  // Configuración de moneda
  const [storeCurrency, setStoreCurrency] = useState(config.DEFAULT_CURRENCY);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Solo permitir registro si no hay usuario autenticado O si es admin
  const canRegister = !isAuthenticated || isAdmin;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validaciones básicas
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Validar datos de la tienda
    if (!storeName.trim()) {
      setError("El nombre de la tienda es requerido");
      return;
    }

    if (!storeAddress.trim()) {
      setError("La dirección de la tienda es requerida");
      return;
    }

    setLoading(true);

    try {
      console.log("🔍 Iniciando registro de administrador con tienda...");

      // 1. Crear la tienda primero (no requiere token)
      console.log("🏪 Creando tienda...");
      console.log("📤 Datos de la tienda:", {
        name: storeName,
        description: storeDescription,
        address: storeAddress,
        phone: storePhone,
        email: storeEmail,
      });

      const storeResult = await storeService.createStore({
        name: storeName,
        description: storeDescription,
        address: storeAddress,
        phone: storePhone,
        email: storeEmail,
        currency: storeCurrency,
        type: storeType,
        isPublic: storeType === "PUBLIC" ? isPublic : false,
        slug: storeType === "PUBLIC" && storeSlug ? storeSlug : undefined,
      });
      console.log("✅ Tienda creada exitosamente:", storeResult);

      // 2. Registrar el usuario administrador con el ID de la tienda
      console.log("👤 Registrando usuario administrador...");
      console.log("📤 Datos del usuario:", {
        username,
        fullName,
        email,
        role: "ADMIN",
        password: "***",
        storeId: storeResult.id, // Agregar el ID de la tienda
      });

      const userResult = await register({
        username,
        fullName,
        email,
        password,
        role: "ADMIN", // Solo administradores
        storeId: storeResult.id, // Asociar con la tienda creada
      });
      console.log("✅ Usuario administrador creado:", userResult);

      // 3. Redirigir al dashboard
      console.log("🎉 Registro completo exitoso, redirigiendo al dashboard...");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("❌ Error en registro:", err);
      console.error("❌ Detalles del error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        method: err.config?.method,
      });

      // Mostrar error más específico
      let errorMessage = "Error al registrarse";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Registro de Administrador
        </CardTitle>
        <CardDescription>
          Completa los datos de tu cuenta y tu tienda para comenzar
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive rounded-md">
              {error}
            </div>
          )}

          {/* Sección de datos del usuario */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Datos del Usuario
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Sección de datos de la tienda */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Datos de la Tienda
            </h3>

            <div className="space-y-2">
              <Label htmlFor="storeName">Nombre de la Tienda</Label>
              <Input
                id="storeName"
                type="text"
                placeholder="Mi Tienda"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeDescription">Descripción</Label>
              <Textarea
                id="storeDescription"
                placeholder="Descripción de la tienda..."
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeAddress">Dirección</Label>
              <Input
                id="storeAddress"
                type="text"
                placeholder="Calle 123, Ciudad"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storePhone">Teléfono</Label>
                <Input
                  id="storePhone"
                  type="tel"
                  placeholder="+57 300 123 4567"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeEmail">Email de la Tienda</Label>
                <Input
                  id="storeEmail"
                  type="email"
                  placeholder="tienda@email.com"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Configuración de Marketplace */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-md font-medium text-muted-foreground">
                Configuración de Marketplace
              </h4>

              <div className="space-y-2">
                <Label htmlFor="storeType">Tipo de Tienda</Label>
                <select
                  id="storeType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={storeType}
                  onChange={(e) => {
                    const newType = e.target.value as "INTERNAL" | "PUBLIC";
                    setStoreType(newType);
                    if (newType === "INTERNAL") {
                      setIsPublic(false);
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
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="isPublic" className="cursor-pointer">
                        Hacer visible públicamente en el marketplace
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Si está activado, tu tienda aparecerá en la lista de tiendas públicas del marketplace
                    </p>
                  </div>

                  {isPublic && (
                    <div className="space-y-2">
                      <Label htmlFor="storeSlug">URL de la Tienda (Slug)</Label>
                      <Input
                        id="storeSlug"
                        type="text"
                        placeholder="mi-tienda"
                        value={storeSlug}
                        onChange={(e) => {
                          // Convertir a slug: solo letras, números y guiones
                          const slug = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-")
                            .replace(/-+/g, "-")
                            .replace(/^-|-$/g, "");
                          setStoreSlug(slug);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        URL amigable para tu tienda. Si no lo llenas, se generará automáticamente.
                        Ejemplo: marketplace.com/tienda/{storeSlug || "mi-tienda"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Configuración de moneda */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-md font-medium text-muted-foreground">
                Configuración de Moneda
              </h4>

              <div className="space-y-2">
                <Label htmlFor="storeCurrency">Moneda</Label>
                <select
                  id="storeCurrency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={storeCurrency}
                  onChange={(e) => setStoreCurrency(e.target.value)}
                >
                  <option value="COP">Peso Colombiano (COP)</option>
                  <option value="USD">Dólar Americano (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="MXN">Peso Mexicano (MXN)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Moneda por defecto para precios y transacciones
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Creando Cuenta y Tienda..."
              : "Crear Cuenta de Administrador"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
