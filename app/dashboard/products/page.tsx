"use client"

import { useState, useMemo } from "react"
import { useProducts } from "@/hooks/use-api"
import { useCategories } from "@/hooks/use-categories"
import { useAuthContext } from "@/lib/auth-context"
import { Product } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { ProductDialog } from "@/components/products/product-dialog"
import { CategoryDialog } from "@/components/products/category-dialog"
import { StockDialog } from "@/components/products/stock-dialog"

export default function ProductsPage() {
  const { user } = useAuthContext()
  const { products, deleteProduct, fetchProducts } = useProducts(user?.storeId)
  const { categories } = useCategories(user?.storeId)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchTerm))
      const matchesCategory = categoryFilter === "all" || product.categoryId === Number(categoryFilter)
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, categoryFilter])

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsProductDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteProduct(id)
        await fetchProducts()
      } catch (error: any) {
        console.error("❌ Error al eliminar producto:", error);
        alert(`Error al eliminar producto: ${error.message || "Error desconocido"}`);
      }
    }
  }

  const handleAddNew = () => {
    setSelectedProduct(null)
    setIsProductDialogOpen(true)
  }

  const handleStockAdjustment = (product: Product) => {
    setSelectedProduct(product)
    setIsStockDialogOpen(true)
  }

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || "Sin categoría"
  }

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { label: "Agotado", variant: "destructive" as const }
    if (product.stock <= product.minStock) return { label: "Stock Bajo", variant: "warning" as const }
    return { label: "En Stock", variant: "default" as const }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu inventario de productos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
            Categorías
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, SKU o código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Código de Barras</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio Venta</TableHead>
              <TableHead className="text-right">Precio Compra</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product)
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.barcode || "N/A"}</TableCell>
                    <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                    <TableCell className="text-right font-medium">${product.sellPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${product.purchasePrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStockAdjustment(product)}
                        className="font-medium"
                      >
                        {product.stock}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ProductDialog product={selectedProduct} open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen} />

      <CategoryDialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen} />

      <StockDialog product={selectedProduct} open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen} />
    </div>
  )
}
