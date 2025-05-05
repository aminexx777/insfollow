"use client"

import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  username: string
  balance: number
  is_blocked: boolean
  email_blocked: boolean
  created_at: string
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleUserBlock(userId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase.from("users").update({ is_blocked: !currentStatus }).eq("id", userId)

      if (error) throw error

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, is_blocked: !currentStatus } : user)))

      toast({
        title: "Success",
        description: `User ${!currentStatus ? "blocked" : "unblocked"} successfully`,
      })
    } catch (error) {
      console.error("Error toggling user block status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  async function toggleEmailBlock(userId: string, email: string, currentStatus: boolean) {
    try {
      const { error } = await supabase.from("users").update({ email_blocked: !currentStatus }).eq("id", userId)

      if (error) throw error

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, email_blocked: !currentStatus } : user)))

      toast({
        title: "Success",
        description: `Email ${!currentStatus ? "blocked" : "unblocked"} successfully`,
      })
    } catch (error) {
      console.error("Error toggling email block status:", error)
      toast({
        title: "Error",
        description: "Failed to update email status",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Users Management</h1>
          <Button onClick={fetchUsers} disabled={isLoading}>
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <Input
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.balance.toFixed(2)} DZD</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${user.is_blocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                          >
                            {user.is_blocked ? "Blocked" : "Active"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant={user.is_blocked ? "outline" : "destructive"}
                              size="sm"
                              onClick={() => toggleUserBlock(user.id, user.is_blocked)}
                            >
                              {user.is_blocked ? "Unblock" : "Block"}
                            </Button>
                            <Button
                              variant={user.email_blocked ? "outline" : "destructive"}
                              size="sm"
                              onClick={() => toggleEmailBlock(user.id, user.email, user.email_blocked)}
                            >
                              {user.email_blocked ? "Unblock Email" : "Block Email"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
