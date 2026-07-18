"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  await prisma.category.create({
    data: {
      name,
      slug,
      description: description || undefined,
    }
  })

  revalidatePath("/categories")
  redirect("/categories")
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({
    where: { id }
  })
  
  revalidatePath("/categories")
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  await prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
      description: description || null,
    }
  })

  revalidatePath("/categories")
}
