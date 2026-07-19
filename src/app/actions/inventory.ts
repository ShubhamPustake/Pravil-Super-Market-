"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateInventoryStock(inventoryId: string, newStock: number) {
  try {
    const current = await prisma.inventory.findUnique({ where: { id: inventoryId } })
    if (!current) return { error: "Inventory not found" }

    const difference = newStock - current.availableStock

    if (difference !== 0) {
      await prisma.$transaction([
        prisma.inventory.update({
          where: { id: inventoryId },
          data: { availableStock: newStock }
        }),
        prisma.stockMovement.create({
          data: {
            productId: current.productId,
            type: "ADJUSTMENT",
            quantity: difference,
            reference: `MANUAL_ADJUSTMENT`
          }
        })
      ])
    }
    
    revalidatePath("/inventory")
    revalidatePath("/products")
    revalidatePath("/")
    
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to update stock" }
  }
}
