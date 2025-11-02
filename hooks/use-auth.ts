"use client";

import { useState, useEffect } from "react";
import {
  authService,
  User,
  LoginCredentials,
  RegisterData,
} from "@/lib/services";
import { config, storage } from "@/lib/config";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = storage.get(config.TOKEN_KEY);
        const userData = storage.get(config.USER_KEY);

        console.log("🔍 Inicializando autenticación:", {
          hasToken: !!token,
          hasUserData: !!userData,
          tokenPreview: token ? `${token.substring(0, 10)}...` : null,
        });

        if (token && userData) {
          // Intentar validar el token verificando el perfil del usuario
          try {
            const profile = await authService.getProfile();
            console.log("✅ Token válido, usuario autenticado:", profile);
            setUser(profile);
            storage.set(config.USER_KEY, JSON.stringify(profile));
            
            // Asegurar que la cookie esté sincronizada (30 días)
            document.cookie = `access_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; secure; samesite=strict`;
          } catch (profileError) {
            // Si falla la validación del token, limpiar localStorage
            console.log("⚠️ Token inválido o vencido, limpiando datos:", profileError);
            storage.remove(config.TOKEN_KEY);
            storage.remove(config.USER_KEY);
            document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            setUser(null);
            
            // Redirigir a login si no estamos ya ahí
            if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
              window.location.href = "/login";
            }
          }
        } else {
          console.log("🔍 No hay datos de autenticación almacenados");
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Error inicializando autenticación:", error);
        storage.remove(config.TOKEN_KEY);
        storage.remove(config.USER_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Configurar renovación proactiva de sesión cada 10 minutos (solo cuando hay usuario)
  useEffect(() => {
    if (!user) {
      return;
    }

    let consecutiveFailures = 0;
    const MAX_CONSECUTIVE_FAILURES = 3;

    const refreshInterval = setInterval(async () => {
      const token = storage.get(config.TOKEN_KEY);
      if (token) {
        try {
          console.log("🔄 Renovando sesión proactivamente...");
          const refreshResult = await authService.refreshSession();
          storage.set(config.TOKEN_KEY, refreshResult.access_token);
          // Actualizar cookie con expiración de 30 días
          document.cookie = `access_token=${refreshResult.access_token}; path=/; max-age=${30 * 24 * 60 * 60}; secure; samesite=strict`;
          
          // Actualizar el perfil para asegurar que los datos estén actualizados
          try {
            const updatedProfile = await authService.getProfile();
            setUser(updatedProfile);
            storage.set(config.USER_KEY, JSON.stringify(updatedProfile));
          } catch (profileError) {
            console.warn("⚠️ No se pudo actualizar el perfil, pero la sesión se renovó");
          }
          
          consecutiveFailures = 0; // Resetear contador de fallos
          console.log("✅ Sesión renovada exitosamente");
        } catch (error) {
          consecutiveFailures++;
          console.error(`❌ Error renovando sesión (intento ${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}):`, error);
          
          // Solo cerrar sesión si hay múltiples fallos consecutivos de autenticación
          const isAuthError = error?.response?.status === 401 || 
                             error?.response?.status === 403 ||
                             error?.message?.includes("Unauthorized") ||
                             error?.message?.includes("expired");
          
          if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES && isAuthError) {
            console.error("❌ Múltiples fallos de autenticación al renovar sesión, cerrando sesión...");
            logout();
          }
        }
      }
    }, 10 * 60 * 1000); // Cada 10 minutos (más frecuente para evitar expiración)

    return () => {
      clearInterval(refreshInterval);
    };
  }, [user]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      console.log("🔐 Iniciando sesión con:", credentials.username);

      const data = await authService.login(credentials);
      console.log("✅ Login exitoso:", data);

      // Guardar en localStorage
      storage.set(config.TOKEN_KEY, data.access_token);
      storage.set(config.USER_KEY, JSON.stringify(data.user));

      // También guardar en cookies para el middleware (30 días)
      document.cookie = `access_token=${data.access_token}; path=/; max-age=${30 * 24 * 60 * 60}; secure; samesite=strict`;
      console.log("💾 Token guardado en localStorage y cookies");

      setUser(data.user);

      return data;
    } catch (error: any) {
      console.error("❌ Error en login:", error);
      // Manejar errores específicos de la API
      if (error.response?.status === 401) {
        throw new Error("Credenciales incorrectas");
      } else if (error.response?.status === 404) {
        throw new Error("Usuario no encontrado");
      } else if (error.code === "ECONNABORTED") {
        throw new Error("Tiempo de espera agotado. Verifica tu conexión.");
      } else {
        throw new Error(error.message || "Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      const data = await authService.register(userData);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Limpiar localStorage
    storage.remove(config.TOKEN_KEY);
    storage.remove(config.USER_KEY);

    // Limpiar cookies
    document.cookie =
      "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    setUser(null);

    // Redirigir a login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      storage.set(config.USER_KEY, JSON.stringify(profile));
      return profile;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ADMIN";
  const isEmployee = user?.role === "EMPLOYEE";

  return {
    user,
    loading,
    login,
    register,
    logout,
    refreshProfile,
    isAuthenticated,
    isAdmin,
    isEmployee,
  };
};
