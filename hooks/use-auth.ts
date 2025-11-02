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
    let isMounted = true;
    
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
          // Primero, restaurar el usuario desde localStorage (más rápido, sin llamada API)
          try {
            const parsedUser = JSON.parse(userData);
            if (isMounted) {
              setUser(parsedUser);
              setLoading(false);
              
              // Asegurar que la cookie esté sincronizada (30 días)
              if (typeof document !== "undefined") {
                document.cookie = `access_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; secure; samesite=strict`;
              }
              
              // Verificar que el token esté en localStorage
              const verifyToken = storage.get(config.TOKEN_KEY);
              if (!verifyToken) {
                console.warn("⚠️ Token no encontrado en localStorage, restaurando desde variable");
                storage.set(config.TOKEN_KEY, token);
              }
              
              console.log("✅ Usuario restaurado desde localStorage", {
                hasUser: !!parsedUser,
                hasToken: !!token,
                tokenVerified: !!verifyToken,
              });
            }
          } catch (parseError) {
            console.warn("⚠️ Error parseando datos de usuario:", parseError);
          }

          // Validar el token en segundo plano (sin bloquear la UI)
          // Solo validar si realmente es necesario (primera carga o cada cierto tiempo)
          const lastValidation = storage.get("last_token_validation");
          const now = Date.now();
          const VALIDATION_INTERVAL = 5 * 60 * 1000; // Validar cada 5 minutos máximo

          if (!lastValidation || (now - parseInt(lastValidation)) > VALIDATION_INTERVAL) {
            // Validar token en segundo plano sin afectar la UI
            authService.getProfile()
              .then((profile) => {
                if (isMounted) {
                  console.log("✅ Token validado en segundo plano, perfil actualizado:", profile);
                  setUser(profile);
                  storage.set(config.USER_KEY, JSON.stringify(profile));
                  storage.set("last_token_validation", now.toString());
                }
              })
              .catch((profileError: any) => {
                // NO CERRAR SESIÓN AUTOMÁTICAMENTE
                // Solo loggear el error y dejar que el usuario continúe usando la app
                // La validación fallida no significa que el token sea inválido (puede ser error de red)
                console.warn("⚠️ Error validando token en segundo plano (continuando con datos en caché):", profileError);
                // NO hacer nada - el usuario puede seguir usando la app con los datos en localStorage
                // Solo marcar que hubo un error para que se intente de nuevo después
              });
          } else {
            console.log("✅ Token validado recientemente, saltando validación");
          }
        } else {
          console.log("🔍 No hay datos de autenticación almacenados");
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("❌ Error inicializando autenticación:", error);
        if (isMounted) {
          // SOLO limpiar si es un error de parsing (datos corruptos)
          // NO cerrar sesión por errores de red o 401/403
          if (error instanceof SyntaxError) {
            console.error("⚠️ Error de parsing, limpiando datos corruptos");
            storage.remove(config.TOKEN_KEY);
            storage.remove(config.USER_KEY);
            setUser(null);
          } else {
            // Para cualquier otro error, mantener los datos y dejar que el usuario continúe
            console.warn("⚠️ Error no crítico, manteniendo datos en caché");
          }
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
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
          
          // NO CERRAR SESIÓN AUTOMÁTICAMENTE - Solo loggear errores
          // Incluso con múltiples fallos, no cerrar sesión automáticamente
          // El usuario puede seguir usando la app con los datos en caché
          console.warn(`⚠️ Error renovando sesión (${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}). No cerrando sesión automáticamente.`);
          
          // Si hay demasiados fallos, intentar de nuevo después de un tiempo
          if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
            console.warn("⚠️ Muchos fallos consecutivos, pausando renovación automática. La sesión se mantendrá activa.");
            // No cerrar sesión - solo pausar renovación
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

      // Guardar en localStorage PRIMERO
      console.log("💾 Guardando token:", {
        tokenPreview: data.access_token ? `${data.access_token.substring(0, 10)}...` : null,
        hasToken: !!data.access_token,
      });
      
      storage.set(config.TOKEN_KEY, data.access_token);
      storage.set(config.USER_KEY, JSON.stringify(data.user));

      // También guardar en cookies para el middleware (30 días)
      if (typeof document !== "undefined") {
        document.cookie = `access_token=${data.access_token}; path=/; max-age=${30 * 24 * 60 * 60}; secure; samesite=strict`;
      }
      
      // Verificar que se guardó correctamente
      const savedToken = storage.get(config.TOKEN_KEY);
      console.log("✅ Token guardado:", {
        saved: !!savedToken,
        matches: savedToken === data.access_token,
        tokenPreview: savedToken ? `${savedToken.substring(0, 10)}...` : null,
      });

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
