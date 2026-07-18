import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import ProductClient from "./ProductClient"

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      brand: true,
      inventory: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your store inventory, pricing, and details.
          </p>
        </div>
        <Link href="/products/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </Link>
      </div>

      <ProductClient 
        initialProducts={products} 
        categories={categories}
        brands={brands}
      />
    </div>
  )
}
