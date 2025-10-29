"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/lib/auth-context";
import {
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  LogIn,
} from "lucide-react";
import Link from "next/link";

export function Dashboard() {
  const { user, isAuthenticated, isAdmin } = useAuthContext();

  // Si no está autenticado, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Sistema de Gestión de Tiendas</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Acceso Requerido</h3>
              <p className="text-muted-foreground mb-4">
                Debes iniciar sesión para acceder al dashboard
              </p>
              <Link href="/login">
                <Button>
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard para usuarios autenticados
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user?.fullName || user?.username}
        </p>
      </div>

      {/* Estadísticas básicas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Activo</div>
            <p className="text-xs text-muted-foreground">
              Sistema funcionando correctamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuario</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.username}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? "Administrador" : "Empleado"}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">Conectado a la API</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesión</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Activa</div>
            <p className="text-xs text-muted-foreground">Token válido</p>
          </CardContent>
        </Card>
      </div>

      {/* Enlaces rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Acceso Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/products">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2"
              >
                <Package className="h-6 w-6" />
                <span>Productos</span>
              </Button>
            </Link>
            <Link href="/dashboard/sales">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2"
              >
                <ShoppingCart className="h-6 w-6" />
                <span>Ventas</span>
              </Button>
            </Link>
            <Link href="/dashboard/clients">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2"
              >
                <Users className="h-6 w-6" />
                <span>Clientes</span>
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/register-employee">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col gap-2"
                >
                  <Users className="h-6 w-6" />
                  <span>Registrar Empleado</span>
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
