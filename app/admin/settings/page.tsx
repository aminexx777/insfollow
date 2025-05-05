"use client"

import AdminLayout from "@/components/admin/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function SystemSettings() {
  const [isServicesEnabled, setIsServicesEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("system_settings").select("*").eq("key", "services_paused").single()

      if (error && error.code !== "PGRST116") throw error

      // If setting exists, update state
      if (data) {
        setIsServicesEnabled(data.value !== "true")
      } else {
        // If setting doesn't exist, create it
        await supabase.from("system_settings").insert([
          {
            key: "services_paused",
            value: "false",
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch system settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleToggleServices() {
    setIsSaving(true)
    try {
      const newValue = !isServicesEnabled

      const { error } = await supabase
        .from("system_settings")
        .update({ value: newValue ? "true" : "false" })
        .eq("key", "services_paused")

      if (error) throw error

      setIsServicesEnabled(!newValue)

      toast({
        title: "Settings updated",
        description: `Services are now ${newValue ? "paused" : "enabled"}`,
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">System Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Services Status</CardTitle>
            <CardDescription>Enable or disable all services</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading settings...</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Services</h3>
                  <p className="text-sm text-muted-foreground">
                    {isServicesEnabled ? "Services are currently enabled" : "Services are currently paused"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={isServicesEnabled} onCheckedChange={handleToggleServices} disabled={isSaving} />
                  <span>{isServicesEnabled ? "Enabled" : "Paused"}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
