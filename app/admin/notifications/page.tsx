"use client"

import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"

interface Notification {
  id: string
  user_id: string | null
  title: string
  message: string
  is_read: boolean
  created_at: string
  user?: {
    username: string
    name: string
  }
}

export default function NotificationsManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
    fetchUsers()
  }, [])

  async function fetchNotifications() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          user:user_id (
            username,
            name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, username, name")
        .order("username", { ascending: true })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  async function handleCreateNotification() {
    if (!title || !message) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (selectedUser === "all") {
        // Send to all users
        const { data: allUsers, error: usersError } = await supabase.from("users").select("id")

        if (usersError) throw usersError

        // Create notifications for each user
        const notifications = allUsers.map((user) => ({
          user_id: user.id,
          title,
          message,
          is_read: false,
        }))

        const { error } = await supabase.from("notifications").insert(notifications)

        if (error) throw error

        toast({
          title: "Notifications sent",
          description: `Sent to ${allUsers.length} users`,
        })
      } else {
        // Send to specific user
        const { error } = await supabase.from("notifications").insert([
          {
            user_id: selectedUser,
            title,
            message,
            is_read: false,
          },
        ])

        if (error) throw error

        toast({
          title: "Notification sent",
          description: "Notification sent successfully",
        })
      }

      setIsDialogOpen(false)
      setTitle("")
      setMessage("")
      setSelectedUser("all")
      fetchNotifications()
    } catch (error) {
      console.error("Error creating notification:", error)
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteNotification(id: string) {
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Notification deleted",
        description: "Notification deleted successfully",
      })

      setNotifications(notifications.filter((notification) => notification.id !== id))
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Notifications Management</h1>
          <div className="flex space-x-2">
            <Button onClick={fetchNotifications} disabled={isLoading} variant="outline">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="mt-2">Loading notifications...</p>
                      </TableCell>
                    </TableRow>
                  ) : notifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No notifications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell className="font-medium">{notification.title}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{notification.message}</TableCell>
                        <TableCell>
                          {notification.user ? (
                            <div>
                              <div className="font-medium">{notification.user.name}</div>
                              <div className="text-xs text-muted-foreground">@{notification.user.username}</div>
                            </div>
                          ) : (
                            "All Users"
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              notification.is_read
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                            }`}
                          >
                            {notification.is_read ? "Read" : "Unread"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteNotification(notification.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user">Recipient</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} (@{user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Notification message"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateNotification} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Notification"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
