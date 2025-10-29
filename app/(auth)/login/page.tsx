"use client";

import { LoginForm } from "@/components/auth/login-form";
import { AuthRedirect } from "@/components/auth-redirect";

export default function LoginPage() {
  return (
    <>
      <AuthRedirect />
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-balance mb-2">Tiendazo</h1>
            <p className="text-muted-foreground">
              Sistema de Gestión de Tiendas
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </>
  );
}
