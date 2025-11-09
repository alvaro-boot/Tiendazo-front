"use client";

import { ClientRegisterForm } from "@/components/auth/client-register-form";
import { Store, UserPlus } from "lucide-react";
import Link from "next/link";

export default function RegisterClientPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/10 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/2 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-3xl relative z-10 px-2 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <Link 
            href="/marketplace" 
            className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-4 sm:mb-8 group transition-transform hover:scale-105"
          >
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 group-hover:shadow-primary/40 transition-all duration-300">
              <Store className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Prisma Commerce Sitio Web
            </span>
          </Link>
        </div>
        
        {/* Form */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <ClientRegisterForm />
        </div>
      </div>
    </div>
  );
}

