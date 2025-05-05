"use client"

import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"
import { Loader2, Plus, Copy } from "lucide-react"

interface Coupon {
  id: string
  code: string
  amount: number
  is_used: boolean
  used_by: string | null
  created_at: string
  used_at: string | null
  user?: {
    username: string
    name: string
  }
}

export default function CouponsManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCoupons()
  }, [])

  async function fetchCoupons() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select(`
          *,
          user:used_by (
            username,
            name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setCoupons(data || [])
    } catch (error) {
      console.error("Error fetching coupons:", error)
      toast({
        title: "Error",
        description: "Failed to fetch coupons",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function generateCouponCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += "-"
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  async function handleCreateCoupon() {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const couponCode = generateCouponCode()
      const { error } = await supabase.from("coupons").insert([
        {
          code: couponCode,
          amount: Number(amount),
          is_used: false,
        },
      ])

      if (error) throw error

      toast({
        title: "Coupon created",
        description: `Coupon ${couponCode} created successfully`,
      })

      setIsDialogOpen(false)
      setAmount("")
      fetchCoupons()
    } catch (error) {
      console.error("Error creating coupon:", error)
      toast({
        title: "Error",
        description: "Failed to create coupon",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCopyCouponCode(code: string) {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied",
      description: "Coupon code copied to clipboard",
    })
  }

  async function handleDeleteCoupon(id: string) {
    if (!confirm("Are you sure you want to delete this coupon?")) return

    try {
      const { error } = await supabase.from("coupons").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Coupon deleted",
        description: "Coupon deleted successfully",
      })

      setCoupons(coupons.filter((coupon) => coupon.id !== id))
    } catch (error) {
      console.error("Error deleting coupon:", error)
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Coupons Management</h1>
          <div className="flex space-x-2">
            <Button onClick={fetchCoupons} disabled={isLoading} variant="outline">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Coupon
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Used By</TableHead>
                    <TableHead>Used At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="mt-2">Loading coupons...</p>
                      </TableCell>
                    </TableRow>
                  ) : coupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No coupons found
                      </TableCell>
                    </TableRow>
                  ) : (
                    coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-mono">
                          <div className="flex items-center space-x-2">
                            <span>{coupon.code}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyCouponCode(coupon.code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{coupon.amount.toFixed(2)} DZD</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              coupon.is_used
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            }`}
                          >
                            {coupon.is_used ? "Used" : "Available"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDistanceToNow(new Date(coupon.created_at), { addSuffix: true })}</TableCell>
                        <TableCell>
                          {coupon.user ? (
                            <div>
                              <div className="font-medium">{coupon.user.name}</div>
                              <div className="text-xs text-muted-foreground">@{coupon.user.username}</div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {coupon.used_at ? formatDistanceToNow(new Date(coupon.used_at), { addSuffix: true }) : "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            disabled={coupon.is_used}
                          >
                            Delete
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
            <DialogTitle>Create Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (DZD)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateCoupon} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Coupon"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
