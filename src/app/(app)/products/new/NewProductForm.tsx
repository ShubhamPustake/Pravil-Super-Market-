"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProduct } from "@/app/actions/products"
import { Plus, Trash } from "lucide-react"

export default function NewProductForm({ categories, brands }: { categories: any[], brands: any[] }) {
  const [variants, setVariants] = useState<any[]>([])

  const addVariant = () => {
    setVariants([...variants, { unitName: "", conversionRate: "", sellingPrice: "", purchasePrice: "", barcode: "" }])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: string) => {
    const newVariants = [...variants]
    newVariants[index][field] = value
    setVariants(newVariants)
  }

  return (
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

      {/* Base Unit Details */}
      <div className="md:col-span-2 mt-2 pt-4 border-t">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">Base Unit Details (Smallest selling unit)</h3>
        <p className="text-sm text-muted-foreground mb-4">This is the default smallest unit you track in inventory (e.g., 1kg loose, 1 pcs).</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="unit">Base Unit (e.g., kg, pcs) *</Label>
            <Input id="unit" name="unit" required placeholder="e.g., kg, pcs, box" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="purchasePrice">Purchase Price (₹) *</Label>
            <Input type="number" step="0.01" id="purchasePrice" name="purchasePrice" required placeholder="0.00" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
            <Input type="number" step="0.01" id="sellingPrice" name="sellingPrice" required placeholder="0.00" />
          </div>
        </div>
      </div>

      {/* Product Variants (Units of Measure) */}
      <div className="md:col-span-2 mt-2 pt-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Other Sizes / Variants</h3>
            <p className="text-sm text-muted-foreground">Add larger sizes (e.g. 5kg Packet, Katta) that contain multiple base units.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus className="h-4 w-4 mr-2" /> Add Variant
          </Button>
        </div>

        {variants.length > 0 && (
          <div className="space-y-4">
            <input type="hidden" name="variants" value={JSON.stringify(variants)} />
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end p-4 border rounded-md relative group">
                <div className="grid gap-2 md:col-span-2">
                  <Label>Unit Name</Label>
                  <Input 
                    required 
                    placeholder="e.g., 5kg Packet, Katta" 
                    value={v.unitName} 
                    onChange={(e) => updateVariant(i, "unitName", e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Base Units Inside</Label>
                  <Input 
                    type="number" step="any" required 
                    placeholder="e.g., 5" 
                    value={v.conversionRate} 
                    onChange={(e) => updateVariant(i, "conversionRate", e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Purchase Price</Label>
                  <Input 
                    type="number" step="0.01" 
                    placeholder="₹ 0.00" 
                    value={v.purchasePrice} 
                    onChange={(e) => updateVariant(i, "purchasePrice", e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Selling Price</Label>
                  <Input 
                    type="number" step="0.01" required 
                    placeholder="₹ 0.00" 
                    value={v.sellingPrice} 
                    onChange={(e) => updateVariant(i, "sellingPrice", e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Barcode (Optional)</Label>
                  <Input 
                    placeholder="Scan..." 
                    value={v.barcode} 
                    onChange={(e) => updateVariant(i, "barcode", e.target.value)} 
                  />
                </div>
                <div className="pb-1">
                  <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeVariant(i)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Other Details */}
      <div className="md:col-span-2 mt-2 pt-4 border-t">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">Other Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="gst">GST (%)</Label>
            <Input type="number" step="0.1" id="gst" name="gst" placeholder="0" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="minimumStock">Min Stock Alert Level</Label>
            <Input type="number" step="any" id="minimumStock" name="minimumStock" defaultValue="10" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="openingStock">Initial Opening Stock (Base Units)</Label>
            <Input type="number" step="any" id="openingStock" name="openingStock" placeholder="0" />
          </div>
        </div>
      </div>

      <div className="grid gap-2 md:col-span-2 mt-4 pt-4 border-t">
        <Button type="submit" className="w-full md:w-auto md:justify-self-end bg-green-600 hover:bg-green-700">
          Save Product
        </Button>
      </div>
    </form>
  )
}
