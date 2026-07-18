"use client"

import { useActionState } from "react"
import { loginUser } from "@/app/actions/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, undefined)

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Branding & Image */}
      <div className="hidden lg:flex w-1/2 relative bg-green-900">
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-900/40 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=1200" 
          alt="Supermarket Aisles" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-end p-16 text-white h-full">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag className="h-10 w-10 text-green-400" />
            <span className="text-3xl font-bold">Pravil<span className="text-green-400">Mart</span></span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">Your daily essentials,<br/>delivered instantly.</h1>
          <p className="text-lg text-green-100 max-w-md">
            Join thousands of shoppers getting their groceries, snacks, and personal care products delivered with zero hassle.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <Link href="/" className="absolute top-8 left-8 text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Link>
        
        <div className="w-full max-w-md space-y-8 mt-10 lg:mt-0">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 mt-2">Enter your details to access your account.</p>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm font-medium text-green-600 hover:text-green-500 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-green-500 rounded-xl"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-md shadow-green-600/20 transition-all hover:shadow-lg hover:shadow-green-600/30" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>


        </div>
      </div>
    </div>
  )
}
