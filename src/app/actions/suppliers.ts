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

export async function deleteSupplier(id: string) {
  await prisma.supplier.delete({
    where: { id }
  })
  
  revalidatePath("/suppliers")
}
