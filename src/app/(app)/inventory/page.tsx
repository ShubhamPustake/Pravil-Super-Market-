import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import InventoryClient from "./InventoryClient"

export default async function InventoryPage() {
  const inventory = await prisma.inventory.findMany({
    include: {
      product: {
        include: {
          variants: true
        }
      }
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
            Track real-time stock levels and manually adjust counts.
          </p>
        </div>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" /> Export Stock Report
        </Button>
      </div>

      <InventoryClient initialInventory={inventory} />
    </div>
  )
}
