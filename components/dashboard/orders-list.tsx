"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"
import { ShoppingCart } from "lucide-react"

interface OrdersListProps {
  userId: string
}

interface Order {
  id: string
  service_id: string
  link: string
  quantity: number
  amount: number
  status: string
  created_at: string
  updated_at: string
  service: {
    name: string
  }
}

export function OrdersList({ userId }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshingOrder, setRefreshingOrder] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (userId) {
      fetchOrders()
    } else {
      setIsLoading(false)
      setOrders([])
    }
  }, [userId])

  async function fetchOrders() {
    // If userId is not provided, don't attempt to fetch
    if (!userId) {
      console.warn("Cannot fetch orders: User ID is undefined")
      setOrders([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
        *,
        service:service_id (
          name
        )
      `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function getStatusBadgeClass(status: string) {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "processing":
      case "in_progress":
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "partial":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "canceled":
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
        <p className="mt-4 text-muted-foreground">You haven't placed any orders yet</p>
        <Button className="mt-4" asChild>
          <a href="/services">Browse Services</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-4">Service</th>
              <th className="text-left py-2 px-4">Quantity</th>
              <th className="text-left py-2 px-4">Amount</th>
              <th className="text-left py-2 px-4">Status</th>
              <th className="text-left py-2 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="py-2 px-4">
                  <div className="font-medium">{order.service?.name || "Unknown Service"}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">{order.link}</div>
                </td>
                <td className="py-2 px-4">{order.quantity}</td>
                <td className="py-2 px-4">{order.amount.toFixed(2)} DZD</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <div className="text-sm">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{order.service?.name || "Unknown Service"}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[200px]">{order.link}</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Quantity:</span> {order.quantity}
              </div>
              <div>
                <span className="text-muted-foreground">Amount:</span> {order.amount.toFixed(2)} DZD
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>{" "}
                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full" onClick={fetchOrders}>
        Refresh Orders
      </Button>
    </div>
  )
}
