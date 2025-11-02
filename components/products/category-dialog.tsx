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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestionar Categorías</DialogTitle>
          <DialogDescription>Organiza tus productos en categorías</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
            <h3 className="font-medium">{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</h3>

            <div className="space-y-2">
              <Label htmlFor="category-name">Nombre *</Label>
              <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description">Descripción</Label>
              <Textarea
                id="category-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">{editingCategory ? "Actualizar" : "Agregar"}</Button>
              {editingCategory && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>

          <div className="space-y-2">
            <h3 className="font-medium">Categorías Existentes</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && <p className="text-sm text-muted-foreground">No hay categorías creadas</p>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
