import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProduct } from "@/app/actions/products"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
            Create a new product in your inventory system.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm">
        <form action={createProduct} className="p-6 grid gap-6 md:grid-cols-2">
          
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" name="name" required placeholder="e.g., Amul Taaza Milk" />
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Brief description of the product" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input id="barcode" name="barcode" placeholder="Scan or enter barcode" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
            <Input id="sku" name="sku" placeholder="Internal product code" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="categoryId">Category *</Label>
            <select 
              id="categoryId" 
              name="categoryId" 
              required
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select Category</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="brandId">Brand</Label>
            <select 
              id="brandId" 
              name="brandId"
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">No Brand</option>
              {brands.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unit">Unit *</Label>
            <select 
              id="unit" 
              name="unit"
              required
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="pcs">Pieces (pcs)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="g">Grams (g)</option>
              <option value="L">Liters (L)</option>
              <option value="box">Box</option>
              <option value="pack">Pack</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="purchasePrice">Purchase Price (₹) *</Label>
            <Input type="number" step="0.01" id="purchasePrice" name="purchasePrice" required placeholder="0.00" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
            <Input type="number" step="0.01" id="sellingPrice" name="sellingPrice" required placeholder="0.00" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gst">GST (%)</Label>
            <Input type="number" step="0.1" id="gst" name="gst" placeholder="0" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="minimumStock">Minimum Stock Alert Level</Label>
            <Input type="number" step="any" id="minimumStock" name="minimumStock" defaultValue="10" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="openingStock">Initial Opening Stock (Quantity)</Label>
            <Input type="number" step="any" id="openingStock" name="openingStock" placeholder="0" />
          </div>

          <div className="grid gap-2 md:col-span-2 mt-4 pt-4 border-t">
            <Button type="submit" className="w-full md:w-auto md:justify-self-end bg-green-600 hover:bg-green-700">
              Save Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
