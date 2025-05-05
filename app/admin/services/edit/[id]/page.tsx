"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { ServiceForm } from "@/components/admin/service-form"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EditServicePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchService() {
      if (!params.id) return

      try {
        const { data, error } = await supabase.from("services").select("*").eq("id", params.id).single()

        if (error) throw error
        setService(data)
      } catch (error) {
        console.error("Error fetching service:", error)
        toast({
          title: "Error",
          description: "Failed to load service details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [params.id, toast])

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Service not found</h1>
          <p className="mt-2">The requested service could not be found.</p>
          <Button onClick={() => router.push("/admin/services")} className="mt-4">
            Back to Services
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Service</h1>
      <div className="bg-card rounded-lg border p-6">
        <ServiceForm mode="edit" initialData={service} />
      </div>
    </div>
  )
}
