"use client"

import { useSearchParams } from "next/navigation"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Suspense } from "react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id")

  return (
    <div className="bg-white rounded-3xl p-10 shadow-sm border max-w-lg w-full text-center">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Order Placed Successfully!</h1>
      <p className="text-slate-500 mb-6">
        Thank you for shopping at Pravil Supermarket. Your order <span className="font-semibold text-slate-800">#{orderId?.slice(-6).toUpperCase()}</span> has been confirmed.
      </p>
      
      <div className="bg-slate-50 p-6 rounded-2xl mb-8 text-left">
        <h3 className="font-semibold text-slate-800 mb-2">What happens next?</h3>
        <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
          <li>You will receive an order confirmation email.</li>
          <li>Our team will pack your fresh groceries.</li>
          <li>Your order will be delivered within the promised time.</li>
        </ul>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/" className={cn(buttonVariants({ variant: "default" }), "flex-1 bg-green-600 hover:bg-green-700 h-12")}>
          Continue Shopping
        </Link>
        <Link href="/admin/orders" className={cn(buttonVariants({ variant: "outline" }), "flex-1 h-12")}>
          View Orders
        </Link>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 flex items-center justify-center px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
