"use client"

import { useState, useTransition } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Trash2, Edit, X } from "lucide-react"
import { deleteSale } from "@/app/actions/sales"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SalesClient({ sales }: { sales: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewingSale, setViewingSale] = useState<any | null>(null)

  const filteredSales = sales.filter((sale) => 
    sale.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this sale? This will revert the inventory and cannot be undone.")) {
      setDeletingId(id)
      startTransition(async () => {
        await deleteSale(id)
        setDeletingId(null)
      })
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by Sale ID..."
            className="pl-8 bg-white dark:bg-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-900 overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Sale ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No sales recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale: any) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">
                    {new Date(sale.saleDate).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs uppercase font-mono">{sale.id.slice(-8)}</TableCell>
                  <TableCell>{sale.customerName || <span className="text-muted-foreground italic">Walk-in</span>}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold uppercase">
                      {sale.paymentMethod}
                    </span>
                  </TableCell>
                  <TableCell>{sale._count.items}</TableCell>
                  <TableCell className="font-bold text-green-600">₹{sale.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setViewingSale(sale)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Link 
                      href={`/sales/${sale.id}/edit`}
                      className="inline-flex items-center justify-center shrink-0 h-8 w-8 rounded-[min(var(--radius-md),10px)] ml-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                        <Edit className="h-4 w-4" />
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-2"
                      disabled={isPending && deletingId === sale.id}
                      onClick={() => handleDelete(sale.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {viewingSale && (
        <Dialog open={!!viewingSale} onOpenChange={(open) => !open && setViewingSale(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Sale Details: {viewingSale.id.slice(-8).toUpperCase()}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">Date</div>
                  <div className="font-medium">{new Date(viewingSale.saleDate).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Customer</div>
                  <div className="font-medium">{viewingSale.customerName || 'Walk-in'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Payment</div>
                  <div className="font-medium uppercase">{viewingSale.paymentMethod}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total Amount</div>
                  <div className="font-bold text-green-600">₹{viewingSale.totalAmount.toFixed(2)}</div>
                </div>
              </div>

              {viewingSale.notes && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 rounded-md text-sm">
                  <strong>Notes:</strong> {viewingSale.notes}
                </div>
              )}

              <h4 className="font-semibold mt-2">Items Purchased</h4>
              <div className="border rounded-md overflow-x-auto max-h-[40vh] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingSale.items?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          {item.variant ? (
                            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs text-blue-800 dark:text-blue-400">
                              {item.variant.unitName}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">{item.product?.unit || 'Base'}</span>
                          )}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.sellingPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">₹{item.finalPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setViewingSale(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
