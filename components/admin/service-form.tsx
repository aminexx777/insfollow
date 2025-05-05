"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"

interface ServiceFormProps {
  initialData?: {
    id?: string
    name: string
    description: string
    category: string
    price_per_1000: number
    min_order: number
    max_order: number
    is_visible: boolean
    custom_price?: number | null
  }
  mode: "create" | "edit"
}

export function ServiceForm({ initialData, mode }: ServiceFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    price_per_1000: initialData?.price_per_1000 || 0,
    min_order: initialData?.min_order || 100,
    max_order: initialData?.max_order || 10000,
    is_visible: initialData?.is_visible ?? true,
    custom_price: initialData?.custom_price || null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("price") || name.includes("order") ? Number.parseFloat(value) : value,
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_visible: checked,
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (mode === "create") {
        const { error } = await supabase.from("services").insert(formData)
        if (error) throw error

        toast({
          title: "Service created",
          description: "The service has been created successfully",
        })
      } else if (mode === "edit" && initialData?.id) {
        const { error } = await supabase.from("services").update(formData).eq("id", initialData.id)

        if (error) throw error

        toast({
          title: "Service updated",
          description: "The service has been updated successfully",
        })
      }

      router.push("/admin/services")
      router.refresh()
    } catch (error) {
      console.error("Error saving service:", error)
      toast({
        title: "Error",
        description: "Failed to save service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Twitter">Twitter</SelectItem>
                <SelectItem value="YouTube">YouTube</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price_per_1000">Price per 1000</Label>
            <Input
              id="price_per_1000"
              name="price_per_1000"
              type="number"
              step="0.01"
              value={formData.price_per_1000}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_price">Custom Price (Optional)</Label>
            <Input
              id="custom_price"
              name="custom_price"
              type="number"
              step="0.01"
              value={formData.custom_price || ""}
              onChange={handleChange}
              placeholder="Leave empty to use price per 1000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_order">Minimum Order</Label>
            <Input
              id="min_order"
              name="min_order"
              type="number"
              value={formData.min_order}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_order">Maximum Order</Label>
            <Input
              id="max_order"
              name="max_order"
              type="number"
              value={formData.max_order}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="is_visible" checked={formData.is_visible} onCheckedChange={handleSwitchChange} />
          <Label htmlFor="is_visible">Enable Service</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : mode === "create" ? "Create Service" : "Update Service"}
        </Button>
      </div>
    </form>
  )
}
