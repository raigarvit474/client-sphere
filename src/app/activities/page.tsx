'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Search, Filter, MoreHorizontal, Calendar, CheckCircle2, Clock, AlertTriangle, Phone, Mail, MessageSquare, FileText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog } from '@/components/ui/dialog'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AddActivityForm } from '@/components/forms/add-activity-form'
import { ActivityCalendar } from '@/components/calendar/activity-calendar'

interface Activity {
  id: string
  title: string
  description?: string
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'NOTE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
  completedAt?: string
  isCompleted: boolean
  contact?: {
    id: string
    firstName: string
    lastName: string
    company?: string
  }
  lead?: {
    id: string
    title: string
  }
  deal?: {
    id: string
    title: string
  }
  assignee: {
    id: string
    name?: string
    email: string
  }
  createdBy: {
    id: string
    name?: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface ActivityStats {
  total: number
  completed: number
  pending: number
  overdue: number
  completionRate: number
}

const typeColors = {
  CALL: 'bg-blue-100 text-blue-800',
  EMAIL: 'bg-green-100 text-green-800',
  MEETING: 'bg-purple-100 text-purple-800',
  TASK: 'bg-orange-100 text-orange-800',
  NOTE: 'bg-gray-100 text-gray-800',
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'CALL': return Phone
    case 'EMAIL': return Mail
    case 'MEETING': return Users
    case 'TASK': return CheckCircle2
    case 'NOTE': return FileText
    default: return MessageSquare
  }
}

export default function ActivitiesPage() {
  const { data: session } = useSession()
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Mock data for now
  useEffect(() => {
    setTimeout(() => {
      const mockActivities: Activity[] = [
        {
          id: '1',
          title: 'Follow up call with TechCorp',
          description: 'Discuss enterprise package requirements and pricing',
          type: 'CALL',
          priority: 'HIGH',
          dueDate: '2024-02-01T14:00:00Z',
          isCompleted: false,
          contact: {
            id: '1',
            firstName: 'John',
            lastName: 'Smith',
            company: 'TechCorp Inc'
          },
          deal: {
            id: '1',
            title: 'Enterprise CRM Implementation'
          },
          assignee: {
            id: '1',
            name: 'Sales Rep',
            email: 'rep@crm.com'
          },
          createdBy: {
            id: '1',
            name: 'Sales Rep',
            email: 'rep@crm.com'
          },
          createdAt: '2024-01-25T10:00:00Z',
          updatedAt: '2024-01-25T10:00:00Z'
        },
        {
          id: '2',
          title: 'Send proposal document',
          description: 'Email the updated proposal with revised pricing',
          type: 'EMAIL',
          priority: 'URGENT',
          dueDate: '2024-01-30T09:00:00Z',
          isCompleted: true,
          completedAt: '2024-01-29T16:30:00Z',
          contact: {
            id: '2',
            firstName: 'Sarah',
            lastName: 'Johnson',
            company: 'Marketing Pro'
          },
          deal: {
            id: '2',
            title: 'Marketing Automation Suite'
          },
          assignee: {
            id: '2',
            name: 'Sales Manager',
            email: 'manager@crm.com'
          },
          createdBy: {
            id: '2',
            name: 'Sales Manager',
            email: 'manager@crm.com'
          },
          createdAt: '2024-01-28T11:00:00Z',
          updatedAt: '2024-01-29T16:30:00Z'
        },
        {
          id: '3',
          title: 'Product demo meeting',
          description: 'Schedule and conduct product demonstration',
          type: 'MEETING',
          priority: 'MEDIUM',
          dueDate: '2024-02-05T15:00:00Z',
          isCompleted: false,
          contact: {
            id: '3',
            firstName: 'Mike',
            lastName: 'Wilson',
            company: 'CloudTech Solutions'
          },
          lead: {
            id: '3',
            title: 'Cloud Infrastructure Migration'
          },
          assignee: {
            id: '1',
            name: 'Sales Rep',
            email: 'rep@crm.com'
          },
          createdBy: {
            id: '1',
            name: 'Sales Rep',
            email: 'rep@crm.com'
          },
          createdAt: '2024-01-20T14:00:00Z',
          updatedAt: '2024-01-20T14:00:00Z'
        },
        {
          id: '4',
          title: 'Update CRM records',
          description: 'Update contact information and deal status',
          type: 'TASK',
          priority: 'LOW',
          dueDate: '2024-02-02T17:00:00Z',
          isCompleted: false,
          assignee: {
            id: '1',
            name: 'Sales Rep',
            email: 'rep@crm.com'
          },
          createdBy: {
            id: '2',
            name: 'Sales Manager',
            email: 'manager@crm.com'
          },
          createdAt: '2024-01-22T09:00:00Z',
          updatedAt: '2024-01-22T09:00:00Z'
        },
        {
          id: '5',
          title: 'Client meeting notes',
          description: 'Document key points from client discovery call',
          type: 'NOTE',
          priority: 'MEDIUM',
          isCompleted: true,
          completedAt: '2024-01-26T10:15:00Z',
          contact: {
            id: '4',
            firstName: 'Lisa',
            lastName: 'Davis',
            company: 'Small Biz Co'
          },
          assignee: {
            id: '1',
            name: 'Sales Rep',
            email: 'rep@crm.com'
          },
          createdBy: {
            id: '1',
            name: 'Sales Rep',
            email: 'rep@crm.com'
          },
          createdAt: '2024-01-26T10:15:00Z',
          updatedAt: '2024-01-26T10:15:00Z'
        },
        {
          id: '6',
          title: 'Contract review call',
          description: 'Review contract terms with legal team',
          type: 'CALL',
          priority: 'HIGH',
          dueDate: '2024-01-28T11:00:00Z',
          isCompleted: false,
          assignee: {
            id: '2',
            name: 'Sales Manager',
            email: 'manager@crm.com'
          },
          createdBy: {
            id: '2',
            name: 'Sales Manager',
            email: 'manager@crm.com'
          },
          createdAt: '2024-01-25T15:30:00Z',
          updatedAt: '2024-01-25T15:30:00Z'
        }
      ]

      setActivities(mockActivities)

      // Calculate stats
      const completed = mockActivities.filter(activity => activity.isCompleted).length
      const pending = mockActivities.filter(activity => !activity.isCompleted).length
      const now = new Date()
      const overdue = mockActivities.filter(activity => 
        !activity.isCompleted && 
        activity.dueDate && 
        new Date(activity.dueDate) < now
      ).length

      setStats({
        total: mockActivities.length,
        completed,
        pending,
        overdue,
        completionRate: mockActivities.length > 0 ? (completed / mockActivities.length) * 100 : 0
      })

      setLoading(false)
    }, 1000)
  }, [])

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchTerm || 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.contact?.company?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || activity.type === typeFilter
    const matchesPriority = priorityFilter === 'all' || activity.priority === priorityFilter
    
    let matchesStatus = true
    if (statusFilter === 'completed') {
      matchesStatus = activity.isCompleted
    } else if (statusFilter === 'pending') {
      matchesStatus = !activity.isCompleted
    } else if (statusFilter === 'overdue') {
      const now = new Date()
      matchesStatus = !activity.isCompleted && !!activity.dueDate && new Date(activity.dueDate) < now
    }

    return matchesSearch && matchesType && matchesPriority && matchesStatus
  })

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isOverdue = (activity: Activity) => {
    if (!activity.dueDate || activity.isCompleted) return false
    return new Date(activity.dueDate) < new Date()
  }

  const toggleCompletion = (activityId: string) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        const isCompleted = !activity.isCompleted
        return {
          ...activity,
          isCompleted,
          completedAt: isCompleted ? new Date().toISOString() : undefined
        }
      }
      return activity
    }))
  }

  const handleCreateActivity = async (data: Record<string, any>) => {
    // Simulate API call
    const newActivity: Activity = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description || undefined,
      type: data.type,
      priority: data.priority,
      dueDate: data.dueDate || undefined,
      isCompleted: data.isCompleted || false,
      assignee: {
        id: session?.user?.id || '1',
        name: session?.user?.name || 'Current User',
        email: session?.user?.email || 'user@crm.com'
      },
      createdBy: {
        id: session?.user?.id || '1',
        name: session?.user?.name || 'Current User',
        email: session?.user?.email || 'user@crm.com'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setActivities(prev => [newActivity, ...prev])
    
    // Update stats
    setStats(prev => ({
      total: prev.total + 1,
      completed: prev.completed + (data.isCompleted ? 1 : 0),
      pending: prev.pending + (data.isCompleted ? 0 : 1),
      overdue: prev.overdue,
      completionRate: prev.total > 0 ? ((prev.completed + (data.isCompleted ? 1 : 0)) / (prev.total + 1)) * 100 : 0
    }))

    console.log('Activity created:', newActivity)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading activities...</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
            <p className="text-gray-600">Manage tasks, calls, meetings, and follow-ups</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                Calendar
              </Button>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Activity
              </Button>
              <AddActivityForm
                onSubmit={handleCreateActivity}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All activities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground">
                Past due date
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Success rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search activities by title, description, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="CALL">Calls</SelectItem>
                  <SelectItem value="EMAIL">Emails</SelectItem>
                  <SelectItem value="MEETING">Meetings</SelectItem>
                  <SelectItem value="TASK">Tasks</SelectItem>
                  <SelectItem value="NOTE">Notes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        {viewMode === 'list' ? (
          <Card>
            <CardHeader>
              <CardTitle>Activity List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredActivities.map((activity) => {
                  const TypeIcon = getTypeIcon(activity.type)
                  const isActivityOverdue = isOverdue(activity)
                  
                  return (
                    <div
                      key={activity.id}
                      className={`flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                        activity.isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                      } ${isActivityOverdue ? 'border-red-200 bg-red-50' : ''}`}
                    >
                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${
                            activity.isCompleted ? 'text-green-600' : 'text-gray-400'
                          }`}
                          onClick={() => toggleCompletion(activity.id)}
                        >
                          <CheckCircle2 className={`h-5 w-5 ${activity.isCompleted ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg ${typeColors[activity.type as keyof typeof typeColors]}`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`text-sm font-medium ${
                              activity.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {activity.title}
                            </h3>
                            {activity.description && (
                              <p className={`text-sm mt-1 ${
                                activity.isCompleted ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {activity.description}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 mt-2">
                              {activity.contact && (
                                <div className="text-xs text-gray-500">
                                  <span className="font-medium">
                                    {activity.contact.firstName} {activity.contact.lastName}
                                  </span>
                                  {activity.contact.company && (
                                    <span className="ml-1">• {activity.contact.company}</span>
                                  )}
                                </div>
                              )}
                              
                              {activity.deal && (
                                <div className="text-xs text-blue-600">
                                  Deal: {activity.deal.title}
                                </div>
                              )}
                              
                              {activity.lead && (
                                <div className="text-xs text-purple-600">
                                  Lead: {activity.lead.title}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="secondary" className={`${priorityColors[activity.priority as keyof typeof priorityColors]} text-xs`}>
                                {activity.priority}
                              </Badge>
                              
                              {activity.dueDate && (
                                <div className={`text-xs ${
                                  isActivityOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
                                }`}>
                                  Due: {formatDateTime(activity.dueDate)}
                                </div>
                              )}
                              
                              {activity.completedAt && (
                                <div className="text-xs text-green-600">
                                  Completed: {formatDateTime(activity.completedAt)}
                                </div>
                              )}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Activity</DropdownMenuItem>
                              {!activity.isCompleted && (
                                <DropdownMenuItem onClick={() => toggleCompletion(activity.id)}>
                                  Mark Complete
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                Delete Activity
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {filteredActivities.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || typeFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all'
                        ? 'Try adjusting your search or filter criteria.' 
                        : 'Get started by creating your first activity.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <ActivityCalendar
            activities={filteredActivities}
            onActivityClick={(activity) => {
              console.log('Activity clicked:', activity)
            }}
            onDateClick={(date) => {
              console.log('Date clicked:', date)
            }}
            onCreateActivity={() => setIsCreateDialogOpen(true)}
          />
        )}
      </div>
    </DashboardLayout>
  )
}