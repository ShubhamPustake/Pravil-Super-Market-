"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function createOrder(data: any) {
  try {
    const session = await auth()
    
    // In a real app, user might be required to login or order as guest
    // If we require login:
    // if (!session?.user?.id) {
    //   return { success: false, error: "Please login to place an order" }
    // }

    // Hardcoding a mock user ID for guest/presentation purposes if not logged in
    const userId = session?.user?.id || (await getOrCreateGuestUser())

    // 1. Create the Order and Address
    // 2. We use a Prisma Transaction to ensure inventory is correctly managed
    // The requirement: "When customer places an order: Stock becomes Reserved. Available Stock decreases."

    const result = await prisma.$transaction(async (tx) => {
      // Create Address
      const address = await tx.address.create({
        data: {
          userId,
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: "USA", // Hardcoded or from form
        }
      })

      // Create Order
      const order = await tx.order.create({
        data: {
          userId,
          addressId: address.id,
          totalAmount: data.totalAmount,
          paymentMethod: data.paymentMethod,
          status: "CONFIRMED",
          paymentStatus: data.paymentMethod === "COD" ? "PENDING" : "PAID",
        }
      })

      // Process Items and Inventory
      for (const item of data.items) {
        // Create Order Item
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }
        })

        // Update Inventory: decrease availableStock, increase reservedStock
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.id }
        })

        if (inventory) {
          if (inventory.availableStock < item.quantity) {
            throw new Error(`Not enough stock for item: ${item.name}`)
          }

          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              availableStock: { decrement: item.quantity },
              reservedStock: { increment: item.quantity }
            }
          })
        }
      }

      return order
    })

    return { success: true, orderId: result.id }
  } catch (error: any) {
    console.error("Order creation error:", error)
    return { success: false, error: error.message || "Failed to place order" }
  }
}

async function getOrCreateGuestUser() {
  const email = "guest@pravilmart.com"
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Guest User",
        email,
        role: "CUSTOMER"
      }
    })
  }
  return user.id
}
