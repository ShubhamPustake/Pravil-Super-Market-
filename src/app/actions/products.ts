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
  const variantsJson = formData.get("variants") as string
  const variants = variantsJson ? JSON.parse(variantsJson) : []
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
      minimumStock,
      maximumStock,
      variants: variants.length > 0 ? {
        create: variants.map((v: any) => ({
          unitName: v.unitName,
          conversionRate: parseFloat(v.conversionRate) || 1,
          sellingPrice: parseFloat(v.sellingPrice) || 0,
          purchasePrice: v.purchasePrice ? parseFloat(v.purchasePrice) : null,
          barcode: v.barcode || null
        }))
      } : undefined,
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
  const variantsJson = formData.get("variants") as string
  const variants = variantsJson ? JSON.parse(variantsJson) : []
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
      minimumStock,
      maximumStock,
      isActive
    }
  })

  // Handle variants update (simple approach: delete all and recreate)
  if (variantsJson) {
    await prisma.productVariant.deleteMany({ where: { productId: id } })
    if (variants.length > 0) {
      await prisma.productVariant.createMany({
        data: variants.map((v: any) => ({
          productId: id,
          unitName: v.unitName,
          conversionRate: parseFloat(v.conversionRate) || 1,
          sellingPrice: parseFloat(v.sellingPrice) || 0,
          purchasePrice: v.purchasePrice ? parseFloat(v.purchasePrice) : null,
          barcode: v.barcode || null
        }))
      })
    }
  }

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
