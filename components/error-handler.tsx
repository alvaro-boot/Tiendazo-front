"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export function ErrorHandler({ children }: ErrorBoundaryProps) {
  const { toast } = useToast();

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);

      // Mostrar toast de error
      toast({
        title: "Error",
        description: event.reason?.message || "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    };

    const handleError = (event: ErrorEvent) => {
      console.error("Global error:", event.error);

      toast({
        title: "Error",
        description: event.error?.message || "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("error", handleError);
    };
  }, [toast]);

  return <>{children}</>;
}
