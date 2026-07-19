"use client"

import { useState, useTransition } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Edit, Trash2, X, Loader2 } from "lucide-react"
import { deleteSupplier, updateSupplier } from "@/app/actions/suppliers"

export default function SupplierClient({ suppliers }: { suppliers: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const filteredSuppliers = suppliers.filter((supplier) => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.contact && supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      setDeletingId(id)
      startTransition(async () => {
        const response = await deleteSupplier(id)
        if (response && response.error) {
          alert(response.error)
        }
        setDeletingId(null)
      })
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingSupplier) return
    setIsUpdating(true)
    const formData = new FormData(e.currentTarget)
    const response = await updateSupplier(editingSupplier.id, formData)
    setIsUpdating(false)
    if (response && response.error) {
       alert(response.error)
    } else {
       setEditingSupplier(null)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search suppliers..."
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
              <TableHead>Supplier Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>GST Number</TableHead>
              <TableHead>Total Purchases</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No suppliers found. Add a supplier.
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier: any) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contact || 'N/A'}</TableCell>
                  <TableCell>{supplier.gst || 'N/A'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold">
                      {supplier._count.purchases} orders
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setEditingSupplier(supplier)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                      disabled={isPending && deletingId === supplier.id}
                      onClick={() => handleDelete(supplier.id)}
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

      {/* Edit Supplier Modal */}
      {editingSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Supplier</h2>
              <Button variant="ghost" size="icon" onClick={() => setEditingSupplier(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier Name *</label>
                <Input name="name" required defaultValue={editingSupplier.name} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Details</label>
                <Input name="contact" defaultValue={editingSupplier.contact || ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">GST Number</label>
                <Input name="gst" defaultValue={editingSupplier.gst || ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input name="address" defaultValue={editingSupplier.address || ""} />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingSupplier(null)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
