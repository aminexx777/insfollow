"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Header } from "@/components/header"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Instagram, Twitter, Facebook, Youtube, TwitterIcon as TikTok, Loader2 } from "lucide-react"
import { PageHelp } from "@/components/page-help"
import { useTranslation } from "@/lib/i18n/context"

interface Service {
  id: string
  name: string
  description: string
  category: string
  price_per_1000: number
  custom_price: number
  min_order: number
  max_order: number
  is_visible: boolean
  supports_dripfeed: boolean
  supports_refill: boolean
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { t, dir } = useTranslation()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchServices()
  }, [])

  useEffect(() => {
    if (services.length > 0) {
      filterServices()
    }
  }, [searchTerm, selectedCategory, services])

  async function fetchServices() {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching services...")
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_visible", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true })

      if (error) throw error

      console.log(`Successfully fetched ${data.length} services`)
      setServices(data || [])
      setFilteredServices(data || [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)
      console.error("Error fetching services:", error)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function filterServices() {
    let filtered = [...services]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((service) => service.category?.toLowerCase() === selectedCategory.toLowerCase())
    }

    setFilteredServices(filtered)
  }

  // Get unique categories
  const categories = ["all", ...new Set(services.map((service) => (service.category || "other").toLowerCase()))]

  // Get service icon based on category
  function getServiceIcon(category = "") {
    switch (category.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-6 w-6" />
      case "twitter":
      case "x":
        return <Twitter className="h-6 w-6" />
      case "facebook":
        return <Facebook className="h-6 w-6" />
      case "youtube":
        return <Youtube className="h-6 w-6" />
      case "tiktok":
        return <TikTok className="h-6 w-6" />
      default:
        return null
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background p-4 md:p-8" dir={dir}>
        <div className="container mx-auto">
          <PageHelp title={t("services")} description={t("servicesPageHelp")} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold">{t("services")}</h1>
                <p className="text-muted-foreground mt-2">{t("browseServices")}</p>
              </div>
              <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t("searchServices")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full md:w-[250px]"
                  />
                </div>
                <Button variant="outline" onClick={fetchServices} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("loading")}
                    </>
                  ) : (
                    <>
                      <Filter className="mr-2 h-4 w-4" />
                      {t("refresh")}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {categories.length > 1 && (
              <div className="mb-6 overflow-x-auto">
                <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
                  <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                    {categories.map((category) => (
                      <TabsTrigger
                        key={category}
                        value={category}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-24 bg-muted"></CardHeader>
                    <CardContent className="h-32 mt-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-destructive">{t("errorLoadingServices")}</h3>
                <p className="text-muted-foreground mt-2">{error}</p>
                <Button onClick={fetchServices} className="mt-4">
                  {t("tryAgain")}
                </Button>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold">{t("noServicesFound")}</h3>
                <p className="text-muted-foreground mt-2">{t("adjustFilters")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredServices.map((service, index) => (
                  <motion.div
                    key={service.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="card-hover h-full flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            {getServiceIcon(service.category)}
                            <CardTitle className="text-sm md:text-base">{service.name}</CardTitle>
                          </div>
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            {service.category || "Other"}
                          </span>
                        </div>
                        <CardDescription className="mt-2">{service.description || ""}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("minOrder")}</p>
                            <p className="font-medium">{service.min_order}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("maxOrder")}</p>
                            <p className="font-medium">{service.max_order}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("price")}</p>
                            <p className="font-medium">
                              {service.price_per_1000.toFixed(2)} DZD {t("per1000")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("features")}</p>
                            <div className="flex space-x-2 mt-1">
                              {service.supports_refill && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full text-xs">
                                  {t("refill")}
                                </span>
                              )}
                              {service.supports_dripfeed && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full text-xs">
                                  {t("dripFeed")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          onClick={() => {
                            if (!user) {
                              toast({
                                title: t("loginRequired"),
                                description: t("loginToOrder"),
                              })
                              router.push("/login")
                            } else {
                              router.push(`/order/${service.id}`)
                            }
                          }}
                        >
                          {t("orderNow")}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}
