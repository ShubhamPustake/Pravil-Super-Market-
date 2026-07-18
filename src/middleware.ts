import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register" || nextUrl.pathname === "/forgot-password"
  const isPublicRoute = nextUrl.pathname === "/"
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")

  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", nextUrl))
    }
    return NextResponse.next()
  }

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Protect all other routes
  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl))
  }

  return NextResponse.next()
})
