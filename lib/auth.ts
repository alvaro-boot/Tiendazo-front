"use server"

import { cookies } from "next/headers"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "owner" | "employee"
  storeId?: string
}

// Mock user database - replace with real database
const users = [
  {
    id: "1",
    email: "admin@tiendazo.com",
    password: "admin123",
    name: "Admin User",
    role: "admin" as const,
  },
  {
    id: "2",
    email: "owner@tiendazo.com",
    password: "owner123",
    name: "Store Owner",
    role: "owner" as const,
    storeId: "store-1",
  },
]

export async function login(email: string, password: string) {
  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    return { success: false, error: "Credenciales inválidas" }
  }

  const { password: _, ...userWithoutPassword } = user
  const cookieStore = await cookies()

  // In production, use proper JWT tokens
  cookieStore.set("user", JSON.stringify(userWithoutPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return { success: true, user: userWithoutPassword }
}

export async function register(email: string, password: string, name: string) {
  const existingUser = users.find((u) => u.email === email)

  if (existingUser) {
    return { success: false, error: "El usuario ya existe" }
  }

  const newUser = {
    id: String(users.length + 1),
    email,
    password,
    name,
    role: "owner" as const,
  }

  users.push(newUser)

  const { password: _, ...userWithoutPassword } = newUser
  const cookieStore = await cookies()

  cookieStore.set("user", JSON.stringify(userWithoutPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })

  return { success: true, user: userWithoutPassword }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("user")
  return { success: true }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get("user")

  if (!userCookie) {
    return null
  }

  try {
    return JSON.parse(userCookie.value)
  } catch {
    return null
  }
}
