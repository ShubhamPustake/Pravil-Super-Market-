"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Trash2, Filter, Download, X, Loader2 } from "lucide-react"
import { deleteProduct, updateProduct } from "@/app/actions/products"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

type ProductData = any // Using any for brevity since Prisma types can be complex here
type Category = { id: string, name: string }
type Brand = { id: string, name: string }

export default function ProductClient({ 
  initialProducts,
  categories,
  brands
}: { 
  initialProducts: ProductData[]
  categories: Category[]
  brands: Brand[]
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [brandFilter, setBrandFilter] = useState("")
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      startTransition(async () => {
        await deleteProduct(id)
      })
    }
  }

  const filteredProducts = initialProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.barcode && p.barcode.includes(searchTerm)) ||
                          (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = categoryFilter === "" || p.categoryId === categoryFilter
    const matchesBrand = brandFilter === "" || p.brandId === brandFilter

    return matchesSearch && matchesCategory && matchesBrand
  })

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingProduct) return
    setIsUpdating(true)
    const formData = new FormData(e.currentTarget)
    await updateProduct(editingProduct.id, formData)
    setIsUpdating(false)
    setEditingProduct(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-md border shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products by name, SKU, or barcode..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select 
            className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Brand Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select 
            className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="">All Brands</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        
        <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
           <Download className="h-4 w-4"/> Export
        </Button>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Purchase Price</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No products found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    {product.name}
                    {product.sku && <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>}
                  </TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>{product.brand?.name || '-'}</TableCell>
                  <TableCell>₹{product.purchasePrice.toFixed(2)}</TableCell>
                  <TableCell>₹{product.sellingPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      (product.inventory?.availableStock || 0) <= product.minimumStock 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {(product.inventory?.availableStock || 0).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 border-green-200 text-green-700 hover:bg-green-50"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 border-red-200 text-red-700 hover:bg-red-50"
                      disabled={isPending}
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Edit Product</h2>
              <Button variant="ghost" size="icon" onClick={() => setEditingProduct(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Name *</label>
                  <Input name="name" required defaultValue={editingProduct.name} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input name="description" defaultValue={editingProduct.description || ""} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Barcode</label>
                  <Input name="barcode" defaultValue={editingProduct.barcode || ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SKU</label>
                  <Input name="sku" defaultValue={editingProduct.sku || ""} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <select name="categoryId" required defaultValue={editingProduct.categoryId} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Brand</label>
                  <select name="brandId" defaultValue={editingProduct.brandId || ""} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                    <option value="">No Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Purchase Price *</label>
                  <Input name="purchasePrice" type="number" step="any" required defaultValue={editingProduct.purchasePrice} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selling Price *</label>
                  <Input name="sellingPrice" type="number" step="any" required defaultValue={editingProduct.sellingPrice} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">GST (%)</label>
                  <Input name="gst" type="number" step="any" defaultValue={editingProduct.gst === 0 ? '' : editingProduct.gst} placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit *</label>
                  <select name="unit" required defaultValue={editingProduct.unit} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="L">Liters (L)</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Stock</label>
                  <Input name="minimumStock" type="number" step="any" defaultValue={editingProduct.minimumStock === 0 ? '' : editingProduct.minimumStock} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Stock</label>
                  <Input name="maximumStock" type="number" step="any" defaultValue={editingProduct.maximumStock === 0 ? '' : editingProduct.maximumStock} placeholder="0" />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isUpdating}>
                  {isUpdating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
