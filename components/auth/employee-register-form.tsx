"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
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

export function EmployeeRegisterForm() {
  const router = useRouter();
  const { register, isAdmin, user } = useAuthContext();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Solo permitir si es admin
  if (!isAdmin) {
    return null;
  }

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

    setLoading(true);

    try {
      console.log("🔍 Registrando nuevo empleado...");

      // Obtener el storeId del usuario admin actual
      const storeId = user?.storeId || user?.store?.id;
      
      if (!storeId) {
        setError("No se pudo obtener la tienda del administrador");
        return;
      }

      console.log("📤 Datos del empleado a registrar:", {
        username,
        fullName,
        email,
        role: "EMPLOYEE",
        storeId,
        password: "***",
      });

      const result = await register({
        username,
        fullName,
        email,
        password,
        role: "EMPLOYEE", // Solo empleados
        storeId: storeId, // Asignar la tienda del admin
      });

      console.log("✅ Empleado registrado exitosamente con storeId:", result.storeId || result.store?.id);

      console.log("✅ Empleado registrado exitosamente:", result);

      // Limpiar formulario
      setUsername("");
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Mostrar mensaje de éxito
      alert("Empleado registrado exitosamente");
    } catch (err: any) {
      console.error("❌ Error registrando empleado:", err);
      setError(err.message || "Error al registrar empleado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Registrar Nuevo Empleado
        </CardTitle>
        <CardDescription>
          Crea una cuenta para un nuevo empleado
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="empleado1"
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
                placeholder="Nombre del empleado"
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
              placeholder="empleado@tienda.com"
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
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrando Empleado..." : "Registrar Empleado"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
