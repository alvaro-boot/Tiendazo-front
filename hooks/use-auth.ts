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

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log("✅ Usuario cargado desde localStorage");
        } else {
          console.log("🔍 No hay datos de autenticación almacenados");
        }
      } catch (error) {
        console.error("Error inicializando autenticación:", error);
        storage.remove(config.TOKEN_KEY);
        storage.remove(config.USER_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const data = await authService.login(credentials);

      // Guardar en localStorage
      storage.set(config.TOKEN_KEY, data.access_token);
      storage.set(config.USER_KEY, JSON.stringify(data.user));

      // También guardar en cookies para el middleware
      document.cookie = `access_token=${data.access_token}; path=/; max-age=86400`; // 24 horas

      setUser(data.user);

      return data;
    } catch (error: any) {
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
