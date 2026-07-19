"use client"

import { useState, useTransition } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Trash2 } from "lucide-react"
import { deletePurchase } from "@/app/actions/purchases"

export default function PurchaseClient({ purchases }: { purchases: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredPurchases = purchases.filter((purchase) => 
    (purchase.invoiceNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this purchase? This will remove the inventory items and cannot be undone.")) {
      setDeletingId(id)
      startTransition(async () => {
        const response = await deletePurchase(id)
        if (response && response.error) {
          alert(response.error)
        }
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
            placeholder="Search by Invoice # or Supplier..."
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
              <TableHead>Date</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No purchases recorded yet. Add a new purchase.
                </TableCell>
              </TableRow>
            ) : (
              filteredPurchases.map((purchase: any) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">
                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{purchase.invoiceNumber || 'N/A'}</TableCell>
                  <TableCell>{purchase.supplier.name}</TableCell>
                  <TableCell>{purchase._count.items}</TableCell>
                  <TableCell className="font-bold">₹{purchase.totalCost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-2"
                      disabled={isPending && deletingId === purchase.id}
                      onClick={() => handleDelete(purchase.id)}
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
    </>
  )
}
