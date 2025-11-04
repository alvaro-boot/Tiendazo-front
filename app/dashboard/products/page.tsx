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
        // La recarga ya se hace automáticamente en deleteProduct
        // No es necesario llamar fetchProducts() de nuevo
      } catch (error: any) {
        console.error("❌ Error al eliminar producto:", error);
        alert(`Error al eliminar producto: ${error.message || "Error desconocido"}`);
        // Recargar productos incluso si hay error para asegurar sincronización
        await fetchProducts()
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header mejorado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Productos
          </h1>
          <p className="text-muted-foreground mt-2">Gestiona tu inventario de productos</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsCategoryDialogOpen(true)}
            className="transition-all hover:scale-105"
          >
            Categorías
          </Button>
          <Button 
            onClick={handleAddNew}
            className="bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Filtros mejorados */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 border-2 focus:border-primary transition-colors"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[220px] h-11 border-2">
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

      {/* Tabla mejorada - Responsive */}
      <div className="rounded-xl border-2 bg-card shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Producto</TableHead>
                <TableHead className="hidden sm:table-cell min-w-[120px]">Código de Barras</TableHead>
                <TableHead className="hidden md:table-cell min-w-[100px]">Categoría</TableHead>
                <TableHead className="text-right min-w-[100px]">Precio Venta</TableHead>
                <TableHead className="text-right hidden lg:table-cell min-w-[100px]">Precio Compra</TableHead>
                <TableHead className="text-right min-w-[80px]">Stock</TableHead>
                <TableHead className="hidden md:table-cell min-w-[100px]">Estado</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[110px]">Marketplace</TableHead>
                <TableHead className="text-right min-w-[120px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
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
                    <TableCell className="hidden sm:table-cell font-mono text-sm">{product.barcode || "N/A"}</TableCell>
                    <TableCell className="hidden md:table-cell">{getCategoryName(product.categoryId)}</TableCell>
                    <TableCell className="text-right font-medium">${Number(product.sellPrice || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right hidden lg:table-cell">${Number(product.purchasePrice || 0).toFixed(2)}</TableCell>
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
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {product.isPublic ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          Público
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Privado</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(product)}
                          className="hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(product.id)}
                          className="hover:bg-destructive/10 hover:text-destructive transition-all hover:scale-110"
                        >
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
      </div>

      <ProductDialog 
        product={selectedProduct} 
        open={isProductDialogOpen} 
        onOpenChange={(open) => {
          setIsProductDialogOpen(open);
          if (!open) {
            // La recarga ya se hace automáticamente en createProduct/updateProduct
            // Solo limpiar el producto seleccionado
            setSelectedProduct(null);
          }
        }} 
      />

      <CategoryDialog 
        open={isCategoryDialogOpen} 
        onOpenChange={(open) => {
          setIsCategoryDialogOpen(open);
          // No es necesario recargar productos aquí, las categorías no afectan la lista de productos
        }} 
      />

      <StockDialog 
        product={selectedProduct} 
        open={isStockDialogOpen} 
        onOpenChange={(open) => {
          setIsStockDialogOpen(open);
          if (!open) {
            // La recarga ya se hace automáticamente en el StockDialog
            // Solo limpiar el producto seleccionado
            setSelectedProduct(null);
          }
        }} 
      />
    </div>
  )
}
