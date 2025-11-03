"use client"

import { useEffect } from "react"
import { useClients } from "@/hooks/use-api"
import { Client, ClientData } from "@/lib/services"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"

interface ClientDialogProps {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ClientFormData {
  fullName: string
  phone: string
  email?: string
  address?: string
}

export function ClientDialog({ client, open, onOpenChange }: ClientDialogProps) {
  const { createClient, updateClient, fetchClients } = useClients()
  const { register, handleSubmit, reset } = useForm<ClientFormData>()

  useEffect(() => {
    if (client) {
      reset({
        fullName: client.fullName,
        phone: client.phone,
        email: client.email || "",
        address: client.address || "",
      })
    } else {
      reset({
        fullName: "",
        phone: "",
        email: "",
        address: "",
      })
    }
  }, [client, reset])

  const onSubmit = async (data: ClientFormData) => {
    try {
      // Limpiar email vacío - enviar undefined en lugar de cadena vacía
      const clientData: ClientData = {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email && data.email.trim() !== "" ? data.email.trim() : undefined,
        address: data.address && data.address.trim() !== "" ? data.address.trim() : undefined,
      }

      if (client) {
        await updateClient(client.id, clientData)
        await fetchClients()
      } else {
        await createClient(clientData)
        await fetchClients()
      }
      onOpenChange(false)
    } catch (error: any) {
      console.error("❌ Error al guardar cliente:", error);
      alert(`Error al guardar cliente: ${error.message || "Error desconocido"}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {client ? "Editar Cliente" : "Nuevo Cliente"}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {client ? "Actualiza la información del cliente" : "Agrega un nuevo cliente a tu base de datos"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="font-semibold">Nombre Completo *</Label>
            <Input 
              id="fullName" 
              {...register("fullName", { required: true })} 
              className="h-11 border-2 focus:border-primary transition-colors"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-semibold">Teléfono *</Label>
              <Input 
                id="phone" 
                type="tel" 
                {...register("phone", { required: true })} 
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">Email</Label>
              <Input 
                id="email" 
                type="email" 
                {...register("email")} 
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="font-semibold">Dirección</Label>
            <Input 
              id="address" 
              {...register("address")} 
              className="h-11 border-2 focus:border-primary transition-colors"
            />
          </div>

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="transition-all hover:scale-105"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              {client ? "Actualizar" : "Crear"} Cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
