"use client"

import { useEffect } from "react"
import { useStore, type Client } from "@/lib/store"
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
  name: string
  phone: string
  email?: string
  address?: string
}

export function ClientDialog({ client, open, onOpenChange }: ClientDialogProps) {
  const { currentStore, addClient, updateClient } = useStore()
  const { register, handleSubmit, reset } = useForm<ClientFormData>()

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        phone: client.phone,
        email: client.email || "",
        address: client.address || "",
      })
    } else {
      reset({
        name: "",
        phone: "",
        email: "",
        address: "",
      })
    }
  }, [client, reset])

  const onSubmit = (data: ClientFormData) => {
    if (client) {
      updateClient(client.id, data)
    } else {
      const newClient: Client = {
        id: `client-${Date.now()}`,
        ...data,
        storeId: currentStore?.id || "",
        totalDebt: 0,
        createdAt: new Date().toISOString(),
      }
      addClient(newClient)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          <DialogDescription>
            {client ? "Actualiza la información del cliente" : "Agrega un nuevo cliente a tu base de datos"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono *</Label>
            <Input id="phone" type="tel" {...register("phone", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" {...register("address")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{client ? "Actualizar" : "Crear"} Cliente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
