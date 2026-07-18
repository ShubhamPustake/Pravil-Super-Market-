"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function loginUser(prevState: any, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." }
        default:
          return { error: "Something went wrong." }
      }
    }
    throw error
  }
  
  // Successfully signed in, redirect to dashboard
  redirect("/dashboard")
}



export async function registerUser(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
      return { error: "Missing required fields." }
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters." }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: "An account with this email already exists." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
      }
    })
    
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Something went wrong during registration." }
  }

  // Redirect to login page after successful registration
  redirect("/login?registered=true")
}
