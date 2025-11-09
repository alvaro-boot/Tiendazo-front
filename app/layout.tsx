import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prisma Commerce - Plataforma de Comercio Multitienda",
  description: "Gestiona y personaliza tus tiendas físicas y en línea con Prisma Commerce.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="prisma-shell">
            <div className="prisma-shell__gradient" aria-hidden="true" />
            <div className="prisma-shell__particles" aria-hidden="true" />
            <div className="prisma-shell__overlay" aria-hidden="true" />
            <div className="prisma-shell__content">
              <AuthProvider>{children}</AuthProvider>
            </div>
            <Toaster />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
