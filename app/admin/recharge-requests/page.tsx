"use client"

import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"
import { Loader2, Check, X, ExternalLink } from "lucide-react"

interface BalanceRequest {
  id: string
  user_id: string
  amount: number
  payment_time: string
  payment_date: string
  receipt_url: string
  description: string
  status: string
  created_at: string
  updated_at: string
  user: {
    username: string
    name: string
    balance: number
  }
}

export default function RechargeRequestsManagement() {
  const [requests, setRequests] = useState<BalanceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("balance_requests")
        .select(`
          *,
          user:user_id (
            username,
            name,
            balance
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error("Error fetching balance requests:", error)
      toast({
        title: "Error",
        description: "Failed to fetch balance requests",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleApproveRequest(request: BalanceRequest) {
    if (processingRequest) return

    setProcessingRequest(request.id)
    try {
      // Update user balance
      const newBalance = Number(request.user.balance) + Number(request.amount)
      const { error: updateError } = await supabase
        .from("users")
        .update({ balance: newBalance })
        .eq("id", request.user_id)

      if (updateError) throw updateError

      // Update request status
      const { error: requestError } = await supabase
        .from("balance_requests")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.id)

      if (requestError) throw requestError

      // Log activity
      await supabase.from("user_activity").insert([
        {
          user_id: request.user_id,
          activity_type: "BALANCE_ADDED",
          description: `Balance request for ${request.amount.toFixed(2)} DZD was approved`,
        },
      ])

      // Create notification
      await supabase.from("notifications").insert([
        {
          user_id: request.user_id,
          title: "Balance Request Approved",
          message: `Your balance recharge request for ${request.amount.toFixed(2)} DZD has been approved.`,
        },
      ])

      toast({
        title: "Request approved",
        description: `Balance request for ${request.amount.toFixed(2)} DZD approved successfully`,
      })

      // Update local state
      setRequests(
        requests.map((r) =>
          r.id === request.id ? { ...r, status: "approved", updated_at: new Date().toISOString() } : r,
        ),
      )
    } catch (error) {
      console.error("Error approving request:", error)
      toast({
        title: "Error",
        description: "Failed to approve balance request",
        variant: "destructive",
      })
    } finally {
      setProcessingRequest(null)
    }
  }

  async function handleRejectRequest(request: BalanceRequest) {
    if (processingRequest) return

    setProcessingRequest(request.id)
    try {
      // Update request status
      const { error: requestError } = await supabase
        .from("balance_requests")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.id)

      if (requestError) throw requestError

      // Create notification
      await supabase.from("notifications").insert([
        {
          user_id: request.user_id,
          title: "Balance Request Rejected",
          message: `Your balance recharge request for ${request.amount.toFixed(2)} DZD has been rejected.`,
        },
      ])

      toast({
        title: "Request rejected",
        description: `Balance request for ${request.amount.toFixed(2)} DZD rejected`,
      })

      // Update local state
      setRequests(
        requests.map((r) =>
          r.id === request.id ? { ...r, status: "rejected", updated_at: new Date().toISOString() } : r,
        ),
      )
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast({
        title: "Error",
        description: "Failed to reject balance request",
        variant: "destructive",
      })
    } finally {
      setProcessingRequest(null)
    }
  }

  function getStatusBadgeClass(status: string) {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Balance Recharge Requests</h1>
          <Button onClick={fetchRequests} disabled={isLoading} variant="outline">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Info</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="mt-2">Loading requests...</p>
                      </TableCell>
                    </TableRow>
                  ) : requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No balance recharge requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium">{request.user.name}</div>
                          <div className="text-xs text-muted-foreground">@{request.user.username}</div>
                        </TableCell>
                        <TableCell>{request.amount.toFixed(2)} DZD</TableCell>
                        <TableCell>
                          <div>Date: {request.payment_date}</div>
                          <div>Time: {request.payment_time}</div>
                          {request.description && (
                            <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                              {request.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <a
                            href={request.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-primary hover:underline"
                          >
                            View Receipt
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</TableCell>
                        <TableCell>
                          {request.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-100 hover:bg-green-200 text-green-800 border-green-200"
                                onClick={() => handleApproveRequest(request)}
                                disabled={processingRequest === request.id}
                              >
                                {processingRequest === request.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 mr-1" />
                                )}
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-red-100 hover:bg-red-200 text-red-800 border-red-200"
                                onClick={() => handleRejectRequest(request)}
                                disabled={processingRequest === request.id}
                              >
                                {processingRequest === request.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4 mr-1" />
                                )}
                                Reject
                              </Button>
                            </div>
                          )}
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
