"use client"

import { usePathname } from "next/navigation"
import { Package } from "lucide-react"
import { SidebarNav } from "./SidebarNav"

export function Sidebar() {
  const pathname = usePathname()
  
  // Hide sidebar on landing and auth pages
  if (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/forgot-password") {
    return null
  }

  return (
    <div className="hidden lg:flex h-screen flex-col border-r bg-slate-900 text-slate-300 w-64 shrink-0 transition-all duration-300">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-800 px-6">
        <div className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="bg-green-600 p-1.5 rounded-lg text-white">
            <Package className="h-5 w-5" />
          </div>
          Pravil ERP
        </div>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <SidebarNav />
      </div>
    </div>
  )
}
