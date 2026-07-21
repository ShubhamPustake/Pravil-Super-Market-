import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import EditSaleClient from "./EditSaleClient"

export default async function EditSalePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sale = await prisma.sale.findUnique({
    where: { id: resolvedParams.id },
    include: {
      items: true
    }
  })

  if (!sale) {
    notFound()
  }

  return <EditSaleClient sale={sale} />
}
