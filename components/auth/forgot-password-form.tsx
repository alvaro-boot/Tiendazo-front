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
import { authService } from "@/lib/services";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      console.log("🔍 Solicitando recuperación de contraseña para:", email);
      const result = await authService.forgotPassword(email);
      console.log("✅ Respuesta de recuperación:", result);

      setSuccess(true);
      // En desarrollo, mostrar el token si está disponible
      if (result.resetUrl) {
        setResetUrl(result.resetUrl);
      }
    } catch (err: any) {
      console.error("❌ Error en recuperación:", err);
      setError(err.response?.data?.message || err.message || "Error al solicitar recuperación de contraseña");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-center">Solicitud Enviada</CardTitle>
          <CardDescription className="text-center">
            Si el email existe en nuestro sistema, recibirás un enlace de recuperación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resetUrl && process.env.NODE_ENV === "development" && (
            <div className="p-4 bg-muted rounded-xl border border-border/50">
              <p className="text-sm font-medium mb-2">Enlace de recuperación (solo desarrollo):</p>
              <a
                href={resetUrl}
                className="text-sm text-primary hover:underline break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {resetUrl}
              </a>
            </div>
          )}
          <div className="text-center text-sm text-muted-foreground">
            <p>Por favor, revisa tu correo electrónico.</p>
            <p className="mt-2">Si no recibes el email, verifica tu carpeta de spam.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Volver al Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
          </Button>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              ¿Recordaste tu contraseña?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

