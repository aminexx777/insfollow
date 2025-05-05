"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"
import { Bell, Trash2 } from "lucide-react"

interface NotificationsListProps {
  userId: string
  onNotificationsRead?: () => void
}

interface Notification {
  id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export function NotificationsList({ userId, onNotificationsRead }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (userId) {
      fetchNotifications()
    } else {
      setIsLoading(false)
      setNotifications([])
    }
  }, [userId])

  async function fetchNotifications() {
    // If userId is not provided, don't attempt to fetch
    if (!userId) {
      console.warn("Cannot fetch notifications: User ID is undefined")
      setNotifications([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setNotifications(data || [])

      // Mark all as read
      if (data && data.length > 0) {
        const unreadNotifications = data.filter((n) => !n.is_read)
        if (unreadNotifications.length > 0) {
          await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false)

          if (onNotificationsRead) {
            onNotificationsRead()
          }
        }
      }
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

  async function handleDeleteNotification(id: string) {
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id)

      if (error) throw error

      setNotifications(notifications.filter((n) => n.id !== id))

      toast({
        title: "Notification deleted",
        description: "The notification has been removed",
      })
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
        <p className="mt-4 text-muted-foreground">You have no notifications</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 border rounded-lg ${notification.is_read ? "bg-card" : "bg-primary/5"} transition-all hover:shadow-md`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{notification.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteNotification(notification.id)}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={fetchNotifications}>
        Refresh Notifications
      </Button>
    </div>
  )
}
