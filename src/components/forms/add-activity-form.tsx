'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Clock 
} from 'lucide-react'

const activitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  assigneeId: z.string().optional(),
  isCompleted: z.boolean().default(false),
  reminderMinutes: z.number().optional(),
  location: z.string().optional(),
  notes: z.string().optional()
})

type ActivityFormData = z.infer<typeof activitySchema>

interface AddActivityFormProps {
  onSubmit: (data: ActivityFormData) => Promise<void> | void
  onCancel: () => void
  contacts?: Array<{ id: string; firstName: string; lastName: string; company?: string }>
  deals?: Array<{ id: string; title: string; value?: number }>
  users?: Array<{ id: string; name: string; email: string }>
}

const activityTypes = [
  { value: 'CALL', label: 'Phone Call', icon: Phone, color: 'bg-blue-100 text-blue-800' },
  { value: 'EMAIL', label: 'Email', icon: Mail, color: 'bg-green-100 text-green-800' },
  { value: 'MEETING', label: 'Meeting', icon: Users, color: 'bg-purple-100 text-purple-800' },
  { value: 'TASK', label: 'Task', icon: CheckCircle, color: 'bg-orange-100 text-orange-800' },
  { value: 'NOTE', label: 'Note', icon: FileText, color: 'bg-gray-100 text-gray-800' }
]

const priorities = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-800', icon: Clock },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-800', icon: AlertCircle }
]

const reminderOptions = [
  { value: 0, label: 'At time of event' },
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' }
]

export function AddActivityForm({ 
  onSubmit, 
  onCancel, 
  contacts = [], 
  deals = [], 
  users = [] 
}: AddActivityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema) as any,
    defaultValues: {
      priority: 'MEDIUM',
      isCompleted: false
    }
  })

  const activityType = watch('type')
  const priority = watch('priority')
  const isCompleted = watch('isCompleted')
  const dueDate = watch('dueDate')

  const onFormSubmit = async (data: ActivityFormData) => {
    setIsSubmitting(true)
    try {
      // Combine date and time if both are provided
      const finalData = { ...data }
      if (data.dueDate && data.dueTime) {
        finalData.dueDate = `${data.dueDate}T${data.dueTime}:00.000Z`
      } else if (data.dueDate) {
        finalData.dueDate = `${data.dueDate}T12:00:00.000Z`
      }

      await onSubmit(finalData)
      onCancel() // Close dialog on success
    } catch (error) {
      console.error('Error creating activity:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedType = activityTypes.find(type => type.value === activityType)
  const selectedPriority = priorities.find(p => p.value === priority)

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Activity</DialogTitle>
        <DialogDescription>
          Schedule a new activity or task. Fill in the details below.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Activity Title */}
        <div>
          <Label htmlFor="title">Activity Title *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="e.g., Follow-up call with John Doe"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Type and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Activity Type *</Label>
            <Select onValueChange={(value) => setValue('type', value as ActivityFormData['type'])}>
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="priority">Priority *</Label>
            <Select onValueChange={(value) => setValue('priority', value as ActivityFormData['priority'])} defaultValue="MEDIUM">
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => {
                  const Icon = priority.icon
                  return (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        <span>{priority.label}</span>
                        <Badge variant="secondary" className={`ml-2 ${priority.color}`}>
                          {priority.value}
                        </Badge>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Due Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label htmlFor="dueTime">Due Time</Label>
            <Input
              id="dueTime"
              type="time"
              {...register('dueTime')}
              disabled={!dueDate}
              className={!dueDate ? 'opacity-50' : ''}
            />
          </div>
        </div>

        {/* Related Records */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactId">Related Contact</Label>
            <Select onValueChange={(value) => setValue('contactId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    <div>
                      <div className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </div>
                      {contact.company && (
                        <div className="text-xs text-gray-500">{contact.company}</div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dealId">Related Deal</Label>
            <Select onValueChange={(value) => setValue('dealId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select deal" />
              </SelectTrigger>
              <SelectContent>
                {deals.map((deal) => (
                  <SelectItem key={deal.id} value={deal.id}>
                    <div>
                      <div className="font-medium">{deal.title}</div>
                      {deal.value && (
                        <div className="text-xs text-gray-500">
                          ${deal.value.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Assignee */}
        <div>
          <Label htmlFor="assigneeId">Assigned To</Label>
          <Select onValueChange={(value) => setValue('assigneeId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Assign to user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location (for meetings) */}
        {activityType === 'MEETING' && (
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="e.g., Conference Room A, Zoom Meeting, Client Office"
            />
          </div>
        )}

        {/* Reminder */}
        {dueDate && (
          <div>
            <Label htmlFor="reminderMinutes">Reminder</Label>
            <Select onValueChange={(value) => setValue('reminderMinutes', parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Set reminder" />
              </SelectTrigger>
              <SelectContent>
                {reminderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Describe the activity, objectives, or agenda..."
            rows={3}
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Any additional notes or context..."
            rows={2}
          />
        </div>

        {/* Options */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isCompleted"
            checked={isCompleted}
            onCheckedChange={(checked) => setValue('isCompleted', checked as boolean)}
          />
          <Label htmlFor="isCompleted" className="text-sm font-medium">
            Mark as completed
          </Label>
        </div>

        {/* Activity Summary */}
        {selectedType && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <selectedType.icon className="h-5 w-5 mr-2" />
              <span className="font-medium">{selectedType.label}</span>
              {selectedPriority && (
                <Badge variant="secondary" className={`ml-2 ${selectedPriority.color}`}>
                  {selectedPriority.label}
                </Badge>
              )}
              {dueDate && (
                <Badge variant="outline" className="ml-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(dueDate).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Activity...' : 'Create Activity'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}