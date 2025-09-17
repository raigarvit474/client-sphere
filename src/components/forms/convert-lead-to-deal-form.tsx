'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

interface Lead {
  id: string
  title: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  position?: string
  source?: string
  status: string
  value?: number
  notes?: string
  tags: string[]
  contact?: {
    id: string
    firstName: string
    lastName: string
  }
}

interface ConvertLeadToDealFormProps {
  lead: Lead
  isOpen: boolean
  onClose: () => void
  onConvert: (data: DealFormData & { tags: string[], leadId: string, contactId?: string }) => Promise<void>
  loading?: boolean
}

export function ConvertLeadToDealForm({ 
  lead, 
  isOpen,
  onClose,
  onConvert, 
  loading = false 
}: ConvertLeadToDealFormProps) {
  const [tags, setTags] = useState<string[]>(lead.tags || [])
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
      title: lead.title.replace(/lead/i, 'Deal') || `${lead.company || lead.firstName + ' ' + lead.lastName} - Deal`,
      value: lead.value || 0,
      stage: 'PROSPECTING',
      probability: 10,
      expectedCloseDate: '',
      source: lead.source || 'Lead Conversion',
      notes: `Converted from lead: ${lead.title}\n\nOriginal lead notes: ${lead.notes || 'No notes'}`,
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
      await onConvert({ 
        ...data, 
        tags, 
        leadId: lead.id,
        contactId: lead.contact?.id
      })
      onClose()
    } catch (error) {
      console.error('Error converting lead to deal:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate next month's date for default expected close date
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  const defaultCloseDate = nextMonth.toISOString().split('T')[0]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Convert Lead to Deal</DialogTitle>
        <p className="text-sm text-gray-500">
          Converting lead: {lead.title}
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
              <Select defaultValue="Lead Conversion" onValueChange={(value) => setValue('source', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead Conversion">Lead Conversion</SelectItem>
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

        {/* Lead Information Display */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Original Lead Information</h3>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-900">{lead.title}</div>
                <div className="text-gray-600">
                  {lead.firstName} {lead.lastName}
                </div>
                {lead.company && <div className="text-gray-500">{lead.company}</div>}
              </div>
              <div>
                <div className="text-gray-600">Status: {lead.status.replace('_', ' ')}</div>
                {lead.email && <div className="text-gray-500">{lead.email}</div>}
                {lead.phone && <div className="text-gray-500">{lead.phone}</div>}
              </div>
            </div>
            {lead.contact && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                <div className="font-medium text-blue-900">Associated Contact</div>
                <div className="text-blue-700">
                  {lead.contact.firstName} {lead.contact.lastName}
                </div>
              </div>
            )}
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
            {submitting ? 'Converting...' : 'Convert to Deal'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
      </DialogContent>
    </Dialog>
  )
}
