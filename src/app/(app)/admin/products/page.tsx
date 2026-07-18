import { Button } from "@/components/ui/button"
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import prisma from "@/lib/prisma"

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      inventory: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // For presentation, mock data if DB is empty
  const displayProducts = products.length > 0 ? products : [
    { id: "PRD-1", name: "Organic Extra Virgin Olive Oil", category: { name: "Pantry" }, price: 14.99, stock: { availableStock: 150, reservedStock: 5 }, isActive: true },
    { id: "PRD-2", name: "Whole Wheat Bread", category: { name: "Bakery" }, price: 2.49, stock: { availableStock: 40, reservedStock: 2 }, isActive: true },
    { id: "PRD-3", name: "Farm Fresh Eggs", category: { name: "Dairy" }, price: 3.99, stock: { availableStock: 0, reservedStock: 0 }, isActive: false },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Products</h2>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search products..." className="pl-9" />
          </div>
          <Button variant="outline">Filter</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3 rounded-tl-lg">Product Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock (Avail / Rsv)</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayProducts.map((product: any) => {
                const stock = product.stock?.availableStock || 0
                const reserved = product.stock?.reservedStock || 0
                const isOutOfStock = stock === 0
                
                return (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {product.category?.name || "Uncategorized"}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isOutOfStock ? 'text-red-600' : 'text-slate-800'}`}>
                          {stock}
                        </span>
                        <span className="text-xs text-slate-400">/ {reserved}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
