import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function HeroBanner() {
  return (
    <section className="relative bg-green-50 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-green-200/50 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-yellow-200/50 blur-3xl opacity-50"></div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10 flex flex-col md:flex-row items-center gap-8">
        
        {/* Content */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 font-medium text-sm mb-2">
            🚀 Lightning Fast Delivery
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
            Fresh Groceries <br />
            <span className="text-green-600">Delivered to Your Doorstep</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto md:mx-0">
            Get the freshest groceries, dairy, and everyday essentials delivered within hours. Best quality guaranteed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
            <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-14 text-lg">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-14 text-lg border-green-200 text-green-700 hover:bg-green-50">
              Browse Offers
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 w-full max-w-lg md:max-w-none relative">
          <div className="aspect-square relative">
            <img 
              src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=1000" 
              alt="Supermarket Aisles" 
              className="rounded-3xl object-cover shadow-2xl w-full h-full"
            />
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-2xl">🛍️</span>
              </div>
              <div>
                <p className="font-bold text-slate-800">100% Fresh</p>
                <p className="text-sm text-slate-500">Quality Assured</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
