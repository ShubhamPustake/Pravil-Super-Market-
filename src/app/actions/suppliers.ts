"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createSupplier(formData: FormData) {
  const name = formData.get("name") as string
  const contact = formData.get("contact") as string
  const gst = formData.get("gst") as string
  const address = formData.get("address") as string

  await prisma.supplier.create({
    data: {
      name,
      contact: contact || undefined,
      gst: gst || undefined,
      address: address || undefined,
    }
  })

  revalidatePath("/suppliers")
  redirect("/suppliers")
}

export async function updateSupplier(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const contact = formData.get("contact") as string
  const gst = formData.get("gst") as string
  const address = formData.get("address") as string

  await prisma.supplier.update({
    where: { id },
    data: {
      name,
      contact: contact || null,
      gst: gst || null,
      address: address || null,
    }
  })

  revalidatePath("/suppliers")
  return { success: true }
}

export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.delete({
      where: { id }
    })
    
    revalidatePath("/suppliers")
    return { success: true }
  } catch (error: any) {
    if (error.code === 'P2003') {
      return { error: "Cannot delete this supplier because there are purchases or products linked to them." }
    }
    return { error: "Failed to delete supplier." }
  }
}
