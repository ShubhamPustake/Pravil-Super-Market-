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
  customerName?: string
  customerPhone?: string
  status?: string
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
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          status: data.status || "PAID",
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

export async function markSaleAsPaid(id: string, paymentMethod: string) {
  try {
    await prisma.sale.update({
      where: { id },
      data: {
        status: "PAID",
        paymentMethod: paymentMethod
      }
    })
    
    revalidatePath("/udhar")
    revalidatePath("/sales")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteSale(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Get the sale and its items
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { items: true }
      })

      if (!sale) throw new Error("Sale not found")

      // 2. Revert inventory
      for (const item of sale.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            availableStock: {
              increment: item.quantity
            }
          }
        })

        // 3. Create Stock Movement log (IN) to record the reverted sale
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "IN",
            quantity: item.quantity,
            reference: `SALE-REVERT-${sale.id}`
          }
        })
      }

      // 4. Delete the sale (this will cascade delete SaleItems)
      await tx.sale.delete({
        where: { id }
      })
    })

    revalidatePath("/sales")
    revalidatePath("/inventory")
    revalidatePath("/udhar")
    revalidatePath("/")
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateSale(saleId: string, data: {
  totalAmount: number
  discount: number
  paymentMethod: string
  customerName?: string
  customerPhone?: string
  status?: string
  notes?: string
  items: SaleItemInput[]
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the existing sale and its items
      const existingSale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { items: true }
      })

      if (!existingSale) throw new Error("Sale not found")

      // 2. REVERT Old Inventory
      for (const item of existingSale.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            availableStock: {
              increment: item.quantity
            }
          }
        })

        // Log revert
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "IN",
            quantity: item.quantity,
            reference: `SALE-EDIT-REVERT-${saleId}`
          }
        })
      }

      // 3. Verify Inventory for NEW items (using the now-reverted stock)
      for (const item of data.items) {
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.productId }
        })
        
        if (!inventory || inventory.availableStock < item.quantity) {
          throw new Error(`Insufficient stock for product ID: ${item.productId}. Available: ${inventory?.availableStock || 0}`)
        }
      }

      // 4. Delete old SaleItems (they will be recreated)
      await tx.saleItem.deleteMany({
        where: { saleId }
      })

      // 5. Update Sale and Create NEW SaleItems
      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          totalAmount: data.totalAmount,
          discount: data.discount,
          paymentMethod: data.paymentMethod,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          status: data.status || "PAID",
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

      // 6. Deduct NEW Inventory
      for (const item of data.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            availableStock: {
              decrement: item.quantity
            }
          }
        })

        // Log new sale outbound
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "OUT",
            quantity: item.quantity,
            reference: `SALE-EDIT-REAPPLY-${saleId}`
          }
        })
      }

      return { success: true, saleId: updatedSale.id }
    })

    revalidatePath("/sales")
    revalidatePath("/inventory")
    revalidatePath("/udhar")
    revalidatePath("/")
    
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}


