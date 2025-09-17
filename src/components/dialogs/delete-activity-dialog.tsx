'use client'

import { useState } from 'react'
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
  AlertTriangle,
  Phone,
  Mail,
  Calendar,
  FileText,
  Users,
  CheckCircle2,
  Clock,
  Target,
  User,
  Trash2
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
  }
  deal?: {
    id: string
    title: string
    value?: number
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
}

interface DeleteActivityDialogProps {
  activity: Activity
  onDelete: () => Promise<void> | void
  onCancel: () => void
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

export function DeleteActivityDialog({ activity, onDelete, onCancel }: DeleteActivityDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete()
      onCancel()
    } catch (error) {
      console.error('Error deleting activity:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const TypeIcon = typeIcons[activity.type]
  const isOverdue = activity.dueDate && !activity.isCompleted && new Date(activity.dueDate) < new Date()
  const isPending = !activity.isCompleted

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="flex items-center text-red-600">
          <Trash2 className="h-5 w-5 mr-2" />
          Delete Activity
        </DialogTitle>
        <DialogDescription>
          This action cannot be undone. This will permanently delete the activity and all associated data.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Warning Alert */}
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">
              You are about to permanently delete this activity
            </p>
            <p className="text-xs text-red-700 mt-1">
              This will remove all activity history and associated data. This action cannot be undone.
            </p>
          </div>
        </div>

        <Separator />

        {/* Activity Summary */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Activity Information</h4>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TypeIcon className="h-5 w-5 mr-3 text-gray-600" />
                <span className="font-medium text-gray-900">{activity.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`${typeColors[activity.type]} text-xs`}>
                  {typeLabels[activity.type]}
                </Badge>
                <Badge className={`${priorityColors[activity.priority]} text-xs`}>
                  {activity.priority}
                </Badge>
              </div>
            </div>

            {activity.description && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-gray-200">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-gray-600">Assigned to</p>
                  <p className="font-medium text-xs">
                    {activity.assignee.name || activity.assignee.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-gray-600">Created by</p>
                  <p className="font-medium text-xs">
                    {activity.createdBy.name || activity.createdBy.email}
                  </p>
                </div>
              </div>

              {activity.dueDate && (
                <div className="flex items-center">
                  <Calendar className={`h-4 w-4 mr-2 ${isOverdue ? 'text-red-500' : 'text-gray-500'}`} />
                  <div>
                    <p className="text-gray-600">Due date</p>
                    <p className={`font-medium text-xs ${isOverdue ? 'text-red-600' : ''}`}>
                      {formatDateTime(activity.dueDate)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium text-xs">
                    {activity.isCompleted ? (
                      <span className="text-green-600">Completed</span>
                    ) : isOverdue ? (
                      <span className="text-red-600">Overdue</span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Records Info */}
        {(activity.contact || activity.deal) && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Related Records</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Connected Records</p>
                <div className="text-blue-700 text-xs space-y-1">
                  {activity.contact && (
                    <div>• Contact: {activity.contact.firstName} {activity.contact.lastName}</div>
                  )}
                  {activity.deal && (
                    <div>• Deal: {activity.deal.title}</div>
                  )}
                  <p className="text-blue-600 mt-1">
                    These relationships will be removed but the related records will remain intact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Impact Warning for Pending Activities */}
        {isPending && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-800">Pending Activity</p>
                <p className="text-orange-700 text-xs mt-1">
                  This activity is not yet completed. Consider marking it as completed or rescheduling instead of deleting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Overdue Warning */}
        {isOverdue && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800">Overdue Activity</p>
                <p className="text-red-700 text-xs mt-1">
                  This activity is overdue. Consider completing it or rescheduling before deletion.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alternative Actions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-sm">
            <p className="font-medium text-gray-800 mb-1">Alternative Actions</p>
            <ul className="text-gray-700 text-xs space-y-1">
              <li>• Mark the activity as completed if it's done</li>
              <li>• Edit the activity to update details or due date</li>
              <li>• Reschedule the activity for a future date</li>
            </ul>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Activity'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}