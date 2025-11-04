"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, FileText, User, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: "Mis Pedidos", href: "/client/orders", icon: Package },
    { name: "Mis Facturas", href: "/client/invoices", icon: FileText },
    { name: "Mi Perfil", href: "/client/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link href="/marketplace" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                <Store className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent hidden sm:inline">
                Portal del Cliente
              </span>
              <span className="text-sm sm:hidden font-bold">Cliente</span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className="flex-shrink-0">
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm gap-1 sm:gap-2",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                    >
                      <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{item.name}</span>
                      <span className="sm:hidden">{item.name.split(" ")[0]}</span>
                    </Button>
                  </Link>
                );
              })}
              <Link href="/marketplace" className="flex-shrink-0 hidden md:block">
                <Button variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                  <span className="hidden lg:inline">Volver al Marketplace</span>
                  <span className="lg:hidden">Marketplace</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">{children}</main>
    </div>
  );
}

