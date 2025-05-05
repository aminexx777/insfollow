import { supabase } from "@/lib/supabase/client"
import bcrypt from "bcryptjs"

export interface RegisterData {
  name: string
  email: string
  username: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export async function registerUser(data: RegisterData) {
  try {
    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from("users")
      .select("username")
      .eq("username", data.username)
      .single()

    if (existingUsername) {
      return { success: false, message: "Username already taken" }
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase.from("users").select("email").eq("email", data.email).single()

    if (existingEmail) {
      return { success: false, message: "Email already registered" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Insert user
    const { error } = await supabase.from("users").insert([
      {
        name: data.name,
        email: data.email,
        username: data.username,
        password: hashedPassword,
        balance: 0,
        is_blocked: false,
        email_blocked: false,
      },
    ])

    if (error) throw error

    return { success: true, message: "Registration successful" }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "Registration failed" }
  }
}

export async function loginUser(data: LoginData) {
  try {
    console.log("Attempting login for email:", data.email)

    // Get user by email
    const { data: user, error } = await supabase.from("users").select("*").eq("email", data.email).single()

    if (error) {
      console.error("Database error during login:", error)
      return { success: false, message: "Database error. Please try again later." }
    }

    if (!user) {
      console.log("No user found with email:", data.email)
      return { success: false, message: "Invalid email or password" }
    }

    console.log("User found, verifying password")

    // Check if user is blocked
    if (user.is_blocked || user.email_blocked) {
      return { success: false, message: "Your account has been blocked" }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password)

    if (!isPasswordValid) {
      console.log("Invalid password for user:", data.email)
      return { success: false, message: "Invalid email or password" }
    }

    console.log("Password verified, creating session")

    // Create session with all necessary user data
    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      balance: user.balance,
    }

    console.log("Login successful for:", data.email)
    return { success: true, message: "Login successful", user: session }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "Login failed. Please try again later." }
  }
}

// Function to validate a stored user session
export async function validateUserSession(userData: any) {
  if (!userData || !userData.id) {
    console.log("Invalid user data in session")
    return { valid: false, message: "Invalid session" }
  }

  try {
    // Check if user exists in database
    const { data: user, error } = await supabase.from("users").select("*").eq("id", userData.id).single()

    if (error) {
      console.error("Error validating user session:", error)
      // Don't invalidate session on temporary database errors
      return { valid: true, message: "Database error, using cached session" }
    }

    if (!user) {
      console.log("User not found in database")
      return { valid: false, message: "User not found" }
    }

    if (user.is_blocked || user.email_blocked) {
      console.log("User account is blocked")
      return { valid: false, message: "Account is blocked" }
    }

    // Update session with latest data
    const updatedSession = {
      ...userData,
      name: user.name,
      email: user.email,
      username: user.username,
      balance: user.balance,
    }

    return { valid: true, user: updatedSession }
  } catch (error) {
    console.error("Session validation error:", error)
    // On error, keep the session valid to prevent logout loops
    return { valid: true, message: "Error validating session, using cached data", user: userData }
  }
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    // Get user
    const { data: user, error } = await supabase.from("users").select("password").eq("id", userId).single()

    if (error || !user) {
      return { success: false, message: "User not found" }
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return { success: false, message: "Current password is incorrect" }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    const { error: updateError } = await supabase.from("users").update({ password: hashedPassword }).eq("id", userId)

    if (updateError) throw updateError

    return { success: true, message: "Password changed successfully" }
  } catch (error) {
    console.error("Change password error:", error)
    return { success: false, message: "Failed to change password" }
  }
}

export async function changeUsername(userId: string, newUsername: string) {
  try {
    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from("users")
      .select("username")
      .eq("username", newUsername)
      .single()

    if (existingUsername) {
      return { success: false, message: "Username already taken" }
    }

    // Update username
    const { error } = await supabase.from("users").update({ username: newUsername }).eq("id", userId)

    if (error) throw error

    return { success: true, message: "Username changed successfully" }
  } catch (error) {
    console.error("Change username error:", error)
    return { success: false, message: "Failed to change username" }
  }
}
