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
  ShoppingBag,
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header con bienvenida */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-4 sm:p-6 md:p-8 shadow-lg">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Bienvenido de vuelta
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            {user?.fullName || user?.username}
            {isAdmin && (
              <Badge className="ml-2 sm:ml-3 bg-gradient-to-r from-primary to-primary/80">
                Administrador
              </Badge>
            )}
          </p>
        </div>
      </div>

      {/* Estadísticas mejoradas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <div className="rounded-full bg-green-500/10 p-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Activo</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sistema funcionando correctamente
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuario</CardTitle>
            <div className="rounded-full bg-blue-500/10 p-2">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold truncate">{user?.username}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Badge variant={isAdmin ? "default" : "secondary"} className="mt-1">
                {isAdmin ? "Administrador" : "Empleado"}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API</CardTitle>
            <div className="rounded-full bg-purple-500/10 p-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground mt-1">Conectado a la API</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesión</CardTitle>
            <div className="rounded-full bg-orange-500/10 p-2">
              <Package className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Activa</div>
            <p className="text-xs text-muted-foreground mt-1">Token válido</p>
          </CardContent>
        </Card>
      </div>

      {/* Enlaces rápidos mejorados */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Acceso Rápido</CardTitle>
          <p className="text-sm text-muted-foreground">Navega rápidamente a las secciones principales</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/products">
              <Button
                variant="outline"
                className="group w-full h-24 flex flex-col gap-3 border-2 transition-all duration-300 hover:border-primary hover:shadow-lg hover:scale-105 hover:bg-primary/5"
              >
                <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <span className="font-semibold">Productos</span>
              </Button>
            </Link>
            <Link href="/dashboard/sales">
              <Button
                variant="outline"
                className="group w-full h-24 flex flex-col gap-3 border-2 transition-all duration-300 hover:border-primary hover:shadow-lg hover:scale-105 hover:bg-primary/5"
              >
                <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <span className="font-semibold">Ventas</span>
              </Button>
            </Link>
            <Link href="/dashboard/clients">
              <Button
                variant="outline"
                className="group w-full h-24 flex flex-col gap-3 border-2 transition-all duration-300 hover:border-primary hover:shadow-lg hover:scale-105 hover:bg-primary/5"
              >
                <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <span className="font-semibold">Clientes</span>
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/register-employee">
                <Button
                  variant="outline"
                  className="group w-full h-24 flex flex-col gap-3 border-2 transition-all duration-300 hover:border-primary hover:shadow-lg hover:scale-105 hover:bg-primary/5"
                >
                  <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-semibold">Registrar Empleado</span>
                </Button>
              </Link>
            )}
            <Link href="/marketplace" target="_blank">
              <Button
                variant="outline"
                className="group w-full h-24 flex flex-col gap-3 border-2 transition-all duration-300 hover:border-primary hover:shadow-lg hover:scale-105 hover:bg-primary/5"
              >
                <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <span className="font-semibold">Marketplace</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
