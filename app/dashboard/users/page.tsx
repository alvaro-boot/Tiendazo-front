"use client"

import { useState, useEffect } from "react"
import { useAuthContext } from "@/lib/auth-context"
import { authService, User, RegisterData } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Pencil, Trash2, Users, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UsersPage() {
  const { user: currentUser, isAdmin } = useAuthContext()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Normalizar storeId del usuario actual
  const currentStoreId = currentUser?.storeId || currentUser?.store?.id
  
  const [formData, setFormData] = useState<Partial<RegisterData>>({
    username: "",
    fullName: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    storeId: currentStoreId,
  })

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard")
      return
    }
    fetchUsers()
  }, [isAdmin, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      // Filtrar usuarios solo de la tienda del admin actual
      const storeId = currentUser?.storeId || currentUser?.store?.id
      const data = await authService.getAllUsers(storeId)
      setUsers(data)
      console.log("👥 Usuarios cargados:", {
        total: data.length,
        storeId: storeId,
        usuarios: data.map(u => ({ id: u.id, username: u.username, storeId: u.storeId || u.store?.id }))
      })
    } catch (err: any) {
      setError(err.message || "Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedUser(null)
    // Asegurar que storeId se establezca correctamente
    const storeId = currentUser?.storeId || currentUser?.store?.id
    setFormData({
      username: "",
      fullName: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
      storeId: storeId,
    })
    console.log("📝 Iniciando creación de usuario, storeId:", storeId)
    setIsDialogOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      password: "",
      role: user.role,
      storeId: user.storeId || user.store?.id,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (userId: number) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return

    try {
      await authService.deleteUser(userId)
      await fetchUsers()
      alert("Usuario eliminado exitosamente")
    } catch (err: any) {
      alert(`Error al eliminar usuario: ${err.message || "Error desconocido"}`)
    }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.username || !formData.fullName || !formData.email) {
        alert("Por favor completa todos los campos obligatorios")
        return
      }

      if (selectedUser) {
        // Actualizar usuario
        const updateData: any = {
          username: formData.username,
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
          storeId: formData.storeId,
        }
        
        if (formData.password && formData.password.trim() !== "") {
          updateData.password = formData.password
        }

        await authService.updateUser(selectedUser.id, updateData)
        alert("Usuario actualizado exitosamente")
      } else {
        // Crear nuevo usuario
        if (!formData.password || formData.password.trim() === "") {
          alert("La contraseña es obligatoria para nuevos usuarios")
          return
        }

        // Asegurar que storeId esté definido
        const storeId = formData.storeId || currentUser?.storeId || currentUser?.store?.id
        if (!storeId) {
          alert("Error: No se pudo obtener el ID de la tienda. Por favor, asegúrate de estar asociado a una tienda.")
          return
        }

        const registerData: RegisterData = {
          username: formData.username || "",
          fullName: formData.fullName || "",
          email: formData.email || "",
          password: formData.password || "",
          role: formData.role || "EMPLOYEE",
          storeId: storeId,
        } as RegisterData;

        console.log("📤 Creando usuario con datos:", {
          ...registerData,
          password: "***",
          storeId: storeId,
        });

        const result = await authService.register(registerData)
        console.log("✅ Usuario creado exitosamente:", {
          id: result.id,
          username: result.username,
          storeId: result.storeId || result.store?.id,
        })
        alert("Usuario creado exitosamente")
      }

      setIsDialogOpen(false)
      await fetchUsers()
    } catch (err: any) {
      alert(`Error al guardar usuario: ${err.message || "Error desconocido"}`)
    }
  }

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase()
    return (
      user.username.toLowerCase().includes(search) ||
      user.fullName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    )
  })

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Gestión de Usuarios
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Administra los usuarios y empleados del sistema
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar usuarios por nombre, usuario o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 border-2 focus:border-primary transition-colors"
        />
      </div>

      {/* Tabla de usuarios */}
      <Card className="border-2 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2">
                  <TableHead className="min-w-[120px]">Usuario</TableHead>
                  <TableHead className="min-w-[150px]">Nombre Completo</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[180px]">Email</TableHead>
                  <TableHead className="min-w-[100px]">Rol</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[150px]">Tienda</TableHead>
                  <TableHead className="text-right min-w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Cargando usuarios...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-destructive py-8">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors border-b">
                      <TableCell className="font-semibold text-base">{user.username}</TableCell>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                          {user.role === "ADMIN" ? (
                            <>
                              <Shield className="mr-1 h-3 w-3" />
                              Admin
                            </>
                          ) : (
                            <>
                              <Users className="mr-1 h-3 w-3" />
                              Empleado
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {user.store?.name || user.storeId || "Sin tienda"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {user.id !== currentUser?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                              className="hover:bg-destructive/10 hover:text-destructive transition-all hover:scale-110"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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

      {/* Dialog de usuario */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {selectedUser ? "Editar Usuario" : "Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              {selectedUser
                ? "Actualiza la información del usuario"
                : "Crea un nuevo usuario en el sistema"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-semibold">
                  Usuario *
                </Label>
                <Input
                  id="username"
                  value={formData.username || ""}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="h-11 border-2 focus:border-primary transition-colors"
                  disabled={!!selectedUser}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-semibold">
                  Nombre Completo *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-11 border-2 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold">
                  {selectedUser ? "Nueva Contraseña (dejar vacío para no cambiar)" : "Contraseña *"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-11 border-2 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="font-semibold">
                  Rol *
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "ADMIN" | "EMPLOYEE") =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger className="h-11 border-2 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Empleado</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeId" className="font-semibold">
                Tienda
              </Label>
              <Input
                id="storeId"
                type="number"
                value={formData.storeId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    storeId: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="ID de la tienda (opcional)"
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="transition-all hover:scale-105"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              {selectedUser ? "Actualizar" : "Crear"} Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

