import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SalesChart } from "@/components/dashboard/SalesChart"
import { Banknote, TrendingUp, PackageMinus } from "lucide-react"

export default async function AnalyticsPage() {
  const totalSales = await prisma.sale.aggregate({
    _sum: { totalAmount: true }
  })

  const totalPurchases = await prisma.purchase.aggregate({
    _sum: { totalCost: true }
  })

  const revenue = totalSales._sum.totalAmount || 0
  const cost = totalPurchases._sum.totalCost || 0
  const profit = revenue - cost

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Analytics</h1>
        <p className="text-muted-foreground">
          Analyze your store's performance, revenue, and profit margins.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Banknote className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₹{revenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchase Cost</CardTitle>
            <PackageMinus className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">₹{cost.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Gross Profit</CardTitle>
            <TrendingUp className={`h-4 w-4 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{profit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue - Purchase Cost
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <SalesChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Categories</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground">More data required to generate category distribution.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
