"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createSubCategory(categoryId: string, name: string) {
  await prisma.subCategory.create({
    data: {
      name,
      categoryId,
    }
  })

  revalidatePath("/categories")
}

export async function updateSubCategory(id: string, name: string) {
  await prisma.subCategory.update({
    where: { id },
    data: { name }
  })

  revalidatePath("/categories")
}

export async function deleteSubCategory(id: string) {
  await prisma.subCategory.delete({
    where: { id }
  })

  revalidatePath("/categories")
}
