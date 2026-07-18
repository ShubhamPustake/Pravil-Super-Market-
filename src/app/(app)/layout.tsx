import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pravil Supermarket | Fresh Groceries Delivered",
  description: "Fresh groceries delivered to your doorstep. Buy fresh dairy, bakery, snacks, and grocery essentials at the best prices.",
}

export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950/50">
            {children}
          </main>
        </div>
    </div>
  )
}
