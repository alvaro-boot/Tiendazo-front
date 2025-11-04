"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  Store,
  BarChart3,
  UserPlus,
} from "lucide-react";
import { useAuthContext } from "@/lib/auth-context";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Productos", href: "/dashboard/products", icon: Package },
  { name: "Ventas", href: "/dashboard/sales", icon: ShoppingCart },
  { name: "Clientes", href: "/dashboard/clients", icon: Users },
  { name: "Fiados", href: "/dashboard/debts", icon: FileText },
  { name: "Reportes", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Usuarios", href: "/dashboard/users", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuthContext();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border/50 bg-gradient-to-b from-card via-card/98 to-card/95 backdrop-blur-sm shadow-soft">
      <div className="flex h-16 items-center gap-3 border-b border-border/50 px-6 bg-gradient-to-r from-primary/8 via-primary/5 to-transparent">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-105">
          <Store className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Tiendazo</span>
          <span className="text-xs text-muted-foreground font-medium">Panel</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary via-primary to-primary/95 text-primary-foreground shadow-lg shadow-primary/30 scale-[1.02] border border-primary/20"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:translate-x-1 hover:shadow-soft border border-transparent hover:border-border/50"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform duration-200",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} />
              <span className={cn(
                "transition-all duration-200",
                isActive && "font-semibold"
              )}>
                {item.name}
              </span>
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary-foreground/50 animate-pulse" />
              )}
            </Link>
          );
        })}

        {/* Navegación adicional solo para administradores */}
        {isAdmin && (
          <>
            <div className="my-4 h-px bg-border/50" />
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1 hover:shadow-md"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  <span className={cn(
                    "transition-all duration-200",
                    isActive && "font-semibold"
                  )}>
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary-foreground/50 animate-pulse" />
                  )}
                </Link>
              );
            })}
            <div className="my-4 h-px bg-border/50" />
            <Link
              href="/register-employee"
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                pathname === "/register-employee"
                  ? "bg-gradient-to-r from-primary via-primary to-primary/95 text-primary-foreground shadow-lg shadow-primary/30 scale-[1.02] border border-primary/20"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:translate-x-1 hover:shadow-soft border border-transparent hover:border-border/50"
              )}
            >
              <UserPlus className={cn(
                "h-5 w-5 transition-transform duration-200",
                pathname === "/register-employee" ? "scale-110" : "group-hover:scale-110"
              )} />
              <span className={cn(
                "transition-all duration-200",
                pathname === "/register-employee" && "font-semibold"
              )}>
                Registrar Empleado
              </span>
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}
