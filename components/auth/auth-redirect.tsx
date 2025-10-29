"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth-context";

export function AuthRedirect() {
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir si no está cargando y está autenticado
    if (!loading && isAuthenticated) {
      console.log("🔄 Usuario autenticado, redirigiendo a dashboard");
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  // No renderizar nada, solo manejar la redirección
  return null;
}
