"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Header } from "@/components/header"
import { changePassword, changeUsername } from "@/lib/services/auth-service"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  // Username change state
  const [newUsername, setNewUsername] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      toast({
        title: "Not logged in",
        description: "Please login to access your account",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setUser(JSON.parse(userData))
  }, [router, toast])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords match
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await changePassword(user.id, currentPassword, newPassword)

      if (result.success) {
        toast({
          title: "Password changed",
          description: "Your password has been updated successfully",
        })

        // Reset form
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
      } else {
        toast({
          title: "Failed to change password",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Password change error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newUsername) {
      toast({
        title: "Username required",
        description: "Please enter a new username",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await changeUsername(user.id, newUsername)

      if (result.success) {
        // Update user in localStorage
        const updatedUser = { ...user, username: newUsername }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser)

        toast({
          title: "Username changed",
          description: "Your username has been updated successfully",
        })

        // Reset form
        setNewUsername("")
      } else {
        toast({
          title: "Failed to change username",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Username change error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card className="md:col-span-1 card-hover">
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <div className="font-medium">{user.name}</div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <div className="font-medium">{user.email}</div>
                    </div>
                    <div>
                      <Label>Username</Label>
                      <div className="font-medium">@{user.username}</div>
                    </div>
                    <div>
                      <Label>Balance</Label>
                      <div className="font-medium text-lg">{Number(user.balance).toFixed(2)} DZD</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="password" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="password">Change Password</TabsTrigger>
                      <TabsTrigger value="username">Change Username</TabsTrigger>
                    </TabsList>
                    <TabsContent value="password" className="mt-4">
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                          <Input
                            id="confirmNewPassword"
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Updating..." : "Change Password"}
                        </Button>
                      </form>
                    </TabsContent>
                    <TabsContent value="username" className="mt-4">
                      <form onSubmit={handleUsernameChange} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentUsername">Current Username</Label>
                          <Input id="currentUsername" value={user.username} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newUsername">New Username</Label>
                          <Input
                            id="newUsername"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Updating..." : "Change Username"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
