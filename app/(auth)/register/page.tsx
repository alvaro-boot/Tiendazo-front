"use client";

import { RegisterForm } from "@/components/auth/register-form";
import { useAuthContext } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const { isAdmin, isAuthenticated, loading } = useAuthContext();

  // Mostrar loading mientras se carga el contexto
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  // Si está autenticado, mostrar mensaje de error
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Acceso Denegado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Ya tienes una cuenta registrada. Solo puedes registrar
                administradores desde aquí.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ir al Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Permitir acceso solo si no está autenticado (registro inicial de administrador)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-balance mb-2">Tiendazo</h1>
          <p className="text-muted-foreground">
            Registro de Administrador - Configura tu cuenta y tienda
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
