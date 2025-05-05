"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import { Loader2, Search, RefreshCw, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/lib/i18n/context"
import { PageHelp } from "@/components/page-help"

interface ApiLog {
  id: string
  created_at: string
  endpoint: string
  request_data: any
  response_data: any
  status: string
  processing_time: number
}

export default function ApiLogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ApiLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [endpointFilter, setEndpointFilter] = useState("all")
  const { toast } = useToast()
  const { t, dir } = useLanguage()

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, searchTerm, statusFilter, endpointFilter])

  async function fetchLogs() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("api_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) throw error

      setLogs(data || [])
      setFilteredLogs(data || [])
    } catch (error) {
      console.error("Error fetching API logs:", error)
      toast({
        title: t("error"),
        description: t("Failed to fetch API logs"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function filterLogs() {
    let filtered = [...logs]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.endpoint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          JSON.stringify(log.request_data)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          JSON.stringify(log.response_data)?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter)
    }

    // Filter by endpoint
    if (endpointFilter !== "all") {
      filtered = filtered.filter((log) => log.endpoint === endpointFilter)
    }

    setFilteredLogs(filtered)
  }

  // Get unique endpoints
  const endpoints = ["all", ...new Set(logs.map((log) => log.endpoint).filter(Boolean))]

  // Format JSON for display
  const formatJson = (json: any) => {
    try {
      return JSON.stringify(json, null, 2)
    } catch (e) {
      return "Invalid JSON"
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch (e) {
      return dateString
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6" dir={dir}>
        <PageHelp
          title={t("API Logs")}
          description={t(
            "Monitor all interactions with the SPFollow API. This page shows the most recent API calls, their status, and response data. Use this to troubleshoot any issues with order processing.",
          )}
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">{t("API Logs")}</h1>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t("Search logs")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-[250px]"
              />
            </div>

            <Select value={endpointFilter} onValueChange={setEndpointFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("Filter by endpoint")} />
              </SelectTrigger>
              <SelectContent>
                {endpoints.map((endpoint) => (
                  <SelectItem key={endpoint} value={endpoint}>
                    {endpoint === "all" ? t("All endpoints") : endpoint}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("Filter by status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All statuses")}</SelectItem>
                <SelectItem value="success">{t("Success")}</SelectItem>
                <SelectItem value="error">{t("Error")}</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchLogs} disabled={isLoading} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("Refresh")}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 overflow-auto">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Time")}</TableHead>
                    <TableHead>{t("Endpoint")}</TableHead>
                    <TableHead>{t("Status")}</TableHead>
                    <TableHead>{t("Request")}</TableHead>
                    <TableHead>{t("Response")}</TableHead>
                    <TableHead>{t("Processing Time")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="mt-2">{t("Loading...")}</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        {t("No API logs found")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            {formatDate(log.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.endpoint}</Badge>
                        </TableCell>
                        <TableCell>
                          {log.status === "success" ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              {t("Success")}
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              {t("Error")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-32 max-w-xs">
                            {formatJson(log.request_data)}
                          </pre>
                        </TableCell>
                        <TableCell>
                          <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-32 max-w-xs">
                            {formatJson(log.response_data)}
                          </pre>
                        </TableCell>
                        <TableCell>{log.processing_time ? `${log.processing_time.toFixed(2)}ms` : t("N/A")}</TableCell>
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
