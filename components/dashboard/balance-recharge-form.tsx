"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n/context"
import { supabase } from "@/lib/supabase/client"
import { useState } from "react"

interface BalanceRechargeFormProps {
  userId: string
  onSuccess?: () => void
}

export function BalanceRechargeForm({ userId, onSuccess }: BalanceRechargeFormProps) {
  const { t, locale } = useTranslation()
  const [amount, setAmount] = useState("")
  const [paymentTime, setPaymentTime] = useState("")
  const [paymentDate, setPaymentDate] = useState("")
  const [description, setDescription] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!amount || !paymentTime || !paymentDate) {
      toast({
        title: t("Missing fields"),
        description: t("Please fill in all required fields"),
        variant: "destructive",
      })
      return
    }

    if (!receiptFile) {
      toast({
        title: t("Receipt required"),
        description: t("Please upload a receipt image"),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create balance request without receipt URL first
      const { data: requestData, error: insertError } = await supabase
        .from("balance_requests")
        .insert([
          {
            user_id: userId,
            amount: Number(amount),
            payment_time: paymentTime,
            payment_date: paymentDate,
            description,
            status: "pending",
          },
        ])
        .select()

      if (insertError) throw insertError

      if (!requestData || requestData.length === 0) {
        throw new Error("Failed to create balance request")
      }

      const requestId = requestData[0].id

      try {
        // Try to upload to 'uploads' bucket instead of 'receipts'
        const fileExt = receiptFile.name.split(".").pop()
        const fileName = `receipts/${userId}-${Date.now()}.${fileExt}`

        // Check if uploads bucket exists
        const { data: buckets } = await supabase.storage.listBuckets()
        const bucketName = buckets?.find((b) => b.name === "uploads") ? "uploads" : "public"

        const { error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, receiptFile)

        if (uploadError) {
          console.warn("Upload error:", uploadError)
          // Continue without receipt image if upload fails
        } else {
          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from(bucketName).getPublicUrl(fileName)

          // Update the balance request with the receipt URL
          await supabase.from("balance_requests").update({ receipt_url: publicUrl }).eq("id", requestId)
        }
      } catch (uploadError) {
        console.warn("Failed to upload receipt:", uploadError)
        // Continue without receipt image if upload fails
      }

      toast({
        title: t("Request submitted"),
        description: t("Your balance recharge request has been submitted for approval"),
      })

      // Reset form
      setAmount("")
      setPaymentTime("")
      setPaymentDate("")
      setDescription("")
      setReceiptFile(null)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error submitting balance request:", error)
      toast({
        title: t("Error"),
        description: t("Failed to submit balance request"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formDirection = locale === "ar" ? "rtl" : "ltr"

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={formDirection}>
      <div className="space-y-2">
        <Label htmlFor="amount">{t("Amount (DZD)")}</Label>
        <Input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentTime">{t("Payment Time")}</Label>
        <Input
          id="paymentTime"
          type="time"
          value={paymentTime}
          onChange={(e) => setPaymentTime(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentDate">{t("Payment Date")}</Label>
        <Input
          id="paymentDate"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="receipt">{t("Receipt Image")}</Label>
        <Input
          id="receipt"
          type="file"
          accept="image/*"
          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("Description (Optional)")}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("Any additional information...")}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t("Submitting...") : t("Submit Request")}
      </Button>
    </form>
  )
}
