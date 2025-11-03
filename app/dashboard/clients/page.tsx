"use client"

import { useState, useMemo, useEffect } from "react"
import { useClients } from "@/hooks/use-api"
import { useDebts } from "@/hooks/use-debts"
import { useAuthContext } from "@/lib/auth-context"
import { Client } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Pencil, Trash2, Users, DollarSign } from "lucide-react"
import { ClientDialog } from "@/components/clients/client-dialog"

export default function ClientsPage() {
  const { user } = useAuthContext()
  const storeId = user?.storeId || user?.store?.id
  const { clients, deleteClient, fetchClients } = useClients(storeId)
  const { clientsDebtInfo, totalDebt, fetchClientsWithDebt, fetchTotalDebt } = useDebts()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Actualizar datos de deuda cuando se actualiza un cliente
  useEffect(() => {
    if (storeId) {
      fetchClientsWithDebt()
      fetchTotalDebt()
    }
  }, [storeId, clients, fetchClientsWithDebt, fetchTotalDebt])

  const filteredClients = useMemo(() => {
    return clients.filter(
      (client) =>
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [clients, searchTerm])

  const totalClients = clients.length
  // Calcular clientes con deuda desde clientsDebtInfo
  const clientsWithDebt = useMemo(() => {
    return clientsDebtInfo.filter(info => info.totalDebt > 0).length
  }, [clientsDebtInfo])

  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este cliente?")) {
      try {
        await deleteClient(id)
        await fetchClients()
        // Actualizar datos de deuda después de eliminar
        if (storeId) {
          await fetchClientsWithDebt()
          await fetchTotalDebt()
        }
      } catch (error: any) {
        console.error("❌ Error al eliminar cliente:", error);
        alert(`Error al eliminar cliente: ${error.message || "Error desconocido"}`);
      }
    }
  }

  const handleAddNew = () => {
    setSelectedClient(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header mejorado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Clientes
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Gestiona tu base de clientes</p>
        </div>
        <Button 
          onClick={handleAddNew}
          className="bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Cards de estadísticas mejoradas */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <div className="rounded-full bg-blue-500/10 p-2">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">Clientes registrados</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes con Deuda</CardTitle>
            <div className="rounded-full bg-amber-500/10 p-2">
              <Users className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clientsWithDebt}</div>
            <p className="text-xs text-muted-foreground mt-1">Con deudas pendientes</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deuda Total</CardTitle>
            <div className="rounded-full bg-red-500/10 p-2">
              <DollarSign className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">${totalDebt.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Deuda acumulada</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla mejorada */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Lista de Clientes</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Busca y gestiona tus clientes</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-2 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2">
                  <TableHead className="font-semibold min-w-[150px]">Nombre</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell min-w-[120px]">Teléfono</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell min-w-[150px]">Email</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell min-w-[150px]">Dirección</TableHead>
                  <TableHead className="text-right font-semibold min-w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No se encontraron clientes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-muted/50 transition-colors border-b">
                      <TableCell className="font-semibold text-base">
                        <div>
                          <p>{client.fullName}</p>
                          <p className="text-xs text-muted-foreground sm:hidden mt-1">{client.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{client.phone}</TableCell>
                      <TableCell className="hidden md:table-cell">{client.email || "-"}</TableCell>
                      <TableCell className="text-muted-foreground hidden lg:table-cell">{client.address || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(client)}
                            className="hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(client.id)}
                            className="hover:bg-destructive/10 hover:text-destructive transition-all hover:scale-110"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ClientDialog 
        client={selectedClient} 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            // Actualizar datos de deuda después de cerrar el diálogo
            if (storeId) {
              fetchClientsWithDebt()
              fetchTotalDebt()
            }
          }
        }} 
      />
    </div>
  )
}
