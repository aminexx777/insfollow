"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { useState } from "react"

interface GiftBalanceFormProps {
  userId: string
  currentBalance?: number
  onSuccess?: () => void
}

export function GiftBalanceForm({ userId, currentBalance = 0, onSuccess }: GiftBalanceFormProps) {
  const [username, setUsername] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!username || !amount) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const giftAmount = Number(amount)

    if (isNaN(giftAmount) || giftAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (giftAmount > currentBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough balance for this gift",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Find recipient user
      const { data: recipient, error: recipientError } = await supabase
        .from("users")
        .select("id, username, balance")
        .eq("username", username)
        .single()

      if (recipientError || !recipient) {
        toast({
          title: "User not found",
          description: "Could not find a user with that username",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Don't allow sending to self
      if (recipient.id === userId) {
        toast({
          title: "Invalid recipient",
          description: "You cannot send a gift to yourself",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Start a transaction
      const { error: transactionError } = await supabase.rpc("transfer_balance", {
        sender_id: userId,
        recipient_id: recipient.id,
        transfer_amount: giftAmount,
      })

      if (transactionError) throw transactionError

      // Log activity for sender
      await supabase.from("user_activity").insert([
        {
          user_id: userId,
          activity_type: "BALANCE_SENT",
          description: `Sent ${giftAmount.toFixed(2)} DZD to ${recipient.username}`,
        },
      ])

      // Log activity for recipient
      await supabase.from("user_activity").insert([
        {
          user_id: recipient.id,
          activity_type: "BALANCE_RECEIVED",
          description: `Received ${giftAmount.toFixed(2)} DZD gift from a user`,
        },
      ])

      // Create notification for recipient
      await supabase.from("notifications").insert([
        {
          user_id: recipient.id,
          title: "Balance Gift Received",
          message: `You have received ${giftAmount.toFixed(2)} DZD as a gift from another user.`,
        },
      ])

      toast({
        title: "Gift sent",
        description: `Successfully sent ${giftAmount.toFixed(2)} DZD to ${recipient.username}`,
      })

      // Reset form
      setUsername("")
      setAmount("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error sending gift:", error)
      toast({
        title: "Error",
        description: "Failed to send gift",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Recipient Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (DZD)</Label>
        <Input
          id="amount"
          type="number"
          min="0.01"
          step="0.01"
          max={currentBalance}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <p className="text-sm text-muted-foreground">Available balance: {currentBalance.toFixed(2)} DZD</p>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Send Gift"}
      </Button>
    </form>
  )
}
