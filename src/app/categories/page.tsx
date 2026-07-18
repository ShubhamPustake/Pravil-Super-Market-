import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import CategoryClient from "./CategoryClient"

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    },
    include: {
      _count: {
        select: { products: true }
      },
      subCategories: {
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { products: true }
          }
        }
      }
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories and groupings.
          </p>
        </div>
        <Link href="/categories/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
        </Link>
      </div>

      <CategoryClient initialCategories={categories} />
    </div>
  )
}
