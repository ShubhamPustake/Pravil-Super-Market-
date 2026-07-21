"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type PurchaseItemInput = {
  productId: string
  variantId?: string
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
          create: data.items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId || undefined,
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
      let baseQuantity = item.quantity
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } })
        if (variant) {
          baseQuantity = item.quantity * variant.conversionRate
          // Optionally update variant pricing here
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              purchasePrice: item.purchasePrice,
              sellingPrice: item.sellingPrice
            }
          })
        }
      } else {
        // Update Product pricing
        await tx.product.update({
          where: { id: item.productId },
          data: {
            purchasePrice: item.purchasePrice,
            sellingPrice: item.sellingPrice
          }
        })
      }

      // Update inventory (increment)
      await tx.inventory.update({
        where: { productId: item.productId },
        data: {
          availableStock: {
            increment: baseQuantity
          }
        }
      })

      // Create Stock Movement log (IN)
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: "IN",
          quantity: baseQuantity,
          reference: `PURCHASE-${purchase.id}`
        }
      })
    }
  })

  revalidatePath("/purchases")
  revalidatePath("/inventory")
  revalidatePath("/")
  
  return { success: true }
}

export async function deletePurchase(purchaseId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({
        where: { id: purchaseId },
        include: { items: true }
      })
      if (!purchase) throw new Error("Purchase not found")

      // Revert Inventory and create StockMovement logs
      for (const item of purchase.items) {
        let baseQuantity = item.quantity
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } })
          if (variant) baseQuantity = item.quantity * variant.conversionRate
        }

        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            availableStock: {
              decrement: baseQuantity
            }
          }
        })

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "OUT",
            quantity: baseQuantity,
            reference: `REVERT_PURCHASE-${purchase.id}`
          }
        })
      }

      // Delete the Purchase (PurchaseItems will be deleted via Cascade)
      await tx.purchase.delete({
        where: { id: purchaseId }
      })
    })

    revalidatePath("/purchases")
    revalidatePath("/inventory")
    revalidatePath("/")
    
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to delete purchase" }
  }
}
