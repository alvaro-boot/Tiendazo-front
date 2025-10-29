"use server";

import { cookies } from "next/headers";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "owner" | "employee";
  storeId?: string;
}

// Mock user database eliminado para producción
// Los usuarios deben registrarse a través del backend

export async function login(email: string, password: string) {
  // Esta función debe ser implementada para conectar con el backend real
  // Por ahora retorna error para forzar el uso del backend
  return {
    success: false,
    error: "Sistema de autenticación no disponible. Use el backend.",
  };
}

export async function register(email: string, password: string, name: string) {
  // Esta función debe ser implementada para conectar con el backend real
  // Por ahora retorna error para forzar el uso del backend
  return {
    success: false,
    error: "Sistema de registro no disponible. Use el backend.",
  };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("user");
  return { success: true };
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");

  if (!userCookie) {
    return null;
  }

  try {
    return JSON.parse(userCookie.value);
  } catch {
    return null;
  }
}
