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
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'

const leadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).default('NEW'),
  source: z.enum(['WEBSITE', 'REFERRAL', 'COLD_CALL', 'EMAIL', 'SOCIAL_MEDIA', 'EVENT', 'ADVERTISEMENT', 'OTHER']).optional(),
  score: z.number().min(0).max(100).optional(),
  estimatedValue: z.number().positive().optional(),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
})

type LeadFormData = z.infer<typeof leadSchema>

interface AddLeadFormProps {
  onSubmit: (data: LeadFormData) => Promise<void> | void
  onCancel: () => void
}

const leadStatuses = [
  { value: 'NEW', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'QUALIFIED', label: 'Qualified', color: 'bg-green-100 text-green-800' },
  { value: 'PROPOSAL', label: 'Proposal', color: 'bg-purple-100 text-purple-800' },
  { value: 'NEGOTIATION', label: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
  { value: 'CLOSED_WON', label: 'Closed Won', color: 'bg-green-100 text-green-800' },
  { value: 'CLOSED_LOST', label: 'Closed Lost', color: 'bg-red-100 text-red-800' }
]

const leadSources = [
  { value: 'WEBSITE', label: 'Website' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'COLD_CALL', label: 'Cold Call' },
  { value: 'EMAIL', label: 'Email Campaign' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'EVENT', label: 'Event/Trade Show' },
  { value: 'ADVERTISEMENT', label: 'Advertisement' },
  { value: 'OTHER', label: 'Other' }
]

export function AddLeadForm({ onSubmit, onCancel }: AddLeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema) as any,
    defaultValues: {
      status: 'NEW',
      tags: []
    }
  })

  const status = watch('status')

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()]
      setTags(newTags)
      setValue('tags', newTags)
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    setTags(newTags)
    setValue('tags', newTags)
  }

  const onFormSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        ...data,
        tags: tags
      })
      onCancel() // Close dialog on success
    } catch (error) {
      console.error('Error creating lead:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Lead</DialogTitle>
        <DialogDescription>
          Add a new lead to your pipeline. Fill in the information below.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Lead Title */}
        <div>
          <Label htmlFor="title">Lead Title *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="e.g., Enterprise CRM Solution for TechCorp"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              placeholder="John"
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && (
              <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              placeholder="Doe"
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && (
              <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john.doe@example.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        {/* Company Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              {...register('company')}
              placeholder="TechCorp Inc"
            />
          </div>

          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              {...register('position')}
              placeholder="CTO"
            />
          </div>
        </div>

        {/* Lead Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => setValue('status', value as any)} defaultValue="NEW">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {leadStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${status.color}`}></div>
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="source">Source</Label>
            <Select onValueChange={(value) => setValue('source', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {leadSources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="score">Lead Score (0-100)</Label>
            <Input
              id="score"
              type="number"
              {...register('score', { valueAsNumber: true })}
              placeholder="75"
              min="0"
              max="100"
            />
          </div>

          <div>
            <Label htmlFor="estimatedValue">Est. Value ($)</Label>
            <Input
              id="estimatedValue"
              type="number"
              {...register('estimatedValue', { valueAsNumber: true })}
              placeholder="50000"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
            <Input
              id="expectedCloseDate"
              type="date"
              {...register('expectedCloseDate')}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Additional notes about this lead..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Lead...' : 'Create Lead'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}