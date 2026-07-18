"use client"

import { useActionState } from "react"
import { registerUser } from "@/app/actions/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, undefined)

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Branding & Image */}
      <div className="hidden lg:flex w-1/2 relative bg-green-900">
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-900/40 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=1200" 
          alt="Grocery Store Aisle" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-end p-16 text-white h-full">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag className="h-10 w-10 text-green-400" />
            <span className="text-3xl font-bold">Pravil<span className="text-green-400">Mart</span></span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">Start your shopping<br/>journey today.</h1>
          <p className="text-lg text-green-100 max-w-md">
            Create an account to save your favorite items, track orders, and unlock exclusive member discounts.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        <Link href="/" className="absolute top-8 left-8 text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Link>
        
        <div className="w-full max-w-md space-y-8 mt-12 lg:mt-0 py-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create an account</h2>
            <p className="text-slate-500 mt-2">Join us to start shopping for fresh essentials.</p>
          </div>



          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {state.error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-green-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-green-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-green-500 rounded-xl"
                />
                <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters long.</p>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-md shadow-green-600/20 transition-all hover:shadow-lg hover:shadow-green-600/30" disabled={isPending}>
              {isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-green-600 hover:text-green-500 hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
