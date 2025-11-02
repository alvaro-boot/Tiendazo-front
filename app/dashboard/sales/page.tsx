"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewSale } from "@/components/sales/new-sale"
import { SalesHistory } from "@/components/sales/sales-history"
import { ShoppingCart, History } from "lucide-react"

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState("new")

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header mejorado */}
      <div className="pb-4 border-b">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Ventas
        </h1>
        <p className="text-muted-foreground mt-2">Registra ventas y consulta el historial</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger 
            value="new" 
            className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            Nueva Venta
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            <History className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-6">
          <NewSale />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <SalesHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
