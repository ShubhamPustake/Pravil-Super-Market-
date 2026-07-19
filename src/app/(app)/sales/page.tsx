import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import SalesClient from "./SalesClient"

export default async function SalesPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { saleDate: 'desc' },
    include: {
      _count: { select: { items: true } }
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">
            View daily sales and POS transactions.
          </p>
        </div>
        <Link href="/sales/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" /> New Sale (POS)
          </Button>
        </Link>
      </div>

      <SalesClient sales={sales} />
    </div>
  )
}
