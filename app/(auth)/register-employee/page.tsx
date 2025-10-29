"use client";

import { EmployeeRegisterForm } from "@/components/auth/employee-register-form";
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

export default function EmployeeRegisterPage() {
  const { isAdmin, isAuthenticated, loading } = useAuthContext();

  // Mostrar loading mientras se carga el contexto
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Acceso Requerido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Debes iniciar sesión para acceder a esta página.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Link href="/login">
                <Button className="w-full">Ir al Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si no es admin, mostrar mensaje de error
  if (!isAdmin) {
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
                Solo los administradores pueden registrar empleados.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si es admin, mostrar el formulario de registro de empleados
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-balance mb-2">Tiendazo</h1>
          <p className="text-muted-foreground">Registrar Nuevo Empleado</p>
        </div>
        <EmployeeRegisterForm />
      </div>
    </div>
  );
}
