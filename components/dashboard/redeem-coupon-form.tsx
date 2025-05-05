"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { useState } from "react"

interface RedeemCouponFormProps {
  userId: string
  onSuccess?: () => void
}

export function RedeemCouponForm({ userId, onSuccess }: RedeemCouponFormProps) {
  const [couponCode, setCouponCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!couponCode) {
      toast({
        title: "Missing coupon code",
        description: "Please enter a coupon code",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Find the coupon
      const { data: coupon, error: couponError } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .single()

      if (couponError || !coupon) {
        toast({
          title: "Invalid coupon",
          description: "The coupon code you entered is invalid",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Check if coupon is already used
      if (coupon.is_used) {
        toast({
          title: "Coupon already used",
          description: "This coupon has already been redeemed",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Get user's current balance
      const { data: user, error: userError } = await supabase.from("users").select("balance").eq("id", userId).single()

      if (userError) throw userError

      // Update user balance
      const newBalance = Number(user.balance) + Number(coupon.amount)
      const { error: updateError } = await supabase.from("users").update({ balance: newBalance }).eq("id", userId)

      if (updateError) throw updateError

      // Mark coupon as used
      const { error: couponUpdateError } = await supabase
        .from("coupons")
        .update({
          is_used: true,
          used_by: userId,
          used_at: new Date().toISOString(),
        })
        .eq("id", coupon.id)

      if (couponUpdateError) throw couponUpdateError

      // Log activity
      await supabase.from("user_activity").insert([
        {
          user_id: userId,
          activity_type: "COUPON_REDEEMED",
          description: `Redeemed coupon ${couponCode} for ${coupon.amount.toFixed(2)} DZD`,
        },
      ])

      toast({
        title: "Coupon redeemed",
        description: `Successfully added ${coupon.amount.toFixed(2)} DZD to your balance`,
      })

      // Reset form
      setCouponCode("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error redeeming coupon:", error)
      toast({
        title: "Error",
        description: "Failed to redeem coupon",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="couponCode">Coupon Code</Label>
        <Input
          id="couponCode"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="Enter coupon code"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Redeeming..." : "Redeem Coupon"}
      </Button>
    </form>
  )
}
