import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import PurchaseClient from "./PurchaseClient"

export default async function PurchasesPage() {
  const purchases = await prisma.purchase.findMany({
    orderBy: { purchaseDate: 'desc' },
    include: {
      supplier: true,
      _count: { select: { items: true } }
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground">
            Manage stock intake and supplier invoices.
          </p>
        </div>
        <Link href="/purchases/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" /> New Purchase Entry
          </Button>
        </Link>
      </div>

      <PurchaseClient purchases={purchases} />
    </div>
  )
}
