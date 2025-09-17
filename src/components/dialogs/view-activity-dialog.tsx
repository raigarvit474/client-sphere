'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  User,
  Building2,
  MapPin,
  Bell,
  Tag,
  MessageSquare
} from 'lucide-react'

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
    email?: string
    phone?: string
  }
  deal?: {
    id: string
    title: string
    value?: number
  }
  lead?: {
    id: string
    title: string
    firstName: string
    lastName: string
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

interface ViewActivityDialogProps {
  activity: Activity
  onClose: () => void
}

const typeIcons = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  TASK: CheckCircle2,
  NOTE: FileText
}

const typeColors = {
  CALL: 'bg-blue-100 text-blue-800',
  EMAIL: 'bg-green-100 text-green-800',
  MEETING: 'bg-purple-100 text-purple-800',
  TASK: 'bg-orange-100 text-orange-800',
  NOTE: 'bg-gray-100 text-gray-800'
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800'
}

const typeLabels = {
  CALL: 'Phone Call',
  EMAIL: 'Email',
  MEETING: 'Meeting',
  TASK: 'Task',
  NOTE: 'Note'
}

export function ViewActivityDialog({ activity, onClose }: ViewActivityDialogProps) {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const TypeIcon = typeIcons[activity.type]
  const isOverdue = activity.dueDate && !activity.isCompleted && new Date(activity.dueDate) < new Date()

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center text-xl font-semibold">
          <TypeIcon className="h-6 w-6 mr-3 text-gray-600" />
          {activity.title}
        </DialogTitle>
        <DialogDescription>
          Activity details and information
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Status and Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge className={`${typeColors[activity.type]} px-3 py-1`}>
              <TypeIcon className="h-3 w-3 mr-1" />
              {typeLabels[activity.type]}
            </Badge>
            <Badge className={`${priorityColors[activity.priority]} px-3 py-1`}>
              <AlertCircle className="h-3 w-3 mr-1" />
              {activity.priority}
            </Badge>
          </div>
          
          <div className="flex items-center">
            {activity.isCompleted ? (
              <Badge className="bg-green-100 text-green-800 px-3 py-1">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            ) : isOverdue ? (
              <Badge className="bg-red-100 text-red-800 px-3 py-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Description */}
        {activity.description && (
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Description
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{activity.description}</p>
            </div>
          </div>
        )}

        {/* Timeline Information */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-700">Created</span>
              </div>
              <p className="text-gray-600">{formatDateTime(activity.createdAt)}</p>
              <p className="text-sm text-gray-500 mt-1">
                by {activity.createdBy.name || activity.createdBy.email}
              </p>
            </div>

            {activity.dueDate && (
              <div className={`rounded-lg p-4 ${isOverdue && !activity.isCompleted ? 'bg-red-50' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-2">
                  <Calendar className={`h-4 w-4 mr-2 ${isOverdue && !activity.isCompleted ? 'text-red-500' : 'text-gray-500'}`} />
                  <span className={`font-medium ${isOverdue && !activity.isCompleted ? 'text-red-700' : 'text-gray-700'}`}>
                    Due Date
                  </span>
                </div>
                <p className={isOverdue && !activity.isCompleted ? 'text-red-600' : 'text-gray-600'}>
                  {formatDateTime(activity.dueDate)}
                </p>
                {isOverdue && !activity.isCompleted && (
                  <p className="text-sm text-red-500 mt-1 font-medium">Overdue!</p>
                )}
              </div>
            )}

            {activity.completedAt && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                  <span className="font-medium text-green-700">Completed</span>
                </div>
                <p className="text-green-600">{formatDateTime(activity.completedAt)}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-700">Last Updated</span>
              </div>
              <p className="text-gray-600">{formatDateTime(activity.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* People Information */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            People
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-700">Assigned To</span>
              </div>
              <p className="text-gray-600">{activity.assignee.name || activity.assignee.email}</p>
              <p className="text-sm text-gray-500">{activity.assignee.email}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-700">Created By</span>
              </div>
              <p className="text-gray-600">{activity.createdBy.name || activity.createdBy.email}</p>
              <p className="text-sm text-gray-500">{activity.createdBy.email}</p>
            </div>
          </div>
        </div>

        {/* Related Records */}
        {(activity.contact || activity.deal || activity.lead) && (
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Related Records
            </h3>
            <div className="space-y-4">
              {activity.contact && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium text-blue-700">Contact</span>
                  </div>
                  <div className="text-blue-600">
                    <p className="font-medium">
                      {activity.contact.firstName} {activity.contact.lastName}
                    </p>
                    {activity.contact.company && (
                      <p className="text-sm text-blue-500">{activity.contact.company}</p>
                    )}
                    {activity.contact.email && (
                      <p className="text-sm text-blue-500">{activity.contact.email}</p>
                    )}
                    {activity.contact.phone && (
                      <p className="text-sm text-blue-500">{activity.contact.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {activity.deal && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Target className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-medium text-green-700">Deal</span>
                  </div>
                  <div className="text-green-600">
                    <p className="font-medium">{activity.deal.title}</p>
                    {activity.deal.value && (
                      <p className="text-sm text-green-500">
                        Value: ${activity.deal.value.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activity.lead && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="font-medium text-purple-700">Lead</span>
                  </div>
                  <div className="text-purple-600">
                    <p className="font-medium">{activity.lead.title}</p>
                    <p className="text-sm text-purple-500">
                      {activity.lead.firstName} {activity.lead.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <h4 className="font-medium flex items-center mb-3">
            <FileText className="h-4 w-4 mr-2" />
            Activity Summary
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Type</p>
              <p className="font-medium">{typeLabels[activity.type]}</p>
            </div>
            <div>
              <p className="text-gray-600">Priority</p>
              <p className="font-medium">{activity.priority}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-medium">
                {activity.isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">ID</p>
              <p className="font-mono text-xs">{activity.id}</p>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  )
}