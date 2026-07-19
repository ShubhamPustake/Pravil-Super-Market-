"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const barcode = formData.get("barcode") as string
  const sku = formData.get("sku") as string
  const categoryId = formData.get("categoryId") as string
  const brandId = formData.get("brandId") as string
  const purchasePrice = parseFloat(formData.get("purchasePrice") as string)
  const sellingPrice = parseFloat(formData.get("sellingPrice") as string)
  const gst = parseFloat(formData.get("gst") as string) || 0
  const unit = formData.get("unit") as string
  const minimumStock = parseFloat(formData.get("minimumStock") as string) || 10
  const maximumStock = parseFloat(formData.get("maximumStock") as string) || 1000
  const bulkUnitName = formData.get("bulkUnitName") as string || null
  const bulkConversionRate = parseFloat(formData.get("bulkConversionRate") as string) || null
  const openingStock = parseFloat(formData.get("openingStock") as string) || 0

  const product = await prisma.product.create({
    data: {
      name,
      description,
      barcode: barcode || undefined,
      sku: sku || undefined,
      categoryId,
      brandId: brandId || undefined,
      purchasePrice,
      sellingPrice,
      gst,
      unit,
      bulkUnitName,
      bulkConversionRate,
      minimumStock,
      maximumStock,
      inventory: {
        create: {
          availableStock: openingStock
        }
      },
      stockMovements: openingStock > 0 ? {
        create: {
          type: "IN",
          quantity: openingStock,
          reference: "OPENING_STOCK"
        }
      } : undefined
    }
  })

  revalidatePath("/products")
  revalidatePath("/")
  redirect("/products")
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id }
    })
  } catch (error: any) {
    if (error.code === 'P2003') {
      return { success: false, error: "Cannot delete this product because it has associated sales or purchase history. Please edit the product and mark it as Inactive instead." }
    }
    return { success: false, error: error.message || "An error occurred while deleting the product." }
  }
  
  revalidatePath("/products")
  revalidatePath("/")
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const barcode = formData.get("barcode") as string
  const sku = formData.get("sku") as string
  const categoryId = formData.get("categoryId") as string
  const brandId = formData.get("brandId") as string
  const purchasePrice = parseFloat(formData.get("purchasePrice") as string)
  const sellingPrice = parseFloat(formData.get("sellingPrice") as string)
  const gst = parseFloat(formData.get("gst") as string) || 0
  const unit = formData.get("unit") as string
  const minimumStock = parseFloat(formData.get("minimumStock") as string) || 10
  const maximumStock = parseFloat(formData.get("maximumStock") as string) || 1000
  const bulkUnitName = formData.get("bulkUnitName") as string || null
  const bulkConversionRate = parseFloat(formData.get("bulkConversionRate") as string) || null
  const isActive = formData.get("isActive") === "true"

  await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      barcode: barcode || null,
      sku: sku || null,
      categoryId,
      brandId: brandId || null,
      purchasePrice,
      sellingPrice,
      gst,
      unit,
      bulkUnitName,
      bulkConversionRate,
      minimumStock,
      maximumStock,
      isActive
    }
  })

  revalidatePath("/products")
  revalidatePath("/")
}

export async function createQuickProduct(data: {
  name: string
  categoryId: string
  brandId?: string
  purchasePrice: number
  sellingPrice: number
  unit: string
  gst: number
}) {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      categoryId: data.categoryId,
      brandId: data.brandId || undefined,
      purchasePrice: data.purchasePrice,
      sellingPrice: data.sellingPrice,
      unit: data.unit,
      gst: data.gst,
      minimumStock: 10,
      maximumStock: 1000,
      inventory: {
        create: {
          availableStock: 0
        }
      }
    }
  })
  
  revalidatePath("/products")
  return product
}
