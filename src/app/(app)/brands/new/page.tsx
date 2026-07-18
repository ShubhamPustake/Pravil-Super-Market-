import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrand } from "@/app/actions/brands"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NewBrandPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/brands">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Brand</h1>
          <p className="text-muted-foreground">
            Create a new brand and assign it to product categories.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm">
        <form action={createBrand} className="p-6 grid gap-6">
          
          <div className="grid gap-2">
            <Label htmlFor="name">Brand Name *</Label>
            <Input id="name" name="name" required placeholder="e.g., Amul" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Brief description of the brand" />
          </div>

          <div className="grid gap-3 border-t pt-4">
            <Label>Associated Categories</Label>
            <p className="text-xs text-muted-foreground mb-2">Select which categories this brand produces items for.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`cat-${category.id}`}
                    name="categories"
                    value={category.id}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <Label htmlFor={`cat-${category.id}`} className="font-normal cursor-pointer">
                    {category.name}
                  </Label>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-red-500 col-span-full">No categories exist yet. Please create categories first.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-end">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Save Brand
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
