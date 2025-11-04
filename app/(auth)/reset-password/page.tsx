"use client";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthRedirect } from "@/components/auth-redirect";
import { Store } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <>
      <AuthRedirect />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="w-full max-w-md animate-in fade-in duration-500">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl">
                <Store className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-balance mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Tiendazo
            </h1>
            <p className="text-lg text-muted-foreground">
              Restablecer Contraseña
            </p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </>
  );
}

