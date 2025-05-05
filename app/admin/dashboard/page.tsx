"use client"

import AdminLayout from "@/components/admin/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { LucideUsers, LucideSettings, LucideDollarSign } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServices: 0,
    totalBalance: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total users
        const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true })

        // Fetch total services
        const { count: serviceCount } = await supabase.from("services").select("*", { count: "exact", head: true })

        // Fetch total balance
        const { data: balanceData } = await supabase.from("users").select("balance")

        const totalBalance = balanceData?.reduce((sum, user) => sum + Number.parseFloat(user.balance), 0) || 0

        setStats({
          totalUsers: userCount || 0,
          totalServices: serviceCount || 0,
          totalBalance,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome to the InsFollow admin panel.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <LucideUsers className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-gray-500">Registered users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <LucideSettings className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalServices}</div>
              <p className="text-xs text-gray-500">Available services</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <LucideDollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBalance.toFixed(2)} DZD</div>
              <p className="text-xs text-gray-500">Across all users</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
