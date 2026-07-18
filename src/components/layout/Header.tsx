"use client"

import { useState } from "react"
import { User, Bell, Menu, LogOut, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { SidebarNav } from "./SidebarNav"

import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/forgot-password") {
    return null
  }

  return (
    <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6 bg-background">
      <div className="flex items-center gap-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-r-slate-800 text-slate-300">
            <div className="flex h-16 shrink-0 items-center border-b border-slate-800 px-6">
              <SheetTitle className="flex items-center gap-2 font-bold text-xl text-white m-0">
                <div className="bg-green-600 p-1.5 rounded-lg text-white">
                  <Package className="h-5 w-5" />
                </div>
                Pravil ERP
              </SheetTitle>
            </div>
            <div className="flex-1 overflow-auto py-4">
              <SidebarNav onItemClick={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="ml-auto flex items-center gap-3 md:gap-4">
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
