import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pravil Supermarket | Fresh Groceries Delivered",
  description: "Fresh groceries delivered to your doorstep. Buy fresh dairy, bakery, snacks, and grocery essentials at the best prices.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950/50">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
