import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Banknote, ShoppingCart, PackageOpen, AlertTriangle, TrendingUp, TrendingDown, IndianRupee, Truck, Tags, ArrowUpRight, ArrowDownRight } from "lucide-react"
import prisma from "@/lib/prisma"
import Link from "next/link"

export default async function Dashboard() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59)
  
  // Run all queries in parallel for performance
  const [
    todaySalesAgg,
    todaySalesCount,
    yesterdaySalesAgg,
    monthSalesAgg,
    lastMonthSalesAgg,
    monthPurchasesAgg,
    totalProducts,
    totalCategories,
    totalSuppliers,
    lowStockItems,
    outOfStockCount,
    recentSales,
    topSellingItems,
  ] = await Promise.all([
    // Today's revenue
    prisma.sale.aggregate({
      where: { createdAt: { gte: today } },
      _sum: { totalAmount: true },
    }),
    // Today's order count
    prisma.sale.count({
      where: { createdAt: { gte: today } },
    }),
    // Yesterday's revenue (for comparison)
    prisma.sale.aggregate({
      where: { createdAt: { gte: yesterday, lt: today } },
      _sum: { totalAmount: true },
    }),
    // This month's revenue
    prisma.sale.aggregate({
      where: { createdAt: { gte: thisMonthStart } },
      _sum: { totalAmount: true },
    }),
    // Last month's revenue (for comparison)
    prisma.sale.aggregate({
      where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
      _sum: { totalAmount: true },
    }),
    // This month's purchases (cost)
    prisma.purchase.aggregate({
      where: { createdAt: { gte: thisMonthStart } },
      _sum: { totalCost: true },
    }),
    // Product counts
    prisma.product.count(),
    prisma.category.count(),
    prisma.supplier.count(),
    // Low stock (below minimum)
    prisma.inventory.findMany({
      where: {
        product: { isActive: true },
        availableStock: { gt: 0 },
      },
      include: { product: true },
      orderBy: { availableStock: 'asc' },
      take: 5,
    }),
    // Out of stock
    prisma.inventory.count({
      where: { availableStock: { lte: 0 } },
    }),
    // Recent sales
    prisma.sale.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: {
          include: { product: true },
          take: 3,
        }
      }
    }),
    // Top selling items this month
    prisma.saleItem.groupBy({
      by: ['productId'],
      where: { sale: { createdAt: { gte: thisMonthStart } } },
      _sum: { quantity: true, finalPrice: true },
      orderBy: { _sum: { finalPrice: 'desc' } },
      take: 5,
    }),
  ])

  const todayRevenue = todaySalesAgg._sum.totalAmount || 0
  const yesterdayRevenue = yesterdaySalesAgg._sum.totalAmount || 0
  const monthRevenue = monthSalesAgg._sum.totalAmount || 0
  const lastMonthRevenue = lastMonthSalesAgg._sum.totalAmount || 0
  const monthPurchases = monthPurchasesAgg._sum.totalCost || 0
  const monthProfit = monthRevenue - monthPurchases

  // Calculate percentage changes
  const dailyChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100) : 0
  const monthlyChange = lastMonthRevenue > 0 ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0

  // Low stock count (items below their own minimum stock)
  const lowStockCount = await prisma.$queryRawUnsafe<{count: bigint}[]>(
    `SELECT COUNT(*) as count FROM "Inventory" i JOIN "Product" p ON i."productId" = p."id" WHERE i."availableStock" > 0 AND i."availableStock" <= p."minimumStock" AND p."isActive" = true`
  )
  const lowStockNumber = Number(lowStockCount[0]?.count || 0)

  // Fetch product names for top selling
  const topProductIds = topSellingItems.map((i: any) => i.productId)
  const topProducts = topProductIds.length > 0 ? await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, unit: true }
  }) : []

  const topSelling = topSellingItems.map((item: any) => {
    const product = topProducts.find(p => p.id === item.productId)
    return {
      name: product?.name || 'Unknown',
      unit: product?.unit || 'pcs',
      qty: item._sum.quantity || 0,
      revenue: item._sum.finalPrice || 0,
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back to Pravil Supermarket ERP.
        </p>
      </div>

      {/* Row 1: Primary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <p className={`text-xs flex items-center gap-1 mt-1 ${dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dailyChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(1)}% vs yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySalesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed transactions today
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{monthRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <p className={`text-xs flex items-center gap-1 mt-1 ${monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthlyChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}% vs last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Profit</CardTitle>
            <Banknote className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{monthProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue − Purchases this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Secondary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <PackageOpen className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tags className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground mt-1">Product categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Truck className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground mt-1">Active suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Purchases</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{monthPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Cost this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Stock Alerts + Top Selling + Recent Sales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Stock Alerts */}
        <Card className={outOfStockCount > 0 || lowStockNumber > 0 ? 'border-red-200 dark:border-red-900/50' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                <span className="text-sm font-medium">Out of Stock</span>
                <span className="text-lg font-bold text-red-600">{outOfStockCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                <span className="text-sm font-medium">Low Stock</span>
                <span className="text-lg font-bold text-amber-600">{lowStockNumber}</span>
              </div>
              {lowStockItems.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lowest Stock Items</p>
                  {lowStockItems.map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[180px]">{inv.product.name}</span>
                      <span className="font-mono text-xs font-bold text-amber-600">{inv.availableStock.toFixed(0)} left</span>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/inventory" className="block text-center text-xs text-green-600 hover:underline pt-1">
                View Full Inventory →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Selling (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topSelling.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No sales data this month.</p>
            ) : (
              <div className="space-y-3">
                {topSelling.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        i === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {i + 1}
                      </span>
                      <span className="text-sm truncate">{item.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-sm font-semibold">₹{item.revenue.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-muted-foreground">{item.qty} {item.unit}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No sales recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale: any) => (
                  <div key={sale.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate max-w-[160px]">
                        {sale.items.map((i: any) => i.product.name).join(', ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(sale.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {' · '}{sale.paymentMethod}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-2">₹{sale.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <Link href="/sales" className="block text-center text-xs text-green-600 hover:underline pt-1">
                  View All Sales →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
