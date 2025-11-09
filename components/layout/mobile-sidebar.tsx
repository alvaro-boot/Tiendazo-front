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
  X,
} from "lucide-react";
import { useAuthContext } from "@/lib/auth-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();
  const { isAdmin } = useAuthContext();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <div
          className="flex h-full w-full flex-col border-r"
          style={{ background: 'var(--sidebar)', borderColor: 'var(--glass-border)', backdropFilter: 'blur(26px)' }}
        >
          <div
            className="flex h-16 items-center justify-between gap-3 border-b px-6"
            style={{
              borderBottomColor: 'var(--glass-border)',
              background: 'linear-gradient(120deg, rgba(255,255,255,0.12), rgba(120,150,255,0.12))',
              backdropFilter: 'blur(26px)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg shadow-lg">
                <div
                  className="h-full w-full rounded-[20%] bg-gradient-to-br from-[#06e7ff] via-[#2d5bff] to-[#ff3fd6] shadow-primary/25 [clip-path:polygon(50%_0%,100%_50%,50%_100%,0%_50%)]"
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Prisma Commerce
                </span>
                <span className="text-xs text-muted-foreground">Panel administrativo</span>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  title={item.name}
                  aria-current={isActive ? "page" : undefined}
                  data-active={isActive ? "true" : undefined}
                  className="prisma-nav-link group text-sm font-medium tracking-[0.08em]"
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
                <div className="my-4 h-px prisma-divider" />
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => onOpenChange(false)}
                      title={item.name}
                      aria-current={isActive ? "page" : undefined}
                      data-active={isActive ? "true" : undefined}
                      className="prisma-nav-link group text-sm font-medium tracking-[0.08em]"
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
                <div className="my-4 h-px prisma-divider" />
                <Link
                  href="/register-employee"
                  onClick={() => onOpenChange(false)}
                  title="Registrar Empleado"
                  aria-current={pathname === "/register-employee" ? "page" : undefined}
                  data-active={pathname === "/register-employee" ? "true" : undefined}
                  className="prisma-nav-link group text-sm font-medium tracking-[0.08em]"
                >
                  <span className="prisma-nav-link__icon transition-transform duration-500 group-hover:rotate-3">
                    <UserPlus className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </span>
                  <span className="prisma-nav-link__label">Registrar Empleado</span>
                  {pathname === "/register-employee" && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-white/70 shadow-[0_0_18px_rgba(255,255,255,0.6)] animate-pulse" />
                  )}
                </Link>
              </>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

