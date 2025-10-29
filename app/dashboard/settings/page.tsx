"use client";

import { useStore } from "@/lib/store";
import { config } from "@/lib/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Store, User } from "lucide-react";

interface StoreFormData {
  name: string;
  address: string;
  phone: string;
  currency: string;
  taxRate: number;
}

interface UserFormData {
  name: string;
  email: string;
}

export default function SettingsPage() {
  const { currentStore, user, updateStore } = useStore();
  const storeForm = useForm<StoreFormData>({
    defaultValues: {
      name: currentStore?.name || "",
      address: currentStore?.address || "",
      phone: currentStore?.phone || "",
      currency: currentStore?.currency || config.DEFAULT_CURRENCY,
      taxRate: (currentStore?.taxRate || config.DEFAULT_TAX_RATE) * 100,
    },
  });

  const userForm = useForm<UserFormData>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const onStoreSubmit = (data: StoreFormData) => {
    if (currentStore) {
      updateStore(currentStore.id, {
        ...data,
        taxRate: data.taxRate / 100,
      });
      alert("Configuración de tienda actualizada");
    }
  };

  const onUserSubmit = (data: UserFormData) => {
    alert("Perfil actualizado (funcionalidad pendiente)");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Administra la configuración de tu tienda y perfil
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Información de la Tienda
            </CardTitle>
            <CardDescription>Actualiza los datos de tu negocio</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={storeForm.handleSubmit(onStoreSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="store-name">Nombre de la Tienda *</Label>
                <Input
                  id="store-name"
                  {...storeForm.register("name", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-address">Dirección</Label>
                <Input id="store-address" {...storeForm.register("address")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-phone">Teléfono</Label>
                <Input
                  id="store-phone"
                  type="tel"
                  {...storeForm.register("phone")}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store-currency">Moneda</Label>
                  <Input
                    id="store-currency"
                    {...storeForm.register("currency")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-tax">Tasa de Impuesto (%)</Label>
                  <Input
                    id="store-tax"
                    type="number"
                    step="0.01"
                    {...storeForm.register("taxRate", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Guardar Cambios
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil de Usuario
            </CardTitle>
            <CardDescription>Actualiza tu información personal</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={userForm.handleSubmit(onUserSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="user-name">Nombre *</Label>
                <Input
                  id="user-name"
                  {...userForm.register("name", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-email">Email *</Label>
                <Input
                  id="user-email"
                  type="email"
                  {...userForm.register("email", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label>Rol</Label>
                <Input
                  value={user?.role === "admin" ? "Administrador" : "Empleado"}
                  disabled
                />
              </div>

              <Button type="submit" className="w-full">
                Actualizar Perfil
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zona de Peligro</CardTitle>
          <CardDescription>Acciones irreversibles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
            <div>
              <p className="font-medium">Limpiar Datos de Prueba</p>
              <p className="text-sm text-muted-foreground">
                Elimina todos los datos de ejemplo
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => alert("Funcionalidad pendiente")}
            >
              Limpiar Datos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
