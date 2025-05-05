import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { service_id, link, quantity, user_id } = body

    console.log(`Creating order for service ${service_id}, quantity ${quantity}`)

    if (!service_id || !link || !quantity || !user_id) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: service_id, link, quantity, or user_id" },
        { status: 400 },
      )
    }

    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("id", service_id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ success: false, message: "Service not found or unavailable" }, { status: 404 })
    }

    // Validate order quantity
    if (quantity < service.min_order || quantity > service.max_order) {
      return NextResponse.json(
        {
          success: false,
          message: `Quantity must be between ${service.min_order} and ${service.max_order}`,
        },
        { status: 400 },
      )
    }

    // Calculate order amount
    const price_per_1000 = service.price_per_1000 || service.custom_price
    const amount = (price_per_1000 / 1000) * quantity

    // Get user balance
    const { data: user, error: userError } = await supabase.from("users").select("balance").eq("id", user_id).single()

    if (userError || !user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Check if user has enough balance
    if (user.balance < amount) {
      return NextResponse.json({ success: false, message: "Insufficient balance" }, { status: 400 })
    }

    // Begin transaction
    // 1. Deduct user balance
    const { error: balanceError } = await supabase
      .from("users")
      .update({ balance: user.balance - amount })
      .eq("id", user_id)

    if (balanceError) {
      console.error("Error updating user balance:", balanceError)
      return NextResponse.json({ success: false, message: "Failed to update user balance" }, { status: 500 })
    }

    // 2. Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id,
          service_id,
          link,
          quantity,
          amount,
          status: "pending",
        },
      ])
      .select()

    if (orderError) {
      console.error("Error creating order:", orderError)
      // Rollback balance update
      await supabase.from("users").update({ balance: user.balance }).eq("id", user_id)

      return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 })
    }

    // 3. Create notification for user
    await supabase.from("notifications").insert([
      {
        user_id,
        title: "Order Placed",
        message: `Your order for ${service.name} has been placed successfully. Order ID: ${order[0].id}`,
        is_read: false,
      },
    ])

    // 4. Create notification for admin
    await supabase.from("notifications").insert([
      {
        user_id: null, // null user_id for admin notifications
        title: "New Order",
        message: `A new order has been placed for ${service.name}. Order ID: ${order[0].id}`,
        is_read: false,
        is_admin: true,
      },
    ])

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order: order[0],
    })
  } catch (error) {
    console.error("Error processing order:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
