"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthContext } from "@/lib/auth-context";
import { User, UserPlus } from "lucide-react";

export function ClientRegisterForm() {
  const router = useRouter();
  const { register } = useAuthContext();

  // Datos del cliente
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!username.trim()) {
      setError("El usuario es requerido");
      return;
    }

    if (!fullName.trim()) {
      setError("El nombre completo es requerido");
      return;
    }

    if (!email.trim()) {
      setError("El email es requerido");
      return;
    }

    setLoading(true);

    try {
      console.log("🔍 Iniciando registro de cliente...");

      // Registrar el cliente con rol CLIENT
      console.log("👤 Registrando cliente...");
      console.log("📤 Datos del cliente:", {
        username,
        fullName,
        email,
        phone,
        role: "CLIENT",
        password: "***",
      });

      const userResult = await register({
        username,
        fullName,
        email,
        phone: phone || undefined,
        password,
        role: "CLIENT", // Rol de cliente
        // No requiere storeId para clientes del marketplace
      });
      console.log("✅ Cliente registrado:", userResult);

      // Redirigir al login con mensaje de éxito
      router.push("/login?registered=true");
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
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="space-y-2 pb-6 sm:pb-8 px-0">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-xl shadow-primary/30">
              <UserPlus className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Crea tu cuenta
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base px-2">
            Regístrate para comenzar a comprar en el marketplace
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Card className="border border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                  </div>
                  <p className="text-sm text-destructive-foreground font-medium">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-2 sm:space-y-2.5">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground/90">
                    Usuario <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Escribe tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-11 sm:h-12 rounded-lg sm:rounded-xl border-2 border-border/50 bg-background/50 focus:border-primary focus:bg-background transition-all text-base"
                  />
                </div>
                
                <div className="space-y-2 sm:space-y-2.5">
                  <Label htmlFor="fullName" className="text-sm font-medium text-foreground/90">
                    Nombre Completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11 sm:h-12 rounded-lg sm:rounded-xl border-2 border-border/50 bg-background/50 focus:border-primary focus:bg-background transition-all text-base"
                  />
                </div>
              </div>

              <div className="space-y-2 sm:space-y-2.5">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/90">
                  Correo Electrónico <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 sm:h-12 rounded-lg sm:rounded-xl border-2 border-border/50 bg-background/50 focus:border-primary focus:bg-background transition-all text-base"
                />
              </div>

              <div className="space-y-2 sm:space-y-2.5">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground/90">
                  Teléfono <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+57 300 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 sm:h-12 rounded-lg sm:rounded-xl border-2 border-border/50 bg-background/50 focus:border-primary focus:bg-background transition-all text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-2 sm:space-y-2.5">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground/90">
                    Contraseña <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11 sm:h-12 rounded-lg sm:rounded-xl border-2 border-border/50 bg-background/50 focus:border-primary focus:bg-background transition-all text-base"
                  />
                </div>
                
                <div className="space-y-2 sm:space-y-2.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/90">
                    Confirmar Contraseña <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11 sm:h-12 rounded-lg sm:rounded-xl border-2 border-border/50 bg-background/50 focus:border-primary focus:bg-background transition-all text-base"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 sm:space-y-4">
            <Button 
              type="submit" 
              className="w-full h-12 sm:h-14 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold bg-gradient-to-r from-primary via-primary/95 to-primary shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2 sm:gap-3">
                  <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">Creando tu cuenta...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Crear Cuenta</span>
                </span>
              )}
            </Button>

            <div className="pt-3 sm:pt-4 space-y-2 sm:space-y-3 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground px-2">
                ¿Ya tienes una cuenta?{" "}
                <Link 
                  href="/login" 
                  className="font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-2 sm:underline-offset-4"
                >
                  Inicia sesión aquí
                </Link>
              </p>
              <p className="text-xs text-muted-foreground/80 px-2">
                ¿Eres dueño de una tienda?{" "}
                <Link 
                  href="/register" 
                  className="font-medium text-primary hover:text-primary/80 transition-colors underline underline-offset-2 sm:underline-offset-4"
                >
                  Regístrate como administrador
                </Link>
              </p>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

