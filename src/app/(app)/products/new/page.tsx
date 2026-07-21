import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import NewProductForm from "./NewProductForm"

export default async function NewProductPage() {
  const categories = await prisma.category.findMany()
  const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new product with multiple unit variants in your inventory system.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm">
        <NewProductForm categories={categories} brands={brands} />
      </div>
    </div>
  )
}
