"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { verifyAdminCredentials } from "@/lib/utils/auth"
import { ModeToggle } from "@/components/mode-toggle"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Menu, X, User, LogIn } from "lucide-react"
import { Logo } from "@/components/logo"
import { useAuth } from "@/lib/hooks/use-auth"

export function Header() {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, logout } = useAuth()

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Verify admin credentials
    if (verifyAdminCredentials(username, password)) {
      // Set admin session in localStorage
      localStorage.setItem("adminSession", "true")

      toast({
        title: "Login successful",
        description: "Welcome to the admin panel",
      })

      setIsLoading(false)
      setIsAdminModalOpen(false)

      // Redirect to admin dashboard
      router.push("/admin/dashboard")
    } else {
      setError("Invalid username or password")
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
  }

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-4"
          >
            <Logo size="sm" circular={true} />
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center space-x-6"
          >
            <Link href="/" className="text-foreground hover:text-brand-primary transition-colors">
              Home
            </Link>
            <Link href="/services" className="text-foreground hover:text-brand-primary transition-colors">
              Services
            </Link>
            <Link href="/contact" className="text-foreground hover:text-brand-primary transition-colors">
              Contact
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center space-x-4"
          >
            <ModeToggle />

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="border-brand-primary/50 text-brand-primary hover:bg-brand-primary/10"
                >
                  <User className="mr-2 h-4 w-4" />
                  {user.username || "Account"}
                </Button>
                <Button variant="ghost" onClick={handleLogout} className="hover:text-brand-primary">
                  Logout
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAdminModalOpen(true)}
                  className="border-brand-primary/50 text-brand-primary hover:bg-brand-primary/10"
                >
                  Admin Panel
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="border-brand-primary/50 text-brand-primary hover:bg-brand-primary/10"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button
                  onClick={() => router.push("/register")}
                  className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90"
                >
                  Register
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAdminModalOpen(true)}
                  className="border-brand-primary/50 text-brand-primary hover:bg-brand-primary/10"
                >
                  Admin Panel
                </Button>
              </div>
            )}
          </motion.div>

          {/* Mobile Navigation */}
          <div className="flex items-center space-x-4 md:hidden">
            <ModeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 py-4 border-t"
          >
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-foreground hover:text-brand-primary transition-colors">
                Home
              </Link>
              <Link href="/services" className="text-foreground hover:text-brand-primary transition-colors">
                Services
              </Link>
              <Link href="/contact" className="text-foreground hover:text-brand-primary transition-colors">
                Contact
              </Link>

              {isAuthenticated && user ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    className="border-brand-primary/50 text-brand-primary hover:bg-brand-primary/10"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {user.username || "Account"}
                  </Button>
                  <Button variant="ghost" onClick={handleLogout} className="hover:text-brand-primary">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/login")}
                    className="border-brand-primary/50 text-brand-primary hover:bg-brand-primary/10"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                  <Button
                    onClick={() => router.push("/register")}
                    className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90"
                  >
                    Register
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => setIsAdminModalOpen(true)}
                className="border-brand-primary/50 text-brand-primary hover:bg-brand-primary/10"
              >
                Admin Panel
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
            <DialogDescription>Enter your admin credentials to access the admin panel.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminLogin}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}
