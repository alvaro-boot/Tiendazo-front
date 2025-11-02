"use client"

import type React from "react"

import { useState } from "react"
import { useCategories } from "@/hooks/use-categories"
import { useAuthContext } from "@/lib/auth-context"
import { Category } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Trash2 } from "lucide-react"

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryDialog({ open, onOpenChange }: CategoryDialogProps) {
  const { user } = useAuthContext();
  const { categories, createCategory, updateCategory, deleteCategory, fetchCategories } = useCategories(user?.storeId)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.storeId) {
      alert("Error: No se pudo identificar la tienda");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name, description, storeId: user.storeId })
        setEditingCategory(null)
        await fetchCategories()
      } else {
        await createCategory({ 
          name, 
          description, 
          storeId: user.storeId 
        })
        await fetchCategories()
      }

      setName("")
      setDescription("")
    } catch (error: any) {
      console.error("❌ Error al guardar categoría:", error);
      alert(`Error al guardar categoría: ${error.message || "Error desconocido"}`);
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setDescription(category.description)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta categoría?")) {
      try {
        await deleteCategory(id)
        await fetchCategories()
      } catch (error: any) {
        console.error("❌ Error al eliminar categoría:", error);
        alert(`Error al eliminar categoría: ${error.message || "Error desconocido"}`);
      }
    }
  }

  const handleCancel = () => {
    setEditingCategory(null)
    setName("")
    setDescription("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Gestionar Categorías
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Organiza tus productos en categorías
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border-2 p-6 bg-gradient-to-br from-primary/5 to-transparent shadow-md">
            <h3 className="text-lg font-semibold mb-4">{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</h3>

            <div className="space-y-2">
              <Label htmlFor="category-name" className="font-semibold">Nombre *</Label>
              <Input 
                id="category-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="h-11 border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description" className="font-semibold">Descripción</Label>
              <Textarea
                id="category-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-2 focus:border-primary transition-colors min-h-[100px]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                type="submit"
                className="bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                {editingCategory ? "Actualizar" : "Agregar"}
              </Button>
              {editingCategory && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  className="transition-all hover:scale-105"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categorías Existentes</h3>
            <div className="space-y-3">
              {categories.length === 0 ? (
                <div className="text-center py-8 rounded-xl border-2 border-dashed bg-muted/50">
                  <p className="text-sm text-muted-foreground">No hay categorías creadas aún</p>
                  <p className="text-xs text-muted-foreground mt-1">Crea una categoría arriba para comenzar</p>
                </div>
              ) : (
                categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="group flex items-center justify-between rounded-xl border-2 p-4 hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-base">{category.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{category.description || "Sin descripción"}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(category)}
                        className="hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(category.id)}
                        className="hover:bg-destructive/10 hover:text-destructive transition-all hover:scale-110"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
