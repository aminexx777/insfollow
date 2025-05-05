"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { NotificationsList } from "@/components/dashboard/notifications-list"
import { OrdersList } from "@/components/dashboard/orders-list"
import { BalanceRechargeForm } from "@/components/dashboard/balance-recharge-form"
import { GiftBalanceForm } from "@/components/dashboard/gift-balance-form"
import { RedeemCouponForm } from "@/components/dashboard/redeem-coupon-form"
import { supabase } from "@/lib/supabase/client"
import { Loader2, Search, Filter, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"

export default function DashboardPage() {
  const { user, isLoading: authLoading, isAuthenticated, updateUser } = useAuth()
  const [services, setServices] = useState<any[]>([])
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories, setCategories] = useState<string[]>([])
  const [isServicesLoading, setIsServicesLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      if (!user || !user.id) return

      try {
        setIsServicesLoading(true)
        const { data, error } = await supabase.from("services").select("*").order("category").order("name")

        if (error) throw error

        if (data) {
          setServices(data)
          setFilteredServices(data)

          // Extract unique categories
          const uniqueCategories = Array.from(new Set(data.map((service) => service.category)))
          setCategories(uniqueCategories as string[])
        }
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setIsServicesLoading(false)
      }
    }

    if (user && user.id) {
      fetchServices()
    }
  }, [user])

  // Filter services based on search query and category
  useEffect(() => {
    if (services.length > 0) {
      let filtered = services

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (service) =>
            service.name.toLowerCase().includes(query) ||
            service.description?.toLowerCase().includes(query) ||
            service.service_id?.toString().includes(query),
        )
      }

      // Filter by category
      if (selectedCategory !== "all") {
        filtered = filtered.filter((service) => service.category === selectedCategory)
      }

      setFilteredServices(filtered)
    }
  }, [searchQuery, selectedCategory, services])

  const handleServiceClick = (serviceId: number) => {
    router.push(`/order/${serviceId}`)
  }

  const syncServices = async () => {
    try {
      setIsServicesLoading(true)
      const response = await fetch("/api/services", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to sync services")
      }

      toast({
        title: "Services synced",
        description: "Services have been successfully synced with the provider.",
      })

      // Refetch services after sync
      const { data, error } = await supabase.from("services").select("*").order("category").order("name")

      if (error) throw error

      if (data) {
        setServices(data)
        setFilteredServices(data)

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map((service) => service.category)))
        setCategories(uniqueCategories as string[])
      }
    } catch (error) {
      console.error("Error syncing services:", error)
      toast({
        title: "Sync failed",
        description: "Failed to sync services with the provider.",
        variant: "destructive",
      })
    } finally {
      setIsServicesLoading(false)
    }
  }

  // Function to refresh user data
  const refreshUserData = async () => {
    if (!user || !user.id) return

    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (error) throw error

      if (data) {
        updateUser({
          balance: data.balance,
          name: data.name,
          username: data.username,
          email: data.email,
        })
      }
    } catch (error) {
      console.error("Error refreshing user data:", error)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, <span className="font-medium text-foreground">{user.username}</span>
            </p>
          </div>
          <Card className="w-full md:w-auto p-4 flex flex-row justify-between items-center gap-4 shadow-sm">
            <div>
              <p className="text-sm text-muted-foreground">Your Balance</p>
              <p className="text-2xl font-bold gradient-text">{Number(user.balance).toFixed(2)} DZD</p>
            </div>
            <Button
              onClick={() => document.getElementById("recharge-tab")?.click()}
              className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90"
            >
              Recharge
            </Button>
          </Card>
        </div>

        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
            <TabsTrigger value="services" id="services-tab">
              Services
            </TabsTrigger>
            <TabsTrigger value="orders" id="orders-tab">
              Orders
            </TabsTrigger>
            <TabsTrigger value="notifications" id="notifications-tab">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="recharge" id="recharge-tab">
              Recharge
            </TabsTrigger>
            <TabsTrigger value="gift" id="gift-tab">
              Gift & Redeem
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <Button variant="outline" onClick={syncServices} disabled={isServicesLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isServicesLoading ? "animate-spin" : ""}`} />
                  Sync
                </Button>
              </div>
            </div>

            {isServicesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
              </div>
            ) : filteredServices.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No services found. Try adjusting your search or filters.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service) => (
                  <Card
                    key={service.id}
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-brand-primary/10 hover:border-brand-primary/30"
                    onClick={() => handleServiceClick(service.id)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">
                            {service.description || "No description available"}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                        >
                          ID: {service.service_id}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="flex justify-between items-center mt-2">
                        <Badge
                          variant="secondary"
                          className="bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20"
                        >
                          {service.category}
                        </Badge>
                        <p className="font-bold text-lg gradient-text">
                          {service.price_per_1000 ? `${service.price_per_1000.toFixed(2)} DZD` : "N/A"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders">{user && user.id && <OrdersList userId={user.id} />}</TabsContent>

          <TabsContent value="notifications">{user && user.id && <NotificationsList userId={user.id} />}</TabsContent>

          <TabsContent value="recharge">
            {user && user.id && <BalanceRechargeForm userId={user.id} onSuccess={refreshUserData} />}
          </TabsContent>

          <TabsContent value="gift" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {user && user.id && (
                <>
                  <GiftBalanceForm userId={user.id} currentBalance={Number(user.balance)} onSuccess={refreshUserData} />
                  <RedeemCouponForm userId={user.id} onSuccess={refreshUserData} />
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
