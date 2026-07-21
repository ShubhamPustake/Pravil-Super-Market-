"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSale } from "@/app/actions/sales"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, ShoppingBag } from "lucide-react"

type Product = { id: string; name: string; sellingPrice: number; unit: string; category?: { name: string }; inventory?: { availableStock: number }; variants?: any[] }

function ProductSearch({ products, value, onChange }: { products: Product[], value: string, onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [focusedIndex, setFocusedIndex] = useState(0)

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  const selected = products.find(p => p.id === value)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Stop form submission
      if (open && filtered.length > 0) {
        const p = filtered[focusedIndex]
        const stock = p.inventory?.availableStock || 0
        if (stock > 0) {
          onChange(p.id)
          setOpen(false)
        }
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
            const disabled = stock <= 0
            return (
              <div 
                key={p.id}
                className={`p-2 text-sm cursor-pointer border-b last:border-0 
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800'} 
                  ${focusedIndex === idx ? 'bg-slate-100 dark:bg-slate-800' : ''}
                  ${p.id === value ? 'bg-slate-50 dark:bg-slate-800 font-medium' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (disabled) return
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

export default function POSPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [items, setItems] = useState([{ productId: "", quantity: 1, displayQuantity: 1, selectedUnit: "", sellingPrice: 0, discount: 0, finalPrice: 0 }])
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("CASH")

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(setProducts).catch(() => {})
  }, [])

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1, displayQuantity: 1, selectedUnit: "", sellingPrice: 0, discount: 0, finalPrice: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const calculateTotal = () => items.reduce((acc, item) => acc + item.finalPrice, 0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    const validItems = items.filter(i => i.productId !== "")
    if (validItems.length === 0) return setError("Add at least one product.")

    const response = await createSale({
      totalAmount: calculateTotal() - (parseFloat(formData.get("globalDiscount") as string) || 0),
      discount: parseFloat(formData.get("globalDiscount") as string) || 0,
      paymentMethod: paymentMethod,
      customerName: formData.get("customerName") as string,
      customerPhone: formData.get("customerPhone") as string,
      status: paymentMethod === "UDHAR" ? "UNPAID" : "PAID",
      notes: formData.get("notes") as string,
      items: validItems.map(item => {
        const prod = products.find(p => p.id === item.productId)
        let backendQty = item.displayQuantity
        let backendPrice = item.sellingPrice
        let variantId = undefined
        
        if (item.selectedUnit === 'g' || item.selectedUnit === 'ml') {
           backendQty = item.displayQuantity / 1000
        } else if (prod && item.selectedUnit !== prod.unit && item.selectedUnit !== 'pcs') {
           // It must be a variantId
           variantId = item.selectedUnit
           // The action handles multiplying the quantity by the conversionRate for variants
           // So backendQty remains displayQuantity
        }
        
        return {
          productId: item.productId,
          variantId: variantId,
          quantity: backendQty,
          sellingPrice: backendPrice,
          discount: item.discount,
          finalPrice: item.finalPrice
        }
      })
    })

    if (response && !response.success) {
      setError((response as any).error || "An error occurred.")
    } else {
      router.push('/sales')
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
          <h1 className="text-3xl font-bold tracking-tight">Point of Sale (POS)</h1>
          <p className="text-muted-foreground">Record daily customer sales.</p>
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
                {items.map((item, index) => {
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
                          if (prod) {
                            newItems[index].selectedUnit = prod.unit || 'pcs'
                            newItems[index].displayQuantity = 1
                            newItems[index].quantity = 1
                            newItems[index].sellingPrice = prod.sellingPrice
                            newItems[index].finalPrice = prod.sellingPrice - newItems[index].discount
                          }
                          setItems(newItems)
                        }}
                      />
                      {selectedProduct && (
                        <p className="text-xs mt-1 text-muted-foreground">
                          Available: <span className={`font-bold ${availableStock < item.quantity ? 'text-red-600' : 'text-green-600'}`}>{availableStock}</span>
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" step="any" required min="0.001"
                          value={item.displayQuantity === 0 ? '' : item.displayQuantity}
                          onChange={(e) => {
                            const newItems = [...items]
                            const val = parseFloat(e.target.value) || 0
                            newItems[index].displayQuantity = val
                            
                            let qtyForPrice = val
                            if (item.selectedUnit === 'g' || item.selectedUnit === 'ml') {
                              qtyForPrice = val / 1000
                            }
                            
                            newItems[index].finalPrice = (qtyForPrice * newItems[index].sellingPrice) - newItems[index].discount
                            setItems(newItems)
                          }}
                          className="w-20"
                        />
                        {selectedProduct && (
                          <select 
                            className="flex h-9 w-24 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                            value={item.selectedUnit}
                            onChange={(e) => {
                              const newItems = [...items]
                              const unit = e.target.value
                              newItems[index].selectedUnit = unit
                              
                              const variant = selectedProduct.variants?.find((v: any) => v.id === unit)
                              if (variant) {
                                newItems[index].displayQuantity = 1
                                newItems[index].sellingPrice = variant.sellingPrice
                                newItems[index].finalPrice = newItems[index].sellingPrice - newItems[index].discount
                              } else if (unit === 'g' || unit === 'ml') {
                                newItems[index].sellingPrice = selectedProduct.sellingPrice
                                const qtyForPrice = newItems[index].displayQuantity / 1000
                                newItems[index].finalPrice = (qtyForPrice * newItems[index].sellingPrice) - newItems[index].discount
                              } else {
                                newItems[index].sellingPrice = selectedProduct.sellingPrice
                                newItems[index].finalPrice = (newItems[index].displayQuantity * newItems[index].sellingPrice) - newItems[index].discount
                              }
                              
                              setItems(newItems)
                            }}
                          >
                            <option value={selectedProduct.unit || 'pcs'}>{selectedProduct.unit || 'Base Unit'}</option>
                            {selectedProduct.unit?.toLowerCase() === 'kg' && <option value="g">grams (g)</option>}
                            {selectedProduct.unit?.toLowerCase() === 'l' && <option value="ml">ml</option>}
                            {selectedProduct.variants?.map((v: any) => (
                              <option key={v.id} value={v.id}>{v.unitName}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Input 
                        type="number" step="any" required min="0"
                        value={item.sellingPrice === 0 ? '' : item.sellingPrice}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].sellingPrice = parseFloat(e.target.value) || 0
                          let qtyForPrice = newItems[index].displayQuantity
                          if (newItems[index].selectedUnit === 'g' || newItems[index].selectedUnit === 'ml') {
                            qtyForPrice = qtyForPrice / 1000
                          }
                          newItems[index].finalPrice = (qtyForPrice * newItems[index].sellingPrice) - newItems[index].discount
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
                          let qtyForPrice = newItems[index].displayQuantity
                          if (newItems[index].selectedUnit === 'g' || newItems[index].selectedUnit === 'ml') {
                            qtyForPrice = qtyForPrice / 1000
                          }
                          newItems[index].finalPrice = (qtyForPrice * newItems[index].sellingPrice) - newItems[index].discount
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
                          
                          let qtyForPrice = newItems[index].displayQuantity
                          if (newItems[index].selectedUnit === 'g' || newItems[index].selectedUnit === 'ml') {
                            qtyForPrice = qtyForPrice / 1000
                          }
                          // Reverse calculate the discount needed to achieve this final price
                          newItems[index].discount = (qtyForPrice * newItems[index].sellingPrice) - newFinalPrice
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
          <h2 className="text-xl font-semibold md:col-span-2">Checkout</h2>
          
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
            <Input id="globalDiscount" name="globalDiscount" type="number" step="0.01" placeholder="0" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="customerName">Customer Name {paymentMethod === "UDHAR" && "*"}</Label>
            <Input id="customerName" name="customerName" required={paymentMethod === "UDHAR"} placeholder={paymentMethod === "UDHAR" ? "Required for Udhar" : "Optional customer name"} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customerPhone">Customer Phone</Label>
            <Input id="customerPhone" name="customerPhone" placeholder="Optional phone number" />
          </div>

          <div className={`grid gap-2 ${paymentMethod === "UDHAR" ? 'md:col-span-2' : 'md:col-span-2'}`}>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input id="notes" name="notes" placeholder="Customer details or remarks" />
          </div>

          <div className="md:col-span-2 flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900 rounded-lg mt-2">
            <span className="text-xl font-medium">Grand Total:</span>
            <span className="text-3xl font-bold text-green-700 dark:text-green-500">₹{calculateTotal().toFixed(2)}</span>
          </div>

          <div className="md:col-span-2 mt-2">
            <Button type="submit" className="w-full md:w-auto md:float-right h-12 px-8 text-lg bg-green-600 hover:bg-green-700">
              Complete Sale
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
