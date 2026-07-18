"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createBrand(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const categoryIds = formData.getAll("categories") as string[]

  await prisma.brand.create({
    data: {
      name,
      description: description || undefined,
      categories: {
        connect: categoryIds.map((id) => ({ id }))
      }
    }
  })

  revalidatePath("/brands")
  redirect("/brands")
}

export async function deleteBrand(id: string) {
  await prisma.brand.delete({
    where: { id }
  })
  
  revalidatePath("/brands")
}
