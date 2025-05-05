"use client"

import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"

interface Activity {
  id: string
  user_id: string
  activity_type: string
  description: string
  created_at: string
  user: {
    name: string
    username: string
  }
}

export default function UserActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activityType, setActivityType] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchActivities()
  }, [])

  async function fetchActivities() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("user_activity")
        .select(`
          *,
          user:user_id (
            name,
            username
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error("Error fetching activities:", error)
      toast({
        title: "Error",
        description: "Failed to fetch user activities",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique activity types for filter
  const activityTypes = Array.from(new Set(activities.map((a) => a.activity_type)))

  // Filter activities based on search term and activity type
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = activityType ? activity.activity_type === activityType : true

    return matchesSearch && matchesType
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Activity</h1>
          <Button onClick={fetchActivities} disabled={isLoading}>
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Input
                placeholder="Search by user or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-1/2"
              />
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger className="md:w-1/2">
                  <SelectValue placeholder="Filter by activity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  {activityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Activity Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Loading activities...
                      </TableCell>
                    </TableRow>
                  ) : filteredActivities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No activities found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          {activity.user ? (
                            <div>
                              <div className="font-medium">{activity.user.name}</div>
                              <div className="text-sm text-gray-500">@{activity.user.username}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Unknown User</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                            {activity.activity_type.replace(/_/g, " ")}
                          </span>
                        </TableCell>
                        <TableCell>{activity.description}</TableCell>
                        <TableCell>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</TableCell>
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
