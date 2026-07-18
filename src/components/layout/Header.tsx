"use client"

import { User, Bell, Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

export function Header() {
  const pathname = usePathname()

  if (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/forgot-password") {
    return null
  }

  return (
    <header className="flex h-16 shrink-0 items-center border-b px-6 bg-background">
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon" className="shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-600"></span>
          <span className="sr-only">Notifications</span>
        </Button>
        <ModeToggle />
        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border">
          <User className="h-4 w-4" />
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50" 
          title="Log out"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Log out</span>
        </Button>
      </div>
    </header>
  )
}
