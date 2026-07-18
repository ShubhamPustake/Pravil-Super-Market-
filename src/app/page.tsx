import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ArrowRight, Package, Banknote, Users, BarChart3 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navigation */}
      <header className="flex h-16 items-center justify-between px-6 lg:px-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-green-600 p-2 rounded-xl text-white">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            Pravil<span className="text-green-600">ERP</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:inline-flex">Sign in</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-6 lg:px-12 py-20 lg:py-32 overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/10 dark:bg-green-500/5 blur-[120px] rounded-full -z-10" />
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mb-6">
            The intelligent OS for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">
              Modern Supermarkets
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10">
            Manage inventory, process sales, and track analytics in real-time with an ERP designed specifically for high-volume retail.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white h-14 px-8 rounded-full text-lg shadow-xl shadow-green-600/20">
                Access Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="https://github.com/shubham-pustake" target="_blank" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 px-8 rounded-full text-lg border-slate-300 dark:border-slate-700">
                View Documentation
              </Button>
            </Link>
          </div>
          
          {/* Dashboard Preview Image */}
          <div className="mt-16 w-full max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-transparent z-10 rounded-2xl pointer-events-none" />
            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=2000" 
              alt="Dashboard Preview" 
              className="w-full h-auto rounded-xl opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 lg:px-12 py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to run your store</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Purpose-built tools to handle the complexity of inventory management, sales, and vendor relations.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Package, title: "Smart Inventory", desc: "Track stock levels in real-time with low-stock alerts and subcategory organization." },
                { icon: Banknote, title: "Fast POS System", desc: "Process transactions quickly with a responsive Point of Sale interface." },
                { icon: Users, title: "Supplier Management", desc: "Keep track of vendors, wholesale purchases, and restock histories easily." },
                { icon: BarChart3, title: "Live Analytics", desc: "Make data-driven decisions with real-time revenue and profit dashboards." }
              ].map((feat, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all">
                  <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                    <feat.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t border-slate-200 dark:border-slate-800">
        <p>© {new Date().getFullYear()} Pravil Supermarket ERP. All rights reserved.</p>
      </footer>
    </div>
  )
}
