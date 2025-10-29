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

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuthContext();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Store className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">Tiendazo</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        {/* Enlace de registro solo para administradores */}
        {isAdmin && (
          <Link
            href="/register-employee"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/register-employee"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <UserPlus className="h-5 w-5" />
            Registrar Empleado
          </Link>
        )}
      </nav>
    </div>
  );
}
