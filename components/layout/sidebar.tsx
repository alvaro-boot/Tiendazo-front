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
  BarChart3,
  UserPlus,
  ShoppingBag,
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
    <div className="flex h-full w-56 flex-col border-r border-border/50 bg-gradient-to-b from-card via-card/98 to-card/95 backdrop-blur-sm shadow-soft">
      <div className="flex h-14 items-center gap-3 border-b border-border/50 px-5 bg-gradient-to-r from-primary/8 via-primary/5 to-transparent">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105">
          <div
            className="h-full w-full rounded-[20%] bg-gradient-to-br from-[#06e7ff] via-[#2d5bff] to-[#ff3fd6] shadow-lg shadow-primary/25 [clip-path:polygon(50%_0%,100%_50%,50%_100%,0%_50%)]"
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Prisma Commerce
          </span>
          <span className="text-[0.65rem] text-muted-foreground font-medium">Panel administrativo</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              aria-current={isActive ? "page" : undefined}
              data-active={isActive ? "true" : undefined}
              className={cn(
                "prisma-nav-link prisma-nav-link--compact group font-medium tracking-[0.08em]",
                !isActive && "hover:text-foreground/90"
              )}
            >
              <span className="prisma-nav-link__icon transition-transform duration-500 group-hover:rotate-3">
                <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              </span>
              <span className="prisma-nav-link__label">{item.name}</span>
              {isActive && (
                <span className="ml-auto h-2 w-2 rounded-full bg-white/70 shadow-[0_0_18px_rgba(255,255,255,0.6)] animate-pulse" />
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
                  title={item.name}
                  aria-current={isActive ? "page" : undefined}
                  data-active={isActive ? "true" : undefined}
                  className={cn(
                    "prisma-nav-link prisma-nav-link--compact group font-medium tracking-[0.08em]",
                    !isActive && "hover:text-foreground/90"
                  )}
                >
                  <span className="prisma-nav-link__icon transition-transform duration-500 group-hover:rotate-3">
                    <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </span>
                  <span className="prisma-nav-link__label">{item.name}</span>
                  {isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-white/70 shadow-[0_0_18px_rgba(255,255,255,0.6)] animate-pulse" />
                  )}
                </Link>
              );
            })}
            <div className="my-4 h-px bg-border/50" />
            <Link
              href="/register-employee"
              title="Registrar Empleado"
              aria-current={pathname === "/register-employee" ? "page" : undefined}
              data-active={pathname === "/register-employee" ? "true" : undefined}
              className={cn(
                "prisma-nav-link prisma-nav-link--compact group font-medium tracking-[0.08em]",
                pathname !== "/register-employee" && "hover:text-foreground/90"
              )}
            >
              <span className="prisma-nav-link__icon transition-transform duration-500 group-hover:rotate-3">
                <UserPlus className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              </span>
              <span className="prisma-nav-link__label">Registrar Empleado</span>
            </Link>
          </>
        )}
        
        {/* Enlace al Marketplace */}
        <div className="my-4 h-px bg-border/50" />
        <Link
          href="/marketplace"
          target="_blank"
          rel="noreferrer"
          className="prisma-nav-link prisma-nav-link--compact group font-medium tracking-[0.08em] hover:text-foreground/90"
          title="Marketplace"
        >
          <span className="prisma-nav-link__icon transition-transform duration-500 group-hover:rotate-3">
            <ShoppingBag className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          </span>
          <span className="prisma-nav-link__label">Marketplace</span>
        </Link>
      </nav>
    </div>
  );
}
