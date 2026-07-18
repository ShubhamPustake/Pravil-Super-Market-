import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Package, Users, AlertTriangle } from "lucide-react"
import prisma from "@/lib/prisma"

export default async function AdminDashboard() {
  // Mock data for analytics since DB might be empty initially
  // In a real app we'd fetch counts:
  // const totalOrders = await prisma.order.count()
  
  const stats = [
    { title: "Total Revenue", value: "$45,231.89", icon: DollarSign, trend: "+20.1% from last month" },
    { title: "Total Orders", value: "+2350", icon: ShoppingCart, trend: "+180.1% from last month" },
    { title: "Products in Stock", value: "342", icon: Package, trend: "+19 added this week" },
    { title: "Active Customers", value: "+573", icon: Users, trend: "+201 since last hour" },
  ]

  const recentOrders = [
    { id: "ORD-101", customer: "Alice Smith", amount: "$120.50", status: "Delivered", date: "Today, 10:23 AM" },
    { id: "ORD-102", customer: "Bob Jones", amount: "$45.00", status: "Out for Delivery", date: "Today, 09:12 AM" },
    { id: "ORD-103", customer: "Charlie Davis", amount: "$89.99", status: "Processing", date: "Yesterday, 04:30 PM" },
    { id: "ORD-104", customer: "Diana Ross", amount: "$210.00", status: "Confirmed", date: "Yesterday, 01:15 PM" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Dashboard</h2>
      </div>
      
      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                <p className="text-xs text-slate-500 mt-1">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Low Stock Alerts & Recent Orders */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrders.map((order, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {order.customer.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{order.customer}</p>
                      <p className="text-sm text-slate-500 mt-1">{order.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{order.amount}</p>
                    <p className={`text-xs mt-1 ${order.status === 'Delivered' ? 'text-green-600' : 'text-amber-600'}`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                <div>
                  <p className="font-semibold text-sm">Organic Bananas</p>
                  <p className="text-xs opacity-80 mt-0.5">ID: PRD-005</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-red-600">2 left</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                <div>
                  <p className="font-semibold text-sm">Whole Milk 1L</p>
                  <p className="text-xs opacity-80 mt-0.5">ID: PRD-082</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-red-600">0 left</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                <div>
                  <p className="font-semibold text-sm">Brown Bread</p>
                  <p className="text-xs opacity-80 mt-0.5">ID: PRD-031</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-amber-600">8 left</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
