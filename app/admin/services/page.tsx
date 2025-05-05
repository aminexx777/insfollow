"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Service {
  id: string
  name: string
  category: string
  price_per_1000: number
  custom_price: number | null
  min_order: number
  max_order: number
  is_visible: boolean
}

export default function AdminServicesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("services").select("*").order("category").order("name")

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error("Error fetching services:", error)
      toast({
        title: "Error",
        description: "Failed to fetch services",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function toggleServiceStatus(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase.from("services").update({ is_visible: !currentStatus }).eq("id", id)

      if (error) throw error

      // Update local state
      setServices(services.map((service) => (service.id === id ? { ...service, is_visible: !currentStatus } : service)))

      toast({
        title: "Status updated",
        description: `Service ${!currentStatus ? "enabled" : "disabled"} successfully`,
      })
    } catch (error) {
      console.error("Error updating service status:", error)
      toast({
        title: "Error",
        description: "Failed to update service status",
        variant: "destructive",
      })
    }
  }

  function confirmDelete(id: string) {
    setServiceToDelete(id)
    setDeleteDialogOpen(true)
  }

  async function deleteService() {
    if (!serviceToDelete) return

    try {
      const { error } = await supabase.from("services").delete().eq("id", serviceToDelete)

      if (error) throw error

      // Update local state
      setServices(services.filter((service) => service.id !== serviceToDelete))

      toast({
        title: "Service deleted",
        description: "The service has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting service:", error)
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      })
    } finally {
      setServiceToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Services</h1>
        <div className="flex space-x-2">
          <Button onClick={fetchServices} variant="outline">
            Refresh
          </Button>
          <Button onClick={() => router.push("/admin/services/new")}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price per 1000</TableHead>
              <TableHead>Custom Price</TableHead>
              <TableHead>Min Order</TableHead>
              <TableHead>Max Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>{service.price_per_1000.toFixed(2)} DZD</TableCell>
                <TableCell>{service.custom_price ? `${service.custom_price.toFixed(2)} DZD` : "-"}</TableCell>
                <TableCell>{service.min_order}</TableCell>
                <TableCell>{service.max_order}</TableCell>
                <TableCell>
                  <Switch
                    checked={service.is_visible}
                    onCheckedChange={() => toggleServiceStatus(service.id, service.is_visible)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/services/edit/${service.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => confirmDelete(service.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteService}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
