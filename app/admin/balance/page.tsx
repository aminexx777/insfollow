"use client"

import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { useState } from "react"

export default function BalanceManagement() {
  const [username, setUsername] = useState("")
  const [amount, setAmount] = useState("")
  const [operation, setOperation] = useState("add")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const { toast } = useToast()

  async function handleSearch() {
    if (!username) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setSearchPerformed(true)

    try {
      const { data, error } = await supabase.from("users").select("*").eq("username", username).single()

      if (error) throw error

      if (data) {
        setUser(data)
      } else {
        setUser(null)
        toast({
          title: "User not found",
          description: `No user found with username: ${username}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error searching for user:", error)
      toast({
        title: "Error",
        description: "Failed to search for user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleBalanceUpdate() {
    if (!user) {
      toast({
        title: "Error",
        description: "No user selected",
        variant: "destructive",
      })
      return
    }

    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const amountValue = Number.parseFloat(amount)
      const newBalance =
        operation === "add"
          ? Number.parseFloat(user.balance) + amountValue
          : Number.parseFloat(user.balance) - amountValue

      // Ensure balance doesn't go negative
      if (newBalance < 0) {
        toast({
          title: "Error",
          description: "User's balance cannot be negative",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const { error } = await supabase.from("users").update({ balance: newBalance }).eq("id", user.id)

      if (error) throw error

      // Log the activity
      await supabase.from("user_activity").insert([
        {
          user_id: user.id,
          activity_type: operation === "add" ? "BALANCE_ADDED" : "BALANCE_DEDUCTED",
          description: `${operation === "add" ? "Added" : "Deducted"} ${amountValue.toFixed(2)} DZD by admin`,
        },
      ])

      // Update local user state
      setUser({ ...user, balance: newBalance })

      toast({
        title: "Success",
        description: `Successfully ${operation === "add" ? "added" : "deducted"} ${amountValue.toFixed(2)} DZD ${operation === "add" ? "to" : "from"} user's balance`,
      })

      // Reset form
      setAmount("")
    } catch (error) {
      console.error("Error updating balance:", error)
      toast({
        title: "Error",
        description: "Failed to update balance",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Balance Management</h1>
        <p className="text-gray-500">Add or deduct balance from user accounts.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Find User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                    />
                    <Button onClick={handleSearch} disabled={isLoading}>
                      {isLoading ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>

                {searchPerformed && user && (
                  <div className="border rounded-md p-4 mt-4">
                    <h3 className="font-medium">User Details</h3>
                    <div className="mt-2 space-y-1">
                      <p>
                        <span className="font-medium">Name:</span> {user.name}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {user.email}
                      </p>
                      <p>
                        <span className="font-medium">Current Balance:</span>{" "}
                        {Number.parseFloat(user.balance).toFixed(2)} DZD
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs ${user.is_blocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                        >
                          {user.is_blocked ? "Blocked" : "Active"}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {searchPerformed && !user && !isLoading && (
                  <div className="text-center py-4 text-gray-500">No user found with that username</div>
                )}
              </div>
            </CardContent>
          </Card>

          {user && (
            <Card>
              <CardHeader>
                <CardTitle>Modify Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Operation</Label>
                    <RadioGroup value={operation} onValueChange={setOperation} className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="add" id="add" />
                        <Label htmlFor="add">Add Balance</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="deduct" id="deduct" />
                        <Label htmlFor="deduct">Deduct Balance</Label>
                      </div>
                    </RadioGroup>
                  </div>

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
                    />
                  </div>

                  <Button onClick={handleBalanceUpdate} disabled={isLoading || !amount} className="w-full">
                    {isLoading ? "Processing..." : `${operation === "add" ? "Add to" : "Deduct from"} Balance`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
