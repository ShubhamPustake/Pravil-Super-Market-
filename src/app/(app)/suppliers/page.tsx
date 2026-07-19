import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import SupplierClient from "./SupplierClient"

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      _count: {
        select: { purchases: true }
      }
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage wholesale distributors and partners.
          </p>
        </div>
        <Link href="/suppliers/new">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Supplier
          </Button>
        </Link>
      </div>

      <SupplierClient suppliers={suppliers} />
    </div>
  )
}
