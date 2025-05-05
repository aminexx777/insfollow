"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client" // Use client-side Supabase
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Loader2, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import { PageHelp } from "@/components/page-help"
import { useLanguage } from "@/lib/i18n/context"

export default function OrderPage() {
  const params = useParams()
  const serviceId = params?.serviceId as string
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth()
  const [service, setService] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState("")
  const [calculatedPrice, setCalculatedPrice] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { t, dir } = useLanguage()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    } else if (isAuthenticated) {
      fetchService()
    }
  }, [isAuthenticated, authLoading, serviceId])

  useEffect(() => {
    if (service && quantity) {
      calculatePrice()
    }
  }, [service, quantity])

  async function fetchService() {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.from("services").select("*").eq("id", serviceId).single()

      if (error) throw error

      if (!data) {
        throw new Error("Service not found")
      }

      if (!data.is_visible) {
        throw new Error("This service is currently unavailable")
      }

      setService(data)
      setQuantity(data.min_order.toString())
    } catch (error) {
      console.error("Error fetching service:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch service")
    } finally {
      setIsLoading(false)
    }
  }

  function calculatePrice() {
    if (!service || !quantity) return

    const qty = Number.parseInt(quantity)
    if (isNaN(qty)) return

    // Use price_per_1000 for calculation if available, otherwise use custom_price
    const pricePerUnit = (service.price_per_1000 || service.custom_price) / 1000
    const total = pricePerUnit * qty
    setCalculatedPrice(total)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!user || !user.id) {
      setError("You must be logged in to place an order")
      return
    }

    if (!link) {
      setError("Please enter a link")
      return
    }

    const qty = Number.parseInt(quantity)
    if (isNaN(qty)) {
      setError("Please enter a valid quantity")
      return
    }

    if (qty < service.min_order || qty > service.max_order) {
      setError(`Quantity must be between ${service.min_order} and ${service.max_order}`)
      return
    }

    setIsSubmitting(true)

    try {
      // Check user balance first
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("balance")
        .eq("id", user.id)
        .single()

      if (userError) throw userError

      if (userData.balance < calculatedPrice) {
        setError("Insufficient balance. Please recharge your account.")
        return
      }

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          service_id: service.id,
          link,
          quantity: qty,
          amount: calculatedPrice,
          status: "pending",
        })
        .select()

      if (orderError) throw orderError

      // Update user balance
      const newBalance = userData.balance - calculatedPrice
      const { error: updateError } = await supabase.from("users").update({ balance: newBalance }).eq("id", user.id)

      if (updateError) throw updateError

      // Update local user state
      if (updateUser) {
        updateUser({ balance: newBalance })
      }

      setSuccess("Order placed successfully!")
      toast({
        title: "Order Placed",
        description: "Your order has been placed successfully",
      })

      // Clear form
      setLink("")
      setQuantity(service.min_order.toString())
    } catch (error) {
      console.error("Error placing order:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || authLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    )
  }

  if (error && !service) {
    return (
      <>
        <Header />
        <div className="container mx-auto py-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                {t("error")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push("/services")} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("backToServices")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-6 px-4" dir={dir}>
        <Button onClick={() => router.push("/services")} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToServices")}
        </Button>

        <PageHelp title={t("placeOrder")} description={t("placeOrderHelp")} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("placeOrder")}</CardTitle>
                <CardDescription>{t("fillDetailsBelow")}</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4 flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 p-4 rounded-md mb-4 flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{success}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="link">{t("link")}</Label>
                    <Input
                      id="link"
                      placeholder={t("enterLink")}
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">{t("linkHelp")}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">{t("quantity")}</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder={t("enterQuantity")}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min={service?.min_order}
                      max={service?.max_order}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      {t("minQuantity")}: {service?.min_order} | {t("maxQuantity")}: {service?.max_order}
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("processing")}
                        </>
                      ) : (
                        t("placeOrder")
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t("orderSummary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{t("service")}</h3>
                  <p>{service?.name}</p>
                </div>
                <div>
                  <h3 className="font-medium">{t("description")}</h3>
                  <p className="text-sm text-muted-foreground">{service?.description || t("noDescription")}</p>
                </div>
                <div>
                  <h3 className="font-medium">{t("price")}</h3>
                  <p>{service?.custom_price} DZD</p>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{t("quantity")}</h3>
                    <p>{quantity || 0}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <h3 className="font-medium">{t("totalPrice")}</h3>
                    <p className="font-bold text-lg">{calculatedPrice.toFixed(2)} DZD</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
