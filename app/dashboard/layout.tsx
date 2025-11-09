"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"
import { Header } from "@/components/layout/header"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[var(--bg-gradient)]">
        {/* Sidebar desktop - oculto en móvil */}
        <aside
          className="hidden md:flex h-full w-64 flex-col border-r border-border/40 backdrop-blur-2xl"
          style={{ background: "var(--sidebar)" }}
        >
          <Sidebar />
        </aside>
        
        {/* Mobile sidebar */}
        <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
        
        <div className="flex flex-1 flex-col overflow-hidden w-full md:w-auto">
          <Header onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-transparent p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl w-full space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
