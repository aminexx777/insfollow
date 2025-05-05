"use client"

import { useEffect, useState, createContext, useContext, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { validateUserSession } from "@/lib/services/auth-service"
import { useToast } from "@/components/ui/use-toast"

// Define the user type
export interface User {
  id: string
  name: string
  email: string
  username: string
  balance: number
}

// Define the auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (userData: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (!storedUser) {
          setIsLoading(false)
          return
        }

        const userData = JSON.parse(storedUser)
        const result = await validateUserSession(userData)

        if (result.valid && result.user) {
          setUser(result.user)
          // Update localStorage with latest user data if available
          localStorage.setItem("user", JSON.stringify(result.user))
        } else {
          // Clear invalid session
          localStorage.removeItem("user")
          setUser(null)

          if (
            window.location.pathname.startsWith("/dashboard") ||
            window.location.pathname.startsWith("/account") ||
            window.location.pathname.startsWith("/order")
          ) {
            toast({
              title: "Session expired",
              description: result.message || "Please log in again",
              variant: "destructive",
            })
            router.push("/login")
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
        // Don't clear session on error to prevent logout loops
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [router, toast])

  // Login function
  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/")
  }

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
