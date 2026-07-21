"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle, Plus } from "lucide-react"
import { markSaleAsPaid, createSale } from "@/app/actions/sales"
import { useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

type Sale = {
  id: string
  customerName: string | null
  customerPhone: string | null
  saleDate: Date
  totalAmount: number
  paymentMethod: string
  notes: string | null
  status: string
  _count: { items: number }
}

export default function UdharClient({ sales }: { sales: Sale[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isPending, startTransition] = useTransition()
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newUdhar, setNewUdhar] = useState({
    customerName: "",
    customerPhone: "",
    amount: "",
    notes: "",
    saleDate: new Date().toISOString().split('T')[0]
  })
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

  const handleAddUdhar = () => {
    if (!newUdhar.customerName || !newUdhar.amount) {
      alert("Please enter customer name and amount")
      return
    }

    startTransition(async () => {
      await createSale({
        totalAmount: Number(newUdhar.amount),
        discount: 0,
        paymentMethod: "UDHAR",
        status: "UNPAID",
        customerName: newUdhar.customerName,
        customerPhone: newUdhar.customerPhone,
        notes: newUdhar.notes,
        saleDate: newUdhar.saleDate,
        items: []
      })
      setIsAddOpen(false)
      setNewUdhar({ customerName: "", customerPhone: "", amount: "", notes: "", saleDate: new Date().toISOString().split('T')[0] })
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by customer name or phone..."
            className="pl-8 bg-white dark:bg-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="bg-amber-600 hover:bg-amber-700 text-white" />}>
            <Plus className="h-4 w-4 mr-2" /> Add Udhar
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Udhar Entry</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={newUdhar.customerName}
                  onChange={(e) => setNewUdhar({ ...newUdhar, customerName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="saleDate" className="text-right">
                  Date
                </Label>
                <Input
                  id="saleDate"
                  type="date"
                  className="col-span-3"
                  value={newUdhar.saleDate}
                  onChange={(e) => setNewUdhar({ ...newUdhar, saleDate: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  className="col-span-3"
                  value={newUdhar.customerPhone}
                  onChange={(e) => setNewUdhar({ ...newUdhar, customerPhone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount (₹) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  className="col-span-3"
                  value={newUdhar.amount}
                  onChange={(e) => setNewUdhar({ ...newUdhar, amount: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  className="col-span-3"
                  value={newUdhar.notes}
                  onChange={(e) => setNewUdhar({ ...newUdhar, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleAddUdhar} 
                disabled={isPending || !newUdhar.customerName || !newUdhar.amount}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isPending ? "Adding..." : "Add Udhar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                    <div className="flex flex-col">
                      <span>{new Date(sale.saleDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className="text-xs text-muted-foreground">{new Date(sale.saleDate).toLocaleDateString('en-GB', { weekday: 'long' })}</span>
                    </div>
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
                    {sale.status === 'PAID' ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Paid via {sale.paymentMethod}
                      </span>
                    ) : (
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
                    )}
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
