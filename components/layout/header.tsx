"use client";

import { useAuthContext } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Store, BadgeCheck, Menu, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthContext();
  const router = useRouter();

  const handleLogout = () => {
    console.log("🔍 Cerrando sesión desde header...");
    logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70 px-4 sm:px-6 shadow-soft">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Botón menú hamburguesa para móvil */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/30">
          <Store className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Tiendazo</span>
          <span className="text-xs text-muted-foreground font-medium">Sistema de Gestión</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/marketplace" target="_blank">
          <Button variant="ghost" size="sm" className="gap-2 rounded-xl hover:bg-accent/50 transition-all duration-200">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Marketplace</span>
          </Button>
        </Link>
        <ThemeToggle />
        <div className="hidden lg:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-muted/80 to-muted/50 border border-border/50 shadow-soft">
          <BadgeCheck className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold truncate max-w-[150px]">{user?.fullName}</span>
          {user?.role === "ADMIN" && (
            <Badge variant="default" className="ml-1 text-xs shadow-md shadow-primary/20">Admin</Badge>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2.5 rounded-xl hover:bg-accent/50 transition-all duration-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 text-primary ring-2 ring-primary/20 shadow-soft transition-all duration-200 hover:ring-primary/30 hover:scale-105">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden md:inline font-semibold truncate max-w-[120px]">{user?.fullName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">{user?.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
