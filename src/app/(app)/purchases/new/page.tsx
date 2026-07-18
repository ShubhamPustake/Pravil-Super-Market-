"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createPurchase } from "@/app/actions/purchases"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Upload, Loader2, Sparkles, X } from "lucide-react"
import { createQuickProduct } from "@/app/actions/products"

type Product = { id: string; name: string; purchasePrice: number; sellingPrice: number }
type Supplier = { id: string; name: string }
type Category = { id: string; name: string }
type Brand = { id: string; name: string }

export default function NewPurchasePage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [items, setItems] = useState([{ productId: "", unmatchedName: "", quantity: 1, purchasePrice: 0, sellingPrice: 0, gst: 0, finalCost: 0 }])
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  
  // Quick Add Modal State
  const [quickAddIndex, setQuickAddIndex] = useState<number | null>(null)
  const [quickAddLoading, setQuickAddLoading] = useState(false)

  // Mock fetch for now - in production use SWR or React Query
  useEffect(() => {
    fetch('/api/suppliers').then(res => res.json()).then(setSuppliers).catch(() => {})
    fetch('/api/products').then(res => res.json()).then(setProducts).catch(() => {})
    fetch('/api/categories').then(res => res.json()).then(setCategories).catch(() => {})
    fetch('/api/brands').then(res => res.json()).then(setBrands).catch(() => {})
  }, [])

  const handleAddItem = () => {
    setItems([...items, { productId: "", unmatchedName: "", quantity: 1, purchasePrice: 0, sellingPrice: 0, gst: 0, finalCost: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const calculateTotal = () => items.reduce((acc, item) => acc + item.finalCost, 0)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    setScanError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/extract-invoice", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse invoice")
      }

      // Map AI items to our products
      const newItems = data.items.map((aiItem: any) => {
        // Try to find a matching product by name (basic fuzzy match)
        const matchedProduct = products.find(p => 
          p.name.toLowerCase().includes(aiItem.productName.toLowerCase()) || 
          aiItem.productName.toLowerCase().includes(p.name.toLowerCase())
        )

        return {
          productId: matchedProduct?.id || "",
          unmatchedName: matchedProduct ? "" : aiItem.productName,
          quantity: aiItem.quantity || 1,
          purchasePrice: aiItem.purchasePrice || 0,
          sellingPrice: aiItem.sellingPrice || matchedProduct?.sellingPrice || 0,
          gst: aiItem.gst || 0,
          finalCost: (aiItem.quantity || 1) * (aiItem.purchasePrice || 0) * (1 + (aiItem.gst || 0) / 100)
        }
      })

      if (newItems.length > 0) {
        setItems(newItems)
      }
      
    } catch (error: any) {
      setScanError(error.message)
    } finally {
      setIsScanning(false)
      // Reset input
      e.target.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    await createPurchase({
      supplierId: formData.get("supplierId") as string,
      invoiceNumber: formData.get("invoiceNumber") as string,
      transportCost: parseFloat(formData.get("transportCost") as string) || 0,
      discount: parseFloat(formData.get("discount") as string) || 0,
      totalCost: calculateTotal() + (parseFloat(formData.get("transportCost") as string) || 0) - (parseFloat(formData.get("discount") as string) || 0),
      items: items.filter(i => i.productId !== "")
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link href="/purchases">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Purchase Entry</h1>
          <p className="text-muted-foreground">Record incoming stock and invoices.</p>
        </div>
        
        <div className="ml-auto">
          <input 
            type="file" 
            id="invoice-upload" 
            className="hidden" 
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
          />
          <Label 
            htmlFor="invoice-upload" 
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 cursor-pointer bg-blue-600 text-white hover:bg-blue-700 ${isScanning ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {isScanning ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning AI...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4 text-yellow-300" /> Smart AI Scan</>
            )}
          </Label>
        </div>
      </div>

      {scanError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          <strong>AI Error:</strong> {scanError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm p-6 grid gap-6 md:grid-cols-2">
          <h2 className="text-xl font-semibold md:col-span-2">Invoice Details</h2>
          
          <div className="grid gap-2">
            <Label htmlFor="supplierId">Supplier *</Label>
            <select id="supplierId" name="supplierId" required className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
              <option value="">Select Supplier</option>
              {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input id="invoiceNumber" name="invoiceNumber" placeholder="INV-001" />
          </div>
        </div>

        <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Products</h2>
            <Button type="button" onClick={handleAddItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Row
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 min-w-[200px]">Product *</th>
                  <th className="px-4 py-3 w-28">Qty *</th>
                  <th className="px-4 py-3 w-28">Pur. Price (₹) *</th>
                  <th className="px-4 py-3 w-28">Sell Price (₹) *</th>
                  <th className="px-4 py-3 w-24">GST (%)</th>
                  <th className="px-4 py-3 w-32">Total (₹)</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select 
                          required={!item.unmatchedName}
                          className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm ${item.unmatchedName && !item.productId ? 'border-amber-500' : ''}`}
                          value={item.productId}
                          onChange={(e) => {
                            const newItems = [...items]
                            newItems[index].productId = e.target.value
                            const prod = products.find(p => p.id === e.target.value)
                            if (prod) {
                              newItems[index].purchasePrice = prod.purchasePrice
                              newItems[index].sellingPrice = prod.sellingPrice
                              newItems[index].finalCost = newItems[index].quantity * prod.purchasePrice * (1 + newItems[index].gst / 100)
                            }
                            setItems(newItems)
                          }}
                        >
                          <option value="">Select Product</option>
                          {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        {item.unmatchedName && !item.productId && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 whitespace-nowrap"
                            onClick={() => setQuickAddIndex(index)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add "{item.unmatchedName}"
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Input 
                        type="number" step="any" required min="0.001" 
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].quantity = parseFloat(e.target.value) || 0
                          newItems[index].finalCost = newItems[index].quantity * newItems[index].purchasePrice * (1 + newItems[index].gst / 100)
                          setItems(newItems)
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input 
                        type="number" step="any" required
                        value={item.purchasePrice === 0 ? '' : item.purchasePrice}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].purchasePrice = parseFloat(e.target.value) || 0
                          newItems[index].finalCost = newItems[index].quantity * newItems[index].purchasePrice * (1 + newItems[index].gst / 100)
                          setItems(newItems)
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input 
                        type="number" step="any" required
                        value={item.sellingPrice === 0 ? '' : item.sellingPrice}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].sellingPrice = parseFloat(e.target.value) || 0
                          setItems(newItems)
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input 
                        type="number" step="0.1"
                        value={item.gst === 0 ? '' : item.gst}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].gst = parseFloat(e.target.value) || 0
                          newItems[index].finalCost = newItems[index].quantity * newItems[index].purchasePrice * (1 + newItems[index].gst / 100)
                          setItems(newItems)
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ₹{item.finalCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm p-6 grid gap-6 md:grid-cols-2">
          <h2 className="text-xl font-semibold md:col-span-2">Payment Summary</h2>
          
          <div className="grid gap-2">
            <Label htmlFor="transportCost">Transport/Misc Cost (₹)</Label>
            <Input id="transportCost" name="transportCost" type="number" step="0.01" placeholder="0" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="discount">Discount (₹)</Label>
            <Input id="discount" name="discount" type="number" step="0.01" placeholder="0" />
          </div>

          <div className="md:col-span-2 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg mt-2">
            <span className="text-lg font-medium">Total Cost:</span>
            <span className="text-2xl font-bold text-green-600">₹{calculateTotal().toFixed(2)}</span>
          </div>

          <div className="md:col-span-2 mt-4 pt-4 border-t flex justify-end">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Complete Purchase & Update Stock
            </Button>
          </div>
        </div>
      </form>

      {/* Quick Add Product Modal */}
      {quickAddIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Quick Add Product</h3>
              <Button variant="ghost" size="icon" onClick={() => setQuickAddIndex(null)}><X className="h-4 w-4"/></Button>
            </div>
            <form 
              onSubmit={async (e) => {
                e.preventDefault()
                setQuickAddLoading(true)
                try {
                  const fd = new FormData(e.currentTarget)
                  const newProduct = await createQuickProduct({
                    name: fd.get("name") as string,
                    categoryId: fd.get("categoryId") as string,
                    brandId: fd.get("brandId") as string,
                    purchasePrice: parseFloat(fd.get("purchasePrice") as string),
                    sellingPrice: parseFloat(fd.get("sellingPrice") as string),
                    unit: fd.get("unit") as string,
                    gst: parseFloat(fd.get("gst") as string) || 0
                  })
                  
                  // Update local products list
                  setProducts([...products, newProduct as Product])
                  
                  // Update the specific row
                  const newItems = [...items]
                  newItems[quickAddIndex].productId = newProduct.id
                  newItems[quickAddIndex].unmatchedName = ""
                  setItems(newItems)
                  
                  setQuickAddIndex(null)
                } catch (err) {
                  alert("Failed to create product")
                } finally {
                  setQuickAddLoading(false)
                }
              }}
              className="p-4 grid gap-4"
            >
              <div className="grid gap-2">
                <Label>Product Name</Label>
                <Input name="name" required defaultValue={items[quickAddIndex].unmatchedName} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category *</Label>
                  <select name="categoryId" required className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-transparent">
                    <option value="">Select Category</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Brand</Label>
                  <select name="brandId" className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-transparent">
                    <option value="">No Brand</option>
                    {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Unit *</Label>
                  <select name="unit" required defaultValue="pcs" className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-transparent">
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="L">Liters (L)</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>GST (%)</Label>
                  <Input name="gst" type="number" step="0.1" defaultValue={items[quickAddIndex].gst === 0 ? '' : items[quickAddIndex].gst} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Purchase Price (₹)</Label>
                  <Input name="purchasePrice" type="number" step="any" required defaultValue={items[quickAddIndex].purchasePrice === 0 ? '' : items[quickAddIndex].purchasePrice} placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label>Selling Price (₹) *</Label>
                  <Input name="sellingPrice" type="number" step="any" required defaultValue={items[quickAddIndex].purchasePrice * 1.2 === 0 ? '' : items[quickAddIndex].purchasePrice * 1.2} placeholder="0" />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setQuickAddIndex(null)}>Cancel</Button>
                <Button type="submit" disabled={quickAddLoading} className="bg-green-600 hover:bg-green-700">
                  {quickAddLoading ? "Saving..." : "Create Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
