import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, AlertOctagon, Phone, Mail } from "lucide-react"

export default async function StockAlertsPage() {
  const lowStockItems = await prisma.inventory.findMany({
    where: {
      // Use Prisma's relation scalar check
      // Unfortunately Prisma doesn't support direct field comparison in where (e.g. availableStock <= product.minimumStock)
      // So we have to fetch and filter, or we use a Prisma feature if available.
      // We will just fetch them all and filter in JS for now, since it's a small app.
    },
    include: {
      product: {
        include: {
          category: true
        }
      }
    }
  })

  // Filter items where available stock is less than or equal to minimum stock
  const alerts = lowStockItems.filter(
    (item) => item.availableStock <= item.product.minimumStock
  ).sort((a, b) => a.availableStock - b.availableStock) // Sort by most depleted first

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-red-600 flex items-center gap-2">
            <AlertOctagon className="h-8 w-8" /> Stock Alerts
          </h1>
          <p className="text-muted-foreground">
            Items that have reached their minimum stock threshold and need to be reordered immediately.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search low stock items..."
            className="pl-8 bg-white dark:bg-slate-900 border-red-200 dark:border-red-900 focus-visible:ring-red-500"
          />
        </div>
      </div>

      <div className="rounded-md border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-red-50 dark:bg-red-950/20">
            <TableRow>
              <TableHead className="text-red-900 dark:text-red-400">Product Name</TableHead>
              <TableHead className="text-red-900 dark:text-red-400">Category</TableHead>
              <TableHead className="text-red-900 dark:text-red-400">Current Stock</TableHead>
              <TableHead className="text-red-900 dark:text-red-400">Min Threshold</TableHead>
              <TableHead className="text-red-900 dark:text-red-400">Status</TableHead>
              <TableHead className="text-right text-red-900 dark:text-red-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-green-600 font-medium">
                  All good! No products are currently low on stock.
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((item) => {
                const isOutOfStock = item.availableStock === 0

                return (
                  <TableRow key={item.id} className={isOutOfStock ? "bg-red-50/50 dark:bg-red-950/10" : ""}>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell>{item.product.category.name}</TableCell>
                    <TableCell>
                      <span className={`font-bold text-lg ${isOutOfStock ? 'text-red-600' : 'text-orange-600'}`}>
                        {item.availableStock}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">{item.product.unit}</span>
                    </TableCell>
                    <TableCell>{item.product.minimumStock}</TableCell>
                    <TableCell>
                      {isOutOfStock ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/40 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                          Critical: Out of Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/40 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                          Warning: Low Stock
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" className="border-red-200 hover:bg-red-50 text-red-700 dark:border-red-900 dark:hover:bg-red-950/50 dark:text-red-400">
                         Create Purchase
                      </Button>
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
