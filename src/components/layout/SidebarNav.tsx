"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  ShoppingCart,
  Banknote,
  Users,
  BarChart3,
  AlertTriangle,
  Settings,
  MonitorSmartphone,
} from "lucide-react"

export const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS Terminal", href: "/sales/new", icon: MonitorSmartphone },
  { name: "Products", href: "/products", icon: Package },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Brands", href: "/brands", icon: Tags },
  { name: "Inventory", href: "/inventory", icon: Boxes },
  { name: "Purchases", href: "/purchases", icon: ShoppingCart },
  { name: "Sales History", href: "/sales", icon: Banknote },
  { name: "Suppliers", href: "/suppliers", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Stock Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface SidebarNavProps {
  onItemClick?: () => void
}

export function SidebarNav({ onItemClick }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="grid gap-1 px-3">
      {sidebarLinks.map((link) => {
        const isExactMatch = pathname === link.href
        // For parent routes like /sales, we don't want it to highlight if we're on /sales/new because /sales/new has its own dedicated tab now.
        const isChildMatch = link.href !== "/" && pathname.startsWith(`${link.href}/`) && !sidebarLinks.some(otherLink => otherLink.href !== link.href && pathname === otherLink.href)
        
        const isActive = isExactMatch || isChildMatch
        
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-white hover:bg-slate-800",
              isActive ? "bg-green-600/10 text-green-500 hover:bg-green-600/20" : ""
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.name}
          </Link>
        )
      })}
    </nav>
  )
}
