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
import { Info } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔍 Intentando login con:", { username, password: "***" });
      const result = await login({ username, password });
      console.log("✅ Login exitoso:", result);

      // Redirigir al dashboard después del login exitoso
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("❌ Error en login:", err);
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  function fillTestCredentials(type: "admin" | "employee") {
    if (type === "admin") {
      setUsername("admin");
      setPassword("admin123");
    } else {
      setUsername("employee");
      setPassword("employee123");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-3">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-primary">
                  Credenciales de Prueba
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">Administrador:</p>
                      <p className="text-muted-foreground">admin / admin123</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fillTestCredentials("admin")}
                      className="text-xs"
                    >
                      Usar
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">Empleado:</p>
                      <p className="text-muted-foreground">
                        employee / employee123
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fillTestCredentials("employee")}
                      className="text-xs"
                    >
                      Usar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive rounded-md">
              {error}
            </div>
          )}
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
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
