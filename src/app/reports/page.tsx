'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { BarChart3, TrendingUp, DollarSign, Users, Target, Calendar, Download, Filter, RefreshCw, FileText, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { exportOptions, type ExportData } from '@/lib/export-utils'

interface ReportData {
  salesMetrics: {
    totalRevenue: number
    monthlyRevenue: number
    revenueGrowth: number
    averageDealSize: number
    dealsWon: number
    dealsLost: number
    winRate: number
    conversionRate: number
  }
  activityMetrics: {
    totalActivities: number
    completedActivities: number
    pendingActivities: number
    overdueActivities: number
    averageResponseTime: number
  }
  teamPerformance: Array<{
    id: string
    name: string
    role: string
    dealsWon: number
    revenue: number
    activitiesCompleted: number
    conversionRate: number
  }>
  monthlyData: Array<{
    month: string
    revenue: number
    deals: number
    leads: number
    activities: number
  }>
  pipelineHealth: {
    prospecting: number
    qualification: number
    proposal: number
    negotiation: number
    closedWon: number
    closedLost: number
  }
}

export default function ReportsPage() {
  const { data: session } = useSession()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('last30days')
  const [refreshing, setRefreshing] = useState(false)

  const currentUser = session?.user
  const isManager = currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN'

  // Mock data for reports
  useEffect(() => {
    const loadReportData = () => {
      setTimeout(() => {
        const mockData: ReportData = {
          salesMetrics: {
            totalRevenue: 1250000,
            monthlyRevenue: 85000,
            revenueGrowth: 15.5,
            averageDealSize: 62500,
            dealsWon: 12,
            dealsLost: 8,
            winRate: 60,
            conversionRate: 22.5
          },
          activityMetrics: {
            totalActivities: 156,
            completedActivities: 124,
            pendingActivities: 24,
            overdueActivities: 8,
            averageResponseTime: 2.5
          },
          teamPerformance: [
            {
              id: '1',
              name: 'Sales Rep One',
              role: 'REP',
              dealsWon: 8,
              revenue: 520000,
              activitiesCompleted: 45,
              conversionRate: 28.5
            },
            {
              id: '2',
              name: 'Sales Rep Two',
              role: 'REP',
              dealsWon: 6,
              revenue: 380000,
              activitiesCompleted: 38,
              conversionRate: 24.2
            },
            {
              id: '3',
              name: 'Sales Manager',
              role: 'MANAGER',
              dealsWon: 4,
              revenue: 350000,
              activitiesCompleted: 41,
              conversionRate: 31.8
            }
          ],
          monthlyData: [
            { month: 'Jan', revenue: 75000, deals: 8, leads: 24, activities: 145 },
            { month: 'Feb', revenue: 82000, deals: 9, leads: 28, activities: 156 },
            { month: 'Mar', revenue: 78000, deals: 7, leads: 22, activities: 134 },
            { month: 'Apr', revenue: 95000, deals: 11, leads: 32, activities: 178 },
            { month: 'May', revenue: 88000, deals: 10, leads: 29, activities: 165 },
            { month: 'Jun', revenue: 105000, deals: 12, leads: 35, activities: 189 }
          ],
          pipelineHealth: {
            prospecting: 15,
            qualification: 12,
            proposal: 8,
            negotiation: 5,
            closedWon: 12,
            closedLost: 8
          }
        }
        setReportData(mockData)
        setLoading(false)
        setRefreshing(false)
      }, 1000)
    }

    loadReportData()
  }, [dateRange])

  const handleRefresh = () => {
    setRefreshing(true)
    // Trigger data reload
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (!isManager) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to access reports and analytics.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading reports...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!reportData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">No report data available</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Performance metrics and business insights</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last90days">Last 90 Days</SelectItem>
                <SelectItem value="thisyear">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => exportOptions.completeReport(reportData as ExportData)}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Complete Report (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportOptions.pdfReport(reportData as ExportData)}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => exportOptions.salesMetrics(reportData?.salesMetrics as ExportData['salesMetrics'])}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Sales Metrics (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportOptions.teamPerformance(reportData?.teamPerformance as ExportData['teamPerformance'])}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Team Performance (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportOptions.monthlyData(reportData?.monthlyData as ExportData['monthlyData'])}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Monthly Data (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Sales Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(reportData.salesMetrics.totalRevenue)}</div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">
                    +{formatPercentage(reportData.salesMetrics.revenueGrowth)} from last period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Deal Size</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(reportData.salesMetrics.averageDealSize)}</div>
                <p className="text-xs text-muted-foreground">
                  Across {reportData.salesMetrics.dealsWon + reportData.salesMetrics.dealsLost} deals
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(reportData.salesMetrics.winRate)}</div>
                <p className="text-xs text-muted-foreground">
                  {reportData.salesMetrics.dealsWon} won, {reportData.salesMetrics.dealsLost} lost
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(reportData.salesMetrics.conversionRate)}</div>
                <p className="text-xs text-muted-foreground">
                  Leads to deals conversion
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activity Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.activityMetrics.totalActivities}</div>
                <p className="text-xs text-muted-foreground">
                  All activities this period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage((reportData.activityMetrics.completedActivities / reportData.activityMetrics.totalActivities) * 100)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {reportData.activityMetrics.completedActivities} of {reportData.activityMetrics.totalActivities} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Activities</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.activityMetrics.pendingActivities}</div>
                <div className="flex items-center mt-1">
                  {reportData.activityMetrics.overdueActivities > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {reportData.activityMetrics.overdueActivities} Overdue
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.activityMetrics.averageResponseTime}d</div>
                <p className="text-xs text-muted-foreground">
                  Average follow-up time
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deals Won
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activities Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.teamPerformance.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.dealsWon}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(member.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.activitiesCompleted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900">
                            {formatPercentage(member.conversionRate)}
                          </div>
                          <div className="ml-2 w-12 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(member.conversionRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                  <p>Revenue chart visualization</p>
                  <p className="text-sm">Chart library integration needed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pipeline Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(reportData.pipelineHealth).map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3" />
                      <span className="text-sm font-medium capitalize">
                        {stage.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 mr-2">{count}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ 
                            width: `${(count / Math.max(...Object.values(reportData.pipelineHealth))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Key Highlights</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Total revenue: {formatCurrency(reportData.salesMetrics.totalRevenue)}</li>
                  <li>• Win rate: {formatPercentage(reportData.salesMetrics.winRate)}</li>
                  <li>• {reportData.activityMetrics.completedActivities} activities completed</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Areas for Improvement</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• {reportData.activityMetrics.overdueActivities} overdue activities</li>
                  <li>• Average response time: {reportData.activityMetrics.averageResponseTime} days</li>
                  <li>• Pipeline optimization opportunities</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Focus on qualification stage</li>
                  <li>• Reduce response times</li>
                  <li>• Increase follow-up frequency</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}