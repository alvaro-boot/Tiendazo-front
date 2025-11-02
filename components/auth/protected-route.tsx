'use client';

import { useAuthContext } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'EMPLOYEE';
  fallback?: React.ReactNode;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // NO redirigir automáticamente - solo mostrar mensaje si no está autenticado
    // Permitir que el usuario continúe navegando incluso si hay problemas de autenticación
    // Solo redirigir si realmente no hay datos de usuario
    if (!loading && !isAuthenticated && !user) {
      // Delay más largo para evitar redirecciones durante navegación
      const timeoutId = setTimeout(() => {
        // Solo redirigir si aún no está autenticado después del delay
        if (!isAuthenticated && !user) {
          console.log("⚠️ No autenticado, redirigiendo a login...");
          router.push('/login');
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading, isAuthenticated, router, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
          <p className="text-muted-foreground">Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sin Permisos</h2>
          <p className="text-muted-foreground">
            No tienes permisos para acceder a esta sección.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Se requiere rol: {requiredRole}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
