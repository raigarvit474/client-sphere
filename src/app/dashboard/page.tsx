import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Target, Handshake, Calendar, TrendingUp, DollarSign } from 'lucide-react'

async function getDashboardData(userId: string, userRole: string) {
  // For demo purposes, get basic counts
  // In a real app, you'd implement proper role-based filtering
  const [contactsCount, leadsCount, dealsCount, activitiesCount] = await Promise.all([
    prisma.contact.count(),
    prisma.lead.count(),
    prisma.deal.count(),
    prisma.activity.count()
  ])

  // Get recent activities
  const recentActivities = await prisma.activity.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      assignee: { select: { name: true } },
      contact: { select: { firstName: true, lastName: true } },
      lead: { select: { title: true } },
      deal: { select: { title: true } }
    }
  })

  // Get deal values
  const dealsData = await prisma.deal.findMany({
    select: { value: true, stage: true }
  })

  const totalDealsValue = dealsData.reduce((sum, deal) => sum + Number(deal.value), 0)
  const avgDealValue = dealsData.length > 0 ? totalDealsValue / dealsData.length : 0

  return {
    metrics: {
      contactsCount,
      leadsCount,
      dealsCount,
      activitiesCount,
      totalDealsValue,
      avgDealValue
    },
    recentActivities
  }
}

export default async function DashboardPage() {
  const user = await requireAuth()
  const data = await getDashboardData(user.id, user.role)

  const metrics = [
    {
      title: 'Total Contacts',
      value: data.metrics.contactsCount,
      icon: Users,
      description: 'Active contacts in system',
      color: 'text-blue-600'
    },
    {
      title: 'Active Leads',
      value: data.metrics.leadsCount,
      icon: Target,
      description: 'Leads in pipeline',
      color: 'text-green-600'
    },
    {
      title: 'Open Deals',
      value: data.metrics.dealsCount,
      icon: Handshake,
      description: 'Deals in progress',
      color: 'text-purple-600'
    },
    {
      title: 'Activities',
      value: data.metrics.activitiesCount,
      icon: Calendar,
      description: 'Total activities logged',
      color: 'text-orange-600'
    },
    {
      title: 'Total Deal Value',
      value: `$${data.metrics.totalDealsValue.toLocaleString()}`,
      icon: DollarSign,
      description: 'Combined value of all deals',
      color: 'text-emerald-600'
    },
    {
      title: 'Avg Deal Value',
      value: `$${Math.round(data.metrics.avgDealValue).toLocaleString()}`,
      icon: TrendingUp,
      description: 'Average deal value',
      color: 'text-indigo-600'
    }
  ]

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'CALL': return 'bg-blue-100 text-blue-800'
      case 'EMAIL': return 'bg-green-100 text-green-800'
      case 'MEETING': return 'bg-purple-100 text-purple-800'
      case 'TASK': return 'bg-orange-100 text-orange-800'
      case 'NOTE': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}! Here's your CRM overview.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Card key={metric.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest activities across your CRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivities.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No activities found</p>
              ) : (
                data.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className={getActivityTypeColor(activity.type)}>
                        {activity.type}
                      </Badge>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-600">
                          Assigned to {activity.assignee.name}
                          {activity.contact && (
                            <> • Contact: {activity.contact.firstName} {activity.contact.lastName}</>
                          )}
                          {activity.lead && (
                            <> • Lead: {activity.lead.title}</>
                          )}
                          {activity.deal && (
                            <> • Deal: {activity.deal.title}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}