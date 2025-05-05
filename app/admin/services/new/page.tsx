"use client"

import { ServiceForm } from "@/components/admin/service-form"

export default function NewServicePage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Service</h1>
      <div className="bg-card rounded-lg border p-6">
        <ServiceForm mode="create" />
      </div>
    </div>
  )
}
