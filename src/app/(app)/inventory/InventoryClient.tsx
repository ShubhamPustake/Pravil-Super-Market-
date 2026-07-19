"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, AlertTriangle, Edit, RotateCcw, X, Loader2 } from "lucide-react"
import { updateInventoryStock } from "@/app/actions/inventory"
import { useTransition } from "react"

export default function InventoryClient({ initialInventory }: { initialInventory: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingInv, setEditingInv] = useState<any>(null)
  const [newStock, setNewStock] = useState("")
  const [isPending, startTransition] = useTransition()
  
  const filteredInventory = initialInventory.filter(inv => {
    return inv.product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (inv.product.sku && inv.product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  const handleUpdate = async () => {
    if (!editingInv) return
    const stockVal = parseFloat(newStock)
    if (isNaN(stockVal)) return alert("Invalid stock number")
    
    startTransition(async () => {
      const res = await updateInventoryStock(editingInv.id, stockVal)
      if (res.error) alert(res.error)
      else setEditingInv(null)
    })
  }

  const handleReset = async (id: string) => {
    if (window.confirm("Are you sure you want to reset this stock to zero?")) {
      startTransition(async () => {
        const res = await updateInventoryStock(id, 0)
        if (res.error) alert(res.error)
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by Product Name or SKU..."
            className="pl-8 bg-white dark:bg-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Min Stock</TableHead>
              <TableHead>Available Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No inventory records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((inv: any) => {
                const isLowStock = inv.availableStock <= inv.product.minimumStock
                const isOutOfStock = inv.availableStock === 0

                return (
                  <TableRow key={inv.id} className={isOutOfStock ? "bg-red-50/50 dark:bg-red-950/20" : ""}>
                    <TableCell className="font-medium">{inv.product.name}</TableCell>
                    <TableCell>{inv.product.sku || 'N/A'}</TableCell>
                    <TableCell>{inv.product.minimumStock}</TableCell>
                    <TableCell className="font-bold text-lg">
                      {(() => {
                        const stock = inv.availableStock || 0;
                        if (inv.product.bulkUnitName && inv.product.bulkConversionRate) {
                          const bulkQty = Math.floor(stock / inv.product.bulkConversionRate);
                          const looseQty = stock % inv.product.bulkConversionRate;
                          let text = [];
                          if (bulkQty > 0) text.push(`${bulkQty} ${inv.product.bulkUnitName}`);
                          if (looseQty > 0 || bulkQty === 0) text.push(`${parseFloat(looseQty.toFixed(2))} ${inv.product.unit}`);
                          return text.join(" & ");
                        }
                        return `${parseFloat(stock.toFixed(2))} ${inv.product.unit}`;
                      })()}
                    </TableCell>
                    <TableCell>
                      {isOutOfStock ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:text-red-400">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/30 px-2.5 py-0.5 text-xs font-semibold text-orange-800 dark:text-orange-400">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:text-green-400">
                          In Stock
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" size="sm" 
                        onClick={() => { setEditingInv(inv); setNewStock(inv.availableStock.toString()) }}
                        disabled={isPending}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" /> Adjust
                      </Button>
                      <Button 
                        variant="outline" size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50"
                        onClick={() => handleReset(inv.id)}
                        disabled={isPending}
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset to 0
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {editingInv && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Adjust Stock</h2>
              <Button variant="ghost" size="icon" onClick={() => setEditingInv(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Product</p>
                <p className="font-medium">{editingInv.product.name}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Available Stock ({editingInv.product.unit})</label>
                <Input 
                  type="number" step="any"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditingInv(null)}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Adjustment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
