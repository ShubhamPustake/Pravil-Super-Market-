import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, AlertTriangle, FileText } from "lucide-react"

export default async function InventoryPage() {
  const inventory = await prisma.inventory.findMany({
    include: {
      product: true
    },
    orderBy: {
      availableStock: 'asc'
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track real-time stock levels and view low stock alerts.
          </p>
        </div>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" /> Export Stock Report
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by Product Name or SKU..."
            className="pl-8 bg-white dark:bg-slate-900"
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No inventory records found. Add products first.
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((inv: any) => {
                const isLowStock = inv.availableStock <= inv.product.minimumStock
                const isOutOfStock = inv.availableStock === 0

                return (
                  <TableRow key={inv.id} className={isOutOfStock ? "bg-red-50/50 dark:bg-red-950/20" : ""}>
                    <TableCell className="font-medium">{inv.product.name}</TableCell>
                    <TableCell>{inv.product.sku || 'N/A'}</TableCell>
                    <TableCell>{inv.product.minimumStock}</TableCell>
                    <TableCell className="font-bold">
                      {inv.availableStock.toFixed(2)}
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
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
