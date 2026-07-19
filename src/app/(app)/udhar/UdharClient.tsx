"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle } from "lucide-react"
import { markSaleAsPaid } from "@/app/actions/sales"
import { useTransition } from "react"

type Sale = {
  id: string
  customerName: string | null
  customerPhone: string | null
  saleDate: Date
  totalAmount: number
  paymentMethod: string
  notes: string | null
  _count: { items: number }
}

export default function UdharClient({ sales }: { sales: Sale[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isPending, startTransition] = useTransition()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const filteredSales = sales.filter(s => {
    const search = searchTerm.toLowerCase()
    return (
      (s.customerName && s.customerName.toLowerCase().includes(search)) ||
      (s.customerPhone && s.customerPhone.toLowerCase().includes(search)) ||
      (s.id.toLowerCase().includes(search))
    )
  })

  const handleMarkAsPaid = (id: string, method: string) => {
    if (confirm(`Mark this Udhar as paid via ${method}?`)) {
      setProcessingId(id)
      startTransition(async () => {
        await markSaleAsPaid(id, method)
        setProcessingId(null)
      })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by customer name or phone..."
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
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No unpaid records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => (
                <TableRow key={sale.id} className="bg-amber-50/30 dark:bg-amber-950/20">
                  <TableCell className="font-medium">
                    {new Date(sale.saleDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-bold">{sale.customerName || 'Unknown'}</TableCell>
                  <TableCell>{sale.customerPhone || '-'}</TableCell>
                  <TableCell className="font-bold text-amber-600 dark:text-amber-500">
                    ₹{sale.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                    {sale.notes || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        disabled={isPending && processingId === sale.id}
                        onClick={() => handleMarkAsPaid(sale.id, 'CASH')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Cash
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        disabled={isPending && processingId === sale.id}
                        onClick={() => handleMarkAsPaid(sale.id, 'UPI')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> UPI
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
