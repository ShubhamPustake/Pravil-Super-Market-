import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import EditSaleClient from "./EditSaleClient"

export default async function EditSalePage({ params }: { params: { id: string } }) {
  const sale = await prisma.sale.findUnique({
    where: { id: params.id },
    include: {
      items: true
    }
  })

  if (!sale) {
    notFound()
  }

  return <EditSaleClient sale={sale} />
}
