import prisma from "@/lib/prisma"
import UdharClient from "./UdharClient"
import { BookUser } from "lucide-react"

export default async function UdharPage() {
  const udharSales = await prisma.sale.findMany({
    where: {
      status: "UNPAID"
    },
    orderBy: { saleDate: 'desc' },
    include: {
      _count: { select: { items: true } }
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookUser className="h-8 w-8 text-amber-600" /> Udhar Khata (Credit)
          </h1>
          <p className="text-muted-foreground">
            Track unpaid credit sales and manage customer debts.
          </p>
        </div>
      </div>

      <UdharClient sales={udharSales} />
    </div>
  )
}
