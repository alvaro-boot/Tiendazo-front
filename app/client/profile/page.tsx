"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/lib/auth-context";
import { User, Save, Mail, Phone, MapPin, UserCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ProfileForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export default function ClientProfilePage() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState<ProfileForm>({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: "",
        address: "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // TODO: Implementar actualización de perfil del cliente
      // await clientService.updateProfile(user?.id, formData);
      
      setSuccess("Perfil actualizado exitosamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error actualizando perfil:", err);
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Mi Perfil</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Actualiza tu información personal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 text-sm text-primary-foreground bg-primary/10 border border-primary rounded-lg">
            {success}
          </div>
        )}

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-primary" />
                Información Personal
              </CardTitle>
              <CardDescription>Actualiza tus datos personales</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                    placeholder="Juan Pérez"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+57 300 123 4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle 123 #45-67, Ciudad"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Cambios"}
                  <Save className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Información de la Cuenta
              </CardTitle>
              <CardDescription>Datos de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Usuario</p>
                <p className="font-medium">{user?.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rol</p>
                <Badge>{user?.role}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fecha de registro</p>
                <p className="font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("es-CO")
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

