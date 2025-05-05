"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function createOrder(orderData: {
  user_id: string
  service_id: string
  link: string
  quantity: number
  amount: number
}) {
  const supabase = createServerClient()

  // Create the order
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: orderData.user_id,
      service_id: orderData.service_id,
      link: orderData.link,
      quantity: orderData.quantity,
      amount: orderData.amount,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`)
  }

  // Update user balance
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("balance")
    .eq("id", orderData.user_id)
    .single()

  if (userError) {
    throw new Error(`Failed to get user balance: ${userError.message}`)
  }

  const newBalance = userData.balance - orderData.amount
  const { error: updateError } = await supabase
    .from("users")
    .update({ balance: newBalance })
    .eq("id", orderData.user_id)

  if (updateError) {
    throw new Error(`Failed to update user balance: ${updateError.message}`)
  }

  return data
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`)
  }

  return data
}

export async function getOrderById(orderId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      service:service_id (*),
      user:user_id (*)
    `)
    .eq("id", orderId)
    .single()

  if (error) {
    throw new Error(`Failed to get order: ${error.message}`)
  }

  return data
}

export async function getUserOrders(userId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      service:service_id (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to get user orders: ${error.message}`)
  }

  return data
}

export async function getAllOrders() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      service:service_id (*),
      user:user_id (*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to get all orders: ${error.message}`)
  }

  return data
}
