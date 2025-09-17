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
import { EditActivityForm } from '@/components/forms/edit-activity-form'
import { ViewActivityDialog } from '@/components/dialogs/view-activity-dialog'
import { DeleteActivityDialog } from '@/components/dialogs/delete-activity-dialog'
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
    firstName: string
    lastName: string
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
  
  // Dialog states
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Data for form dropdowns
  const [contacts, setContacts] = useState<Array<{ id: string; firstName: string; lastName: string; company?: string }>>([])
  const [deals, setDeals] = useState<Array<{ id: string; title: string; value?: number }>>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([])

  // Fetch activities from API
  const fetchActivities = async () => {
    try {
      setLoading(true)
      console.log('Fetching activities...')
      const response = await fetch('/api/activities')
      console.log('Activities response status:', response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Activities API Error:', errorText)
        throw new Error('Failed to fetch activities')
      }
      const response_data = await response.json()
      console.log('Received activities API response:', response_data)
      
      // The API returns { success: true, data: { activities: [...], pagination: {...} } }
      const data = response_data.data || response_data
      console.log('Extracted activities data:', data)
      
      setActivities(data.activities || [])
      
      // Calculate stats
      const activities = data.activities || []
      const completed = activities.filter((activity: Activity) => activity.isCompleted).length
      const pending = activities.filter((activity: Activity) => !activity.isCompleted).length
      const now = new Date()
      const overdue = activities.filter((activity: Activity) => 
        !activity.isCompleted && 
        activity.dueDate && 
        new Date(activity.dueDate) < now
      ).length
      
      setStats({
        total: activities.length,
        completed,
        pending,
        overdue,
        completionRate: activities.length > 0 ? (completed / activities.length) * 100 : 0
      })
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch contacts for dropdown
  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        const contactsData = data.data?.contacts || data.contacts || []
        setContacts(contactsData.map((contact: any) => ({
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          company: contact.company
        })))
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    }
  }

  // Fetch deals for dropdown
  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/deals')
      if (response.ok) {
        const data = await response.json()
        const dealsData = data.data?.deals || data.deals || []
        setDeals(dealsData.map((deal: any) => ({
          id: deal.id,
          title: deal.title,
          value: deal.value
        })))
      }
    } catch (error) {
      console.error('Error fetching deals:', error)
    }
  }

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        const usersData = data.data?.users || data.users || []
        setUsers(usersData.map((user: any) => ({
          id: user.id,
          name: user.name || user.email,
          email: user.email
        })))
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    fetchActivities()
    fetchContacts()
    fetchDeals()
    fetchUsers()
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

  // Dialog handlers
  const handleViewActivity = (activity: Activity) => {
    setSelectedActivity(activity)
    setIsViewDialogOpen(true)
  }

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity)
    setIsEditDialogOpen(true)
  }

  const handleDeleteActivity = (activity: Activity) => {
    setSelectedActivity(activity)
    setIsDeleteDialogOpen(true)
  }

  // API operations
  const toggleCompletion = async (activityId: string) => {
    try {
      const activity = activities.find(a => a.id === activityId)
      if (!activity) return

      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isCompleted: !activity.isCompleted
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Toggle completion error:', errorText)
        throw new Error('Failed to toggle completion')
      }

      await fetchActivities() // Refresh the activities list
    } catch (error) {
      console.error('Error toggling completion:', error)
    }
  }

  const handleUpdateActivity = async (data: Record<string, any>) => {
    if (!selectedActivity) return

    try {
      const response = await fetch(`/api/activities/${selectedActivity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Update activity error:', errorText)
        throw new Error('Failed to update activity')
      }

      await fetchActivities() // Refresh the activities list
    } catch (error) {
      console.error('Error updating activity:', error)
      throw error
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedActivity) return

    try {
      const response = await fetch(`/api/activities/${selectedActivity.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Delete activity error:', errorText)
        throw new Error('Failed to delete activity')
      }

      await fetchActivities() // Refresh the activities list
    } catch (error) {
      console.error('Error deleting activity:', error)
      throw error
    }
  }

  const closeAllDialogs = () => {
    setSelectedActivity(null)
    setIsViewDialogOpen(false)
    setIsEditDialogOpen(false)
    setIsDeleteDialogOpen(false)
  }

  const handleCreateActivity = async (data: Record<string, any>) => {
    try {
      console.log('Creating activity with data:', data)
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description || undefined,
          type: data.type,
          priority: data.priority,
          dueDate: data.dueDate || undefined,
          dueTime: data.dueTime || undefined,
          contactId: data.contactId || undefined,
          dealId: data.dealId || undefined,
          assigneeId: data.assigneeId || undefined,
          isCompleted: data.isCompleted || false,
          reminderMinutes: data.reminderMinutes || undefined,
          location: data.location || undefined,
          notes: data.notes || undefined
        })
      })
      console.log('Create activity response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Create activity error:', errorText)
        throw new Error('Failed to create activity')
      }

      const newActivity = await response.json()
      console.log('Activity created successfully:', newActivity)
      
      // Refresh the activities list
      console.log('Refreshing activities list...')
      await fetchActivities()
    } catch (error) {
      console.error('Error creating activity:', error)
      throw error // Let the form handle the error
    }
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
                contacts={contacts}
                deals={deals}
                users={users}
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
                              <DropdownMenuItem onClick={() => handleViewActivity(activity)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditActivity(activity)}>
                                Edit Activity
                              </DropdownMenuItem>
                              {!activity.isCompleted && (
                                <DropdownMenuItem onClick={() => toggleCompletion(activity.id)}>
                                  Mark Complete
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteActivity(activity)}
                              >
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

      {/* Dialogs */}
      {selectedActivity && (
        <>
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <ViewActivityDialog
              activity={selectedActivity}
              onClose={closeAllDialogs}
            />
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <EditActivityForm
              activity={selectedActivity}
              onSubmit={handleUpdateActivity}
              onCancel={closeAllDialogs}
              contacts={contacts}
              deals={deals}
              users={users}
            />
          </Dialog>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DeleteActivityDialog
              activity={selectedActivity}
              onDelete={handleDeleteConfirm}
              onCancel={closeAllDialogs}
            />
          </Dialog>
        </>
      )}
    </DashboardLayout>
  )
}
