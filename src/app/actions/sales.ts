"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type SaleItemInput = {
  productId: string
  quantity: number
  sellingPrice: number
  discount: number
  finalPrice: number
}

export async function createSale(data: {
  totalAmount: number
  discount: number
  paymentMethod: string
  notes?: string
  items: SaleItemInput[]
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify Inventory before processing
      for (const item of data.items) {
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.productId }
        })
        
        if (!inventory || inventory.availableStock < item.quantity) {
          throw new Error(`Insufficient stock for product ID: ${item.productId}. Available: ${inventory?.availableStock || 0}`)
        }
      }

      // 2. Create Sale and SaleItems
      const sale = await tx.sale.create({
        data: {
          totalAmount: data.totalAmount,
          discount: data.discount,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          items: {
            create: data.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              sellingPrice: item.sellingPrice,
              discount: item.discount,
              finalPrice: item.finalPrice
            }))
          }
        }
      })

      // 3. Update Inventory and create StockMovement logs
      for (const item of data.items) {
        // Decrease inventory
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            availableStock: {
              decrement: item.quantity
            }
          }
        })

        // Create Stock Movement log (OUT)
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "OUT",
            quantity: item.quantity,
            reference: `SALE-${sale.id}`
          }
        })
      }

      return { success: true, saleId: sale.id }
    })

    revalidatePath("/sales")
    revalidatePath("/inventory")
    revalidatePath("/")
    
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
