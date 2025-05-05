"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Edit2, Save, X } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"

interface PriceEditorProps {
  serviceId: string
  initialPrice: number
  initialCustomPrice: number
  initialPricePer1000: number
  hasPricePer1000Column?: boolean
  onUpdate?: (newPrice: number, newCustomPrice: number, newPricePer1000: number) => void
  label?: string
  size?: "sm" | "md" | "lg"
}

export function PriceEditor({
  serviceId,
  initialPrice,
  initialCustomPrice,
  initialPricePer1000,
  hasPricePer1000Column = false,
  onUpdate,
  label = "Price",
  size = "md",
}: PriceEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [price, setPrice] = useState(Number(initialPrice) || 0)
  const [customPrice, setCustomPrice] = useState(Number(initialCustomPrice) || 0)
  const [pricePer1000, setPricePer1000] = useState(Number(initialPricePer1000) || 0)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { t, dir } = useTranslation()

  useEffect(() => {
    setPrice(Number(initialPrice) || 0)
    setCustomPrice(Number(initialCustomPrice) || 0)
    setPricePer1000(Number(initialPricePer1000) || 0)
  }, [initialPrice, initialCustomPrice, initialPricePer1000])

  const handleSave = async () => {
    if (isNaN(price) || isNaN(customPrice) || isNaN(pricePer1000)) {
      toast({
        title: t("Invalid price"),
        description: t("Please enter valid numbers for all price fields"),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Create update data object with only the fields that exist in the database
      const updateData: Record<string, any> = {
        price,
        custom_price: customPrice,
      }

      // Only include price_per_1000 if the column exists
      if (hasPricePer1000Column) {
        updateData.price_per_1000 = pricePer1000
      }

      const { error } = await supabase.from("services").update(updateData).eq("id", serviceId)

      if (error) throw error

      toast({
        title: t("Price updated"),
        description: t("The service price has been updated successfully"),
      })

      if (onUpdate) {
        onUpdate(price, customPrice, pricePer1000)
      }

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating price:", error)
      toast({
        title: t("Error"),
        description: t("Failed to update price"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setPrice(initialPrice)
    setCustomPrice(initialCustomPrice)
    setPricePer1000(initialPricePer1000)
    setIsEditing(false)
  }

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2" dir={dir}>
        <div className={sizeClasses[size]}>
          <span className="font-medium">{t(label)}:</span>{" "}
          <span className="font-bold">{(customPrice || 0).toFixed(2)} DZD</span>
          <span className="text-xs text-muted-foreground ml-1">
            ({t("API")}: {(price || 0).toFixed(2)}, {t("Per 1000")}: {(pricePer1000 || 0).toFixed(2)})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setIsEditing(true)}
          title={t("Edit price")}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2 border p-3 rounded-md" dir={dir}>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1">
          <Label htmlFor="custom-price">{t("Custom Price (DZD)")}</Label>
          <Input
            id="custom-price"
            type="number"
            step="0.01"
            value={customPrice}
            onChange={(e) => setCustomPrice(Number.parseFloat(e.target.value) || 0)}
            placeholder={t("Enter custom price")}
          />
          <p className="text-xs text-muted-foreground">{t("Price shown to customers")}</p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="price-per-1000">{t("Price Per 1000 (DZD)")}</Label>
          <Input
            id="price-per-1000"
            type="number"
            step="0.01"
            value={pricePer1000}
            onChange={(e) => setPricePer1000(Number.parseFloat(e.target.value) || 0)}
            placeholder={t("Enter price per 1000")}
          />
          <p className="text-xs text-muted-foreground">
            {hasPricePer1000Column
              ? t("Used to calculate order total")
              : t("This will be stored locally until database is updated")}
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="api-price">{t("API Price (DZD)")}</Label>
          <Input
            id="api-price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number.parseFloat(e.target.value) || 0)}
            placeholder={t("Enter API price")}
          />
          <p className="text-xs text-muted-foreground">{t("Original price from API")}</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={isLoading}>
          <X className="h-4 w-4 mr-1" />
          {t("Cancel")}
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center">
              <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {t("Saving...")}
            </span>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              {t("Save")}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
