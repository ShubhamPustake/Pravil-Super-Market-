"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateSale } from "@/app/actions/sales"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"

type Product = { id: string; name: string; sellingPrice: number; unit: string; category?: { name: string }; inventory?: { availableStock: number }; variants?: any[] }

function ProductSearch({ products, value, onChange }: { products: Product[], value: string, onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [focusedIndex, setFocusedIndex] = useState(0)

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  const selected = products.find(p => p.id === value)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault() 
      if (open && filtered.length > 0) {
        const p = filtered[focusedIndex]
        onChange(p.id)
        setOpen(false)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative w-full">
      <Input 
        type="text" 
        placeholder="Search product..." 
        value={open ? search : (selected?.name || "")}
        onChange={e => { setSearch(e.target.value); setOpen(true); setFocusedIndex(0); }}
        onFocus={() => { setOpen(true); setSearch("") }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onKeyDown={handleKeyDown}
        className="w-full h-9 text-sm"
      />
      {open && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-900 border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {filtered.length === 0 ? <div className="p-2 text-sm text-muted-foreground">No products found.</div> : null}
          {filtered.map((p: any, idx: number) => {
            const stock = p.inventory?.availableStock || 0
            return (
              <div 
                key={p.id}
                className={`p-2 text-sm cursor-pointer border-b last:border-0 hover:bg-slate-100 dark:hover:bg-slate-800 
                  ${focusedIndex === idx ? 'bg-slate-100 dark:bg-slate-800' : ''}
                  ${p.id === value ? 'bg-slate-50 dark:bg-slate-800 font-medium' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(p.id)
                  setOpen(false)
                }}
                onMouseEnter={() => setFocusedIndex(idx)}
              >
                <div>{p.name}</div>
                <div className="text-xs text-muted-foreground">{stock} in stock</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function EditSaleClient({ sale }: { sale: any }) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const initialItems = sale.items.map((i: any) => ({
    productId: i.productId,
    quantity: i.quantity,
    sellingPrice: i.sellingPrice,
    discount: i.discount,
    finalPrice: i.finalPrice
  }))
  
  const [items, setItems] = useState(initialItems)
  const [paymentMethod, setPaymentMethod] = useState(sale.paymentMethod)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(setProducts).catch(() => {})
  }, [])

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1, sellingPrice: 0, discount: 0, finalPrice: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const calculateTotal = () => items.reduce((acc: number, item: any) => acc + item.finalPrice, 0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    const validItems = items.filter((i: any) => i.productId !== "")
    if (validItems.length === 0) {
      setError("Add at least one product.")
      setIsSubmitting(false)
      return
    }

    const response = await updateSale(sale.id, {
      totalAmount: calculateTotal() - (parseFloat(formData.get("globalDiscount") as string) || 0),
      discount: parseFloat(formData.get("globalDiscount") as string) || 0,
      paymentMethod: paymentMethod,
      customerName: formData.get("customerName") as string,
      customerPhone: formData.get("customerPhone") as string,
      status: paymentMethod === "UDHAR" ? "UNPAID" : "PAID",
      notes: formData.get("notes") as string,
      items: validItems
    })

    if (response && !response.success) {
      setError((response as any).error || "An error occurred.")
      setIsSubmitting(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link href="/sales">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Sale #{sale.id.slice(-8)}</h1>
          <p className="text-muted-foreground">Modify completed sale. Inventory will be automatically reconciled.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-md border border-red-200 dark:border-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm p-6 overflow-visible">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> Cart Items</h2>
            <Button type="button" onClick={handleAddItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>

          <div className="overflow-x-auto w-full pb-48">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 min-w-[250px]">Product *</th>
                  <th className="px-4 py-3 w-32">Qty *</th>
                  <th className="px-4 py-3 w-32">Price (₹)</th>
                  <th className="px-4 py-3 w-32">Discount (₹)</th>
                  <th className="px-4 py-3 w-32">Total (₹)</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, index: number) => {
                  const selectedProduct = products.find(p => p.id === item.productId)
                  const availableStock = selectedProduct?.inventory?.availableStock || 0
                  
                  return (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3">
                      <ProductSearch 
                        products={products}
                        value={item.productId}
                        onChange={(newProductId) => {
                          const newItems = [...items]
                          newItems[index].productId = newProductId
                          const prod = products.find(p => p.id === newProductId)
                          if (prod) newItems[index].sellingPrice = prod.sellingPrice
                          newItems[index].finalPrice = (newItems[index].quantity * newItems[index].sellingPrice) - newItems[index].discount
                          setItems(newItems)
                        }}
                      />
                      {selectedProduct && (
                        <p className="text-xs mt-1 text-muted-foreground">
                          Current Stock: <span className="font-bold text-green-600">{availableStock}</span>
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Input 
                        type="number" step="any" required min="0.001"
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].quantity = parseFloat(e.target.value) || 0
                          newItems[index].finalPrice = (newItems[index].quantity * newItems[index].sellingPrice) - newItems[index].discount
                          setItems(newItems)
                        }}
                      />
                      {selectedProduct && selectedProduct.unit?.toLowerCase() === 'kg' && (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number"
                              placeholder="Enter grams"
                              className="h-7 text-xs w-24 bg-slate-50 dark:bg-slate-800"
                              onChange={(e) => {
                                const grams = parseFloat(e.target.value)
                                if (!isNaN(grams) && grams > 0) {
                                  const qtyValue = grams / 1000
                                  const newItems = [...items]
                                  newItems[index].quantity = qtyValue
                                  newItems[index].finalPrice = (qtyValue * newItems[index].sellingPrice) - newItems[index].discount
                                  setItems(newItems)
                                }
                              }}
                            />
                            <span className="text-xs text-muted-foreground font-medium">grams</span>
                          </div>
                          {['pulses', 'rice', 'wheat', 'rava', 'poha'].some(c => selectedProduct.category?.name.toLowerCase().includes(c)) && (
                            <div className="flex flex-wrap gap-1">
                              {[50, 100, 250, 500, 750].map((weight: any) => {
                                const qtyValue = weight / 1000
                                return (
                                  <Button 
                                    key={weight} type="button" variant="outline" size="sm" 
                                    className="h-6 px-1.5 text-[10px] bg-slate-100 dark:bg-slate-800"
                                    onClick={() => {
                                      const newItems = [...items]
                                      newItems[index].quantity = qtyValue
                                      newItems[index].finalPrice = (qtyValue * newItems[index].sellingPrice) - newItems[index].discount
                                      setItems(newItems)
                                    }}
                                  >
                                    {weight}g
                                  </Button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {selectedProduct.variants.map((variant: any) => (
                            <div key={variant.id} className="flex items-center gap-2">
                              <Input 
                                type="number"
                                placeholder={`Enter ${variant.unitName}s`}
                                className="h-7 text-xs w-24 bg-blue-50 dark:bg-slate-800 border-blue-200"
                                onChange={(e) => {
                                  const bulkAmount = parseFloat(e.target.value)
                                  if (!isNaN(bulkAmount) && bulkAmount > 0) {
                                    const qtyValue = bulkAmount * variant.conversionRate
                                    const newItems = [...items]
                                    newItems[index].quantity = qtyValue
                                    newItems[index].finalPrice = (qtyValue * newItems[index].sellingPrice) - newItems[index].discount
                                    setItems(newItems)
                                  }
                                }}
                              />
                              <span className="text-xs text-muted-foreground font-medium">{variant.unitName}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Input 
                        type="number" step="any" required min="0"
                        value={item.sellingPrice === 0 ? '' : item.sellingPrice}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].sellingPrice = parseFloat(e.target.value) || 0
                          newItems[index].finalPrice = (newItems[index].quantity * newItems[index].sellingPrice) - newItems[index].discount
                          setItems(newItems)
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input 
                        type="number" step="0.01"
                        value={item.discount === 0 ? '' : item.discount}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].discount = parseFloat(e.target.value) || 0
                          newItems[index].finalPrice = (newItems[index].quantity * newItems[index].sellingPrice) - newItems[index].discount
                          setItems(newItems)
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-green-600">
                      <Input 
                        type="number" step="any" required min="0"
                        className="font-bold text-green-600 dark:text-green-400 border-green-200 focus-visible:ring-green-500"
                        value={item.finalPrice === 0 ? '' : Number(item.finalPrice.toFixed(2))}
                        onChange={(e) => {
                          const newItems = [...items]
                          const newFinalPrice = parseFloat(e.target.value) || 0
                          newItems[index].finalPrice = newFinalPrice
                          newItems[index].discount = (newItems[index].quantity * newItems[index].sellingPrice) - newFinalPrice
                          setItems(newItems)
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm p-6 grid gap-6 md:grid-cols-2">
          <h2 className="text-xl font-semibold md:col-span-2">Update Sale</h2>
          
          <div className="grid gap-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <select 
              id="paymentMethod" 
              name="paymentMethod" 
              required 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI / QR Code</option>
              <option value="UDHAR">Udhar (Credit)</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="globalDiscount">Additional Discount on Bill (₹)</Label>
            <Input id="globalDiscount" name="globalDiscount" type="number" step="0.01" defaultValue={sale.discount || 0} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="customerName">Customer Name {paymentMethod === "UDHAR" && "*"}</Label>
            <Input id="customerName" name="customerName" required={paymentMethod === "UDHAR"} defaultValue={sale.customerName || ""} placeholder={paymentMethod === "UDHAR" ? "Required for Udhar" : "Optional customer name"} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customerPhone">Customer Phone</Label>
            <Input id="customerPhone" name="customerPhone" defaultValue={sale.customerPhone || ""} placeholder="Optional phone number" />
          </div>

          <div className={`grid gap-2 ${paymentMethod === "UDHAR" ? 'md:col-span-2' : 'md:col-span-2'}`}>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input id="notes" name="notes" defaultValue={sale.notes || ""} />
          </div>

          <div className="md:col-span-2 flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900 rounded-lg mt-2">
            <span className="text-xl font-medium">Grand Total:</span>
            <span className="text-3xl font-bold text-blue-700 dark:text-blue-500">₹{calculateTotal().toFixed(2)}</span>
          </div>

          <div className="md:col-span-2 mt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto md:float-right h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
