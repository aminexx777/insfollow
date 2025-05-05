"use server"

import { createServerClient } from "@/lib/supabase/server"

export interface ServiceData {
  name: string
  description?: string
  category: string
  price_per_1000: number
  min_order: number
  max_order: number
  custom_price?: number
  is_visible: boolean
}

export async function createService(serviceData: ServiceData) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("services").insert(serviceData).select().single()

  if (error) {
    throw new Error(`Failed to create service: ${error.message}`)
  }

  return data
}

export async function updateService(id: string, serviceData: Partial<ServiceData>) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("services").update(serviceData).eq("id", id).select().single()

  if (error) {
    throw new Error(`Failed to update service: ${error.message}`)
  }

  return data
}

export async function deleteService(id: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("services").delete().eq("id", id)

  if (error) {
    throw new Error(`Failed to delete service: ${error.message}`)
  }

  return true
}

export async function getServiceById(id: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("services").select("*").eq("id", id).single()

  if (error) {
    throw new Error(`Failed to get service: ${error.message}`)
  }

  return data
}

export async function getAllServices() {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("services").select("*").order("category").order("name")

  if (error) {
    throw new Error(`Failed to get services: ${error.message}`)
  }

  return data
}

export async function getVisibleServices() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_visible", true)
    .order("category")
    .order("name")

  if (error) {
    throw new Error(`Failed to get visible services: ${error.message}`)
  }

  return data
}

export async function getServiceCategories() {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("services").select("category").order("category")

  if (error) {
    throw new Error(`Failed to get service categories: ${error.message}`)
  }

  // Extract unique categories
  const categories = [...new Set(data.map((item) => item.category))]
  return categories
}

export async function toggleServiceVisibility(id: string, isVisible: boolean) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("services")
    .update({ is_visible: isVisible })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to toggle service visibility: ${error.message}`)
  }

  return data
}
