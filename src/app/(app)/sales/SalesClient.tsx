"use client"

import { useState, useTransition } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Trash2, Edit } from "lucide-react"
import { deleteSale } from "@/app/actions/sales"
import Link from "next/link"

export default function SalesClient({ sales }: { sales: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Link href={`/sales/${sale.id}/edit`}>
                      <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 ml-2">
                        <Edit className="h-4 w-4" />
                      </Button>
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
    </>
  )
}
