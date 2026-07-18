import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCategory } from "@/app/actions/categories"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewCategoryPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/categories">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Category</h1>
          <p className="text-muted-foreground">
            Create a new product grouping.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm">
        <form action={createCategory} className="p-6 grid gap-6">
          
          <div className="grid gap-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input id="name" name="name" required placeholder="e.g., Dairy Products" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Brief description of the category" />
          </div>

          <div className="mt-4 pt-4 border-t flex justify-end">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Save Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
