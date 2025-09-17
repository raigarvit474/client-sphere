'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

const dealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.number().min(0, 'Value must be positive'),
  stage: z.string(),
  probability: z.number().min(0).max(100),
  expectedCloseDate: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
})

type DealFormData = z.infer<typeof dealSchema>

interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  position?: string
}

interface CreateDealFromContactFormProps {
  contact: Contact
  onSubmit: (data: DealFormData & { tags: string[], contactId: string }) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function CreateDealFromContactForm({ 
  contact, 
  onSubmit, 
  onCancel, 
  loading = false 
}: CreateDealFromContactFormProps) {
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: `${contact.company || contact.firstName + ' ' + contact.lastName} - New Deal`,
      value: 0,
      stage: 'PROSPECTING',
      probability: 10,
      expectedCloseDate: '',
      source: 'Contact',
      notes: `Deal created from contact: ${contact.firstName} ${contact.lastName}${contact.company ? ` from ${contact.company}` : ''}`,
    },
  })

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const onSubmitForm = async (data: DealFormData) => {
    try {
      setSubmitting(true)
      await onSubmit({ ...data, tags, contactId: contact.id })
      onCancel()
    } catch (error) {
      console.error('Error creating deal:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate next month's date for default expected close date
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  const defaultCloseDate = nextMonth.toISOString().split('T')[0]

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create Deal from Contact</DialogTitle>
        <p className="text-sm text-gray-500">
          Creating a new deal for: {contact.firstName} {contact.lastName}
          {contact.company && ` from ${contact.company}`}
        </p>
      </DialogHeader>
      
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        {/* Deal Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Deal Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="title">Deal Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter deal title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Deal Value ($) *</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                {...register('value', { valueAsNumber: true })}
                placeholder="Enter deal value"
                className={errors.value ? 'border-red-500' : ''}
              />
              {errors.value && (
                <p className="text-sm text-red-500">{errors.value.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                {...register('probability', { valueAsNumber: true })}
                placeholder="Enter probability"
                className={errors.probability ? 'border-red-500' : ''}
              />
              {errors.probability && (
                <p className="text-sm text-red-500">{errors.probability.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select defaultValue="PROSPECTING" onValueChange={(value) => setValue('stage', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROSPECTING">Prospecting</SelectItem>
                  <SelectItem value="QUALIFICATION">Qualification</SelectItem>
                  <SelectItem value="NEEDS_ANALYSIS">Needs Analysis</SelectItem>
                  <SelectItem value="VALUE_PROPOSITION">Value Proposition</SelectItem>
                  <SelectItem value="PROPOSAL">Proposal</SelectItem>
                  <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                  <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
                  <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select defaultValue="Contact" onValueChange={(value) => setValue('source', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contact">Contact</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                  <SelectItem value="Phone Call">Phone Call</SelectItem>
                  <SelectItem value="Trade Show">Trade Show</SelectItem>
                  <SelectItem value="Advertisement">Advertisement</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
            <Input
              id="expectedCloseDate"
              type="date"
              {...register('expectedCloseDate')}
              min={new Date().toISOString().split('T')[0]}
              defaultValue={defaultCloseDate}
            />
          </div>
        </div>

        {/* Contact Information Display */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Associated Contact</h3>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  {contact.firstName} {contact.lastName}
                </div>
                {contact.company && (
                  <div className="text-sm text-gray-600">{contact.company}</div>
                )}
                {contact.position && (
                  <div className="text-sm text-gray-500">{contact.position}</div>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {contact.email && <div>{contact.email}</div>}
                {contact.phone && <div>{contact.phone}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Tags</h3>
          
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button type="button" onClick={addTag} variant="outline">
              Add Tag
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
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
          )}
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Notes</h3>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              {...register('notes')}
              placeholder="Enter any additional notes about this deal"
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button type="submit" disabled={submitting || loading}>
            {submitting ? 'Creating...' : 'Create Deal'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}