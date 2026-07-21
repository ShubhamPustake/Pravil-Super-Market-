"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, AlertTriangle, Edit, RotateCcw, X, Loader2, Plus, Minus } from "lucide-react"
import { updateInventoryStock } from "@/app/actions/inventory"
import { useTransition } from "react"
import React from "react"

export default function InventoryClient({ initialInventory }: { initialInventory: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingInv, setEditingInv] = useState<any>(null)
  const [newStock, setNewStock] = useState("")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
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

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
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
                  <React.Fragment key={inv.id}>
                  <TableRow className={isOutOfStock ? "bg-red-50/50 dark:bg-red-950/20" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {inv.product.variants && inv.product.variants.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-slate-500 hover:text-slate-900"
                            onClick={() => toggleExpand(inv.id)}
                          >
                            {expandedRows.has(inv.id) ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        )}
                        <span>{inv.product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{inv.product.sku || 'N/A'}</TableCell>
                    <TableCell>{inv.product.minimumStock}</TableCell>
                    <TableCell className="font-bold text-lg">
                      {parseFloat((inv.availableStock || 0).toFixed(2))} {inv.product.unit}
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
                  {expandedRows.has(inv.id) && inv.product.variants && inv.product.variants.length > 0 && (
                    <TableRow className="bg-slate-50/50 dark:bg-slate-900/20 border-b-2">
                      <TableCell colSpan={6} className="p-0">
                        <div className="p-4 pl-14 border-l-4 border-emerald-500 my-1 ml-1 bg-white dark:bg-slate-900 rounded-r-md shadow-sm">
                          <h4 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Equivalent Variant Stock</h4>
                          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {inv.product.variants.map((v: any) => {
                              const totalStock = inv.availableStock || 0
                              const fullUnits = v.conversionRate ? Math.floor(totalStock / v.conversionRate) : 0
                              const remainder = v.conversionRate ? totalStock % v.conversionRate : totalStock
                              
                              return (
                                <div key={v.id} className="flex flex-col gap-1 p-3 border rounded-md bg-slate-50 dark:bg-slate-800/50">
                                  <span className="font-medium text-sm text-emerald-700 dark:text-emerald-400">{v.unitName}</span>
                                  <div className="text-xs text-muted-foreground grid gap-y-1 mt-1">
                                    <div className="flex justify-between">
                                      <span>Available:</span> 
                                      <span className="font-bold text-slate-900 dark:text-slate-100">{fullUnits} {v.unitName}s</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Remainder:</span> 
                                      <span className="font-medium text-slate-700 dark:text-slate-300">{remainder > 0 ? `${remainder.toFixed(2)} ${inv.product.unit} loose` : 'None'}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-1 mt-1">
                                      <span>Conversion:</span> 
                                      <span>1 {v.unitName} = {v.conversionRate} {inv.product.unit}</span>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  </React.Fragment>
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
