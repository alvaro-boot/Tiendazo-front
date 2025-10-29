"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuthContext } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const { logout } = useAuthContext();
  const router = useRouter();

  const handleLogout = () => {
    console.log("🔍 Cerrando sesión...");
    logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <Button onClick={handleLogout} variant="outline" size="sm">
      <LogOut className="h-4 w-4 mr-2" />
      Cerrar Sesión
    </Button>
  );
}
