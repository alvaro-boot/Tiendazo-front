"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewSale } from "@/components/sales/new-sale"
import { SalesHistory } from "@/components/sales/sales-history"
import { ShoppingCart, History } from "lucide-react"

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState("new")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ventas</h1>
        <p className="text-muted-foreground">Registra ventas y consulta el historial</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="new" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Nueva Venta
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
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
