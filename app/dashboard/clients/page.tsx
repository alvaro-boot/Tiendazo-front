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
import { Plus, Search, Edit3, Trash2, Users, DollarSign, ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import { ClientDialog } from "@/components/clients/client-dialog"
import { cn } from "@/lib/utils"

export default function ClientsPage() {
  const { user } = useAuthContext()
  const storeId = user?.storeId || user?.store?.id
  const { clients, deleteClient, fetchClients } = useClients(storeId)
  const { clientsDebtInfo, totalDebt, fetchClientsWithDebt, fetchTotalDebt } = useDebts()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }),
    [],
  )

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

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, clients.length])

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize))
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredClients.slice(start, start + pageSize)
  }, [filteredClients, currentPage])
  const showingFrom = filteredClients.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const showingTo = filteredClients.length === 0 ? 0 : Math.min(currentPage * pageSize, filteredClients.length)

  const stats = useMemo(
    () => [
      {
        key: "totalClients",
        title: "Total de clientes",
        tag: "Resumen",
        value: totalClients.toLocaleString("es-CO"),
        description: "Clientes registrados",
        icon: Users,
        valueClass: "text-primary drop-shadow-[0_10px_35px_rgba(100,99,255,0.35)]",
      },
      {
        key: "clientsWithDebt",
        title: "Clientes con deuda",
        tag: "Atención",
        value: clientsWithDebt.toLocaleString("es-CO"),
        description: "Con saldos pendientes",
        icon: Sparkles,
        valueClass: "text-accent drop-shadow-[0_12px_40px_rgba(255,0,255,0.32)]",
      },
      {
        key: "totalDebt",
        title: "Deuda total",
        tag: "Finanzas",
        value: currencyFormatter.format(totalDebt),
        description: "Deuda acumulada",
        icon: DollarSign,
        valueClass: "text-[#ff8a8a] drop-shadow-[0_12px_40px_rgba(255,105,105,0.32)]",
        alert: true,
      },
    ],
    [totalClients, clientsWithDebt, currencyFormatter, totalDebt],
  )

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

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b"
        style={{ borderBottomColor: "var(--glass-border)" }}
      >
        <div className="space-y-3">
          <span className="prisma-badge prisma-badge--glow">
            Prisma Commerce
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary-foreground/90 to-accent bg-clip-text text-transparent drop-shadow-[0_20px_50px_rgba(90,130,255,0.28)]">
            Clientes
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground/80 mt-3 max-w-lg">
              Administra tu ecosistema de clientes, monitorea deudas y mantén tu comunicación al día con estilo Prisma.
            </p>
          </div>
        </div>
        <Button
          onClick={handleAddNew}
          className="w-full sm:w-auto rounded-full border border-primary/25 bg-gradient-to-r from-primary/85 via-secondary/70 to-accent/60 px-6 py-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-[0_18px_55px_rgba(90,140,255,0.35)] transition-all duration-500 hover:translate-y-[-2px] hover:shadow-[0_24px_65px_rgba(90,140,255,0.45)]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.key}
              className={cn(
                "prisma-card group relative overflow-hidden backdrop-blur-3xl transition-all duration-500",
                stat.alert && "prisma-card--alert",
              )}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/6 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <CardHeader className="relative flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground/70">{stat.tag}</span>
                  <CardTitle className="text-sm font-semibold text-foreground/90">{stat.title}</CardTitle>
                </div>
                <span
                  className={cn(
                    "prisma-card__icon",
                    stat.alert && "animate-[prismaPulseSoft_3.6s_ease-in-out_infinite]",
                  )}
                >
                  <Icon className="h-5 w-5 text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.45)]" />
                </span>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className={cn("text-4xl sm:text-5xl font-extrabold tracking-tight", stat.valueClass)}>{stat.value}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/75">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabla de clientes */}
      <Card className="prisma-card overflow-hidden">
        <CardHeader
          className="border-b"
          style={{
            borderBottomColor: "var(--glass-border)",
            background: "var(--glass-strong)",
            backdropFilter: "blur(26px)",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground/90">Lista de clientes</CardTitle>
              <p className="text-sm text-muted-foreground/80">
                Filtra, edita y gestiona a tus clientes dentro de la experiencia Prisma.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 rounded-full border pl-12 pr-4 text-sm tracking-wide text-foreground/90 placeholder:text-muted-foreground/60 transition-all duration-300 focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/35"
                style={{
                  borderColor: "var(--glass-border)",
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(18px)",
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto px-4">
            <Table className="prisma-table">
              <TableHeader>
                <TableRow className="prisma-table-head-row">
                  <TableHead className="min-w-[180px] text-xs uppercase tracking-[0.35em] text-muted-foreground">
                    Nombre
                  </TableHead>
                  <TableHead className="hidden min-w-[140px] text-xs uppercase tracking-[0.35em] text-muted-foreground sm:table-cell">
                    Teléfono
                  </TableHead>
                  <TableHead className="hidden min-w-[180px] text-xs uppercase tracking-[0.35em] text-muted-foreground md:table-cell">
                    Email
                  </TableHead>
                  <TableHead className="hidden min-w-[180px] text-xs uppercase tracking-[0.35em] text-muted-foreground lg:table-cell">
                    Dirección
                  </TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-[0.35em] text-muted-foreground">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground/80">
                      No se encontraron clientes
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="prisma-table-row"
                    >
                      <TableCell className="py-6">
                        <div className="space-y-1">
                          <p className="text-base font-semibold tracking-tight text-foreground/90">{client.fullName}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{client.phone}</p>
                          {client.email && (
                            <Badge className="max-w-[240px] truncate rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-primary/80">
                              {client.email}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-sm text-foreground/80 sm:table-cell">{client.phone}</TableCell>
                      <TableCell className="hidden text-sm text-foreground/80 md:table-cell">
                        {client.email || "-"}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {client.address || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(client)}
                            className="group flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-all duration-300 hover:translate-y-[-2px] hover:border-primary/40 hover:bg-primary/15 hover:shadow-[0_12px_32px_rgba(100,140,255,0.28)]"
                          >
                            <Edit3 className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(client.id)}
                            className="group flex items-center gap-1 rounded-full border border-destructive/25 bg-destructive/10 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-destructive transition-all duration-300 hover:translate-y-[-2px] hover:border-destructive/40 hover:bg-destructive/20 hover:shadow-[0_12px_32px_rgba(255,105,105,0.28)]"
                          >
                            <Trash2 className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div
            className="mt-6 flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            style={{
              borderTopColor: "var(--glass-border)",
              background: "var(--glass-strong)",
              backdropFilter: "blur(24px)",
            }}
          >
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground/70">
              Mostrando {showingFrom}-{showingTo} de {filteredClients.length}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="flex items-center gap-1 rounded-full border px-3 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/80 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  borderColor: "var(--glass-border)",
                  background: "var(--glass)",
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1
                const isActive = pageNumber === currentPage
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => handlePageChange(pageNumber)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold tracking-[0.2em] text-foreground/80 transition-all duration-300 hover:border-primary/40 hover:bg-primary/15 hover:text-primary",
                      isActive &&
                        "border-primary/50 bg-gradient-to-br from-primary/80 via-secondary/70 to-accent/60 text-primary-foreground shadow-[0_12px_32px_rgba(90,130,255,0.35)]",
                    )}
                    style={{
                      borderColor: isActive ? undefined : "var(--glass-border)",
                      background: isActive ? undefined : "var(--glass)",
                    }}
                  >
                    {pageNumber}
                  </button>
                )
              })}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="flex items-center gap-1 rounded-full border px-3 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/80 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  borderColor: "var(--glass-border)",
                  background: "var(--glass)",
                }}
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
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
