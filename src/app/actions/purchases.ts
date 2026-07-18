"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type PurchaseItemInput = {
  productId: string
  quantity: number
  purchasePrice: number
  sellingPrice: number
  gst: number
  finalCost: number
}

export async function createPurchase(data: {
  supplierId: string
  invoiceNumber?: string
  totalCost: number
  transportCost: number
  discount: number
  items: PurchaseItemInput[]
}) {
  await prisma.$transaction(async (tx) => {
    // 1. Create the Purchase and PurchaseItems
    const purchase = await tx.purchase.create({
      data: {
        supplierId: data.supplierId,
        invoiceNumber: data.invoiceNumber,
        totalCost: data.totalCost,
        transportCost: data.transportCost,
        discount: data.discount,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            gst: item.gst,
            finalCost: item.finalCost
          }))
        }
      }
    })

    // 2. Update Inventory and create StockMovement logs
    for (const item of data.items) {
      // Update inventory (increment)
      await tx.inventory.update({
        where: { productId: item.productId },
        data: {
          availableStock: {
            increment: item.quantity
          }
        }
      })
      
      // Update Product pricing
      await tx.product.update({
        where: { id: item.productId },
        data: {
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice
        }
      })

      // Create Stock Movement log (IN)
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: "IN",
          quantity: item.quantity,
          reference: `PURCHASE-${purchase.id}`
        }
      })
    }
  })

  revalidatePath("/purchases")
  revalidatePath("/inventory")
  revalidatePath("/")
  redirect("/purchases")
}
