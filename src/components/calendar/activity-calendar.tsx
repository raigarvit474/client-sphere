'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Users,
  Plus,
  Clock
} from 'lucide-react'

interface Activity {
  id: string
  title: string
  description?: string
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'NOTE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
  isCompleted: boolean
  contact?: {
    id: string
    firstName: string
    lastName: string
    company?: string
  }
  assignee: {
    id: string
    name?: string
    email: string
  }
}

interface ActivityCalendarProps {
  activities: Activity[]
  onActivityClick?: (activity: Activity) => void
  onDateClick?: (date: Date) => void
  onCreateActivity?: () => void
}

const activityTypeConfig = {
  CALL: { icon: Phone, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  EMAIL: { icon: Mail, color: 'bg-green-100 text-green-800 border-green-200' },
  MEETING: { icon: Users, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  TASK: { icon: Calendar, color: 'bg-orange-100 text-orange-800 border-orange-200' },
  NOTE: { icon: FileText, color: 'bg-gray-100 text-gray-800 border-gray-200' }
}

const priorityConfig = {
  LOW: { color: 'border-l-gray-400' },
  MEDIUM: { color: 'border-l-yellow-400' },
  HIGH: { color: 'border-l-orange-400' },
  URGENT: { color: 'border-l-red-400' }
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ActivityCalendar({ 
  activities, 
  onActivityClick, 
  onDateClick,
  onCreateActivity 
}: ActivityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Get activities by date
  const activitiesByDate = useMemo(() => {
    const grouped: Record<string, Activity[]> = {}
    
    activities.forEach(activity => {
      if (activity.dueDate) {
        const date = new Date(activity.dueDate)
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(activity)
      }
    })
    
    return grouped
  }, [activities])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getDateKey = (day: number) => {
    return `${currentYear}-${currentMonth}-${day}`
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear
  }

  const renderCalendarDay = (day: number) => {
    const dateKey = getDateKey(day)
    const dayActivities = activitiesByDate[dateKey] || []
    const isCurrentDay = isToday(day)
    const date = new Date(currentYear, currentMonth, day)

    return (
      <div
        key={day}
        className={`min-h-[120px] p-2 border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${
          isCurrentDay ? 'bg-blue-50 border-blue-300' : ''
        }`}
        onClick={() => onDateClick?.(date)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </span>
          {dayActivities.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {dayActivities.length}
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          {dayActivities.slice(0, 3).map(activity => {
            const typeConfig = activityTypeConfig[activity.type]
            const priorityConfig_ = priorityConfig[activity.priority]
            const Icon = typeConfig.icon

            return (
              <div
                key={activity.id}
                className={`
                  text-xs p-1.5 rounded border-l-2 cursor-pointer hover:shadow-sm transition-shadow
                  ${typeConfig.color} ${priorityConfig_.color}
                  ${activity.isCompleted ? 'opacity-60 line-through' : ''}
                `}
                onClick={(e) => {
                  e.stopPropagation()
                  onActivityClick?.(activity)
                }}
              >
                <div className="flex items-center gap-1">
                  <Icon className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate font-medium">{activity.title}</span>
                </div>
                {activity.dueDate && (
                  <div className="flex items-center gap-1 mt-1 text-gray-600">
                    <Clock className="h-2 w-2" />
                    <span>{new Date(activity.dueDate).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit', 
                      hour12: true 
                    })}</span>
                  </div>
                )}
              </div>
            )
          })}
          
          {dayActivities.length > 3 && (
            <div className="text-xs text-gray-500 text-center py-1">
              +{dayActivities.length - 3} more
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderEmptyDay = (index: number) => (
    <div key={`empty-${index}`} className="min-h-[120px] p-2 border border-gray-100 bg-gray-50" />
  )

  // Create calendar grid
  const calendarDays = []
  
  // Empty days before month starts
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(renderEmptyDay(i))
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(renderCalendarDay(day))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-xl">
              {monthNames[currentMonth]} {currentYear}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {onCreateActivity && (
            <Button onClick={onCreateActivity} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Activity
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Legend */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium mb-2">Activity Types:</div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(activityTypeConfig).map(([type, config]) => {
              const Icon = config.icon
              return (
                <div key={type} className="flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  <span className="text-xs capitalize">{type.toLowerCase()}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {/* Day headers */}
          {dayNames.map(dayName => (
            <div key={dayName} className="p-3 bg-gray-100 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
              {dayName}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays}
        </div>

        {/* Summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-blue-800 font-medium">This Month</div>
            <div className="text-2xl font-bold text-blue-900">
              {Object.values(activitiesByDate).flat().length}
            </div>
            <div className="text-blue-600">Total Activities</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-green-800 font-medium">Completed</div>
            <div className="text-2xl font-bold text-green-900">
              {Object.values(activitiesByDate).flat().filter(a => a.isCompleted).length}
            </div>
            <div className="text-green-600">Activities Done</div>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-orange-800 font-medium">Overdue</div>
            <div className="text-2xl font-bold text-orange-900">
              {Object.values(activitiesByDate).flat().filter(a => 
                !a.isCompleted && a.dueDate && new Date(a.dueDate) < new Date()
              ).length}
            </div>
            <div className="text-orange-600">Need Attention</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}