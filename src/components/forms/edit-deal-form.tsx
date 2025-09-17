'use client'

import { useState, useEffect } from 'react'
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
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Users, 
  Building2,
  Target,
  AlertCircle
} from 'lucide-react'

const dealSchema = z.object({
  title: z.string().min(1, 'Deal title is required'),
  description: z.string().optional(),
  value: z.number().positive('Deal value must be positive'),
  stage: z.enum(['PROSPECTING', 'QUALIFICATION', 'NEEDS_ANALYSIS', 'VALUE_PROPOSITION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  contactId: z.string().optional(),
  leadId: z.string().optional(),
  assignedTo: z.string().optional(),
  source: z.enum(['INBOUND', 'OUTBOUND', 'REFERRAL', 'MARKETING', 'TRADE_SHOW', 'COLD_OUTREACH', 'OTHER']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
})

type DealFormData = z.infer<typeof dealSchema>

interface Deal {
  id: string
  title: string
  value: number
  stage: string
  probability: number
  expectedCloseDate?: string
  actualCloseDate?: string
  source?: string
  notes?: string
  tags: string[]
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
  owner: {
    id: string
    name?: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface EditDealFormProps {
  deal: Deal
  onSubmit: (data: DealFormData) => Promise<void> | void
  onCancel: () => void
  contacts?: Array<{ id: string; firstName: string; lastName: string; company?: string }>
  leads?: Array<{ id: string; title: string; firstName: string; lastName: string }>
  users?: Array<{ id: string; name: string; email: string }>
}

const dealStages = [
  { 
    value: 'PROSPECTING', 
    label: 'Prospecting', 
    probability: 10,
    color: 'bg-gray-100 text-gray-800',
    description: 'Initial contact and research phase'
  },
  { 
    value: 'QUALIFICATION', 
    label: 'Qualification', 
    probability: 25,
    color: 'bg-blue-100 text-blue-800',
    description: 'Qualifying prospect needs and budget'
  },
  { 
    value: 'NEEDS_ANALYSIS', 
    label: 'Needs Analysis', 
    probability: 40,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Understanding customer requirements'
  },
  { 
    value: 'VALUE_PROPOSITION', 
    label: 'Value Proposition', 
    probability: 50,
    color: 'bg-orange-100 text-orange-800',
    description: 'Presenting solution value'
  },
  { 
    value: 'PROPOSAL', 
    label: 'Proposal', 
    probability: 60,
    color: 'bg-purple-100 text-purple-800',
    description: 'Proposal sent and under review'
  },
  { 
    value: 'NEGOTIATION', 
    label: 'Negotiation', 
    probability: 75,
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Terms and pricing negotiation'
  },
  { 
    value: 'CLOSED_WON', 
    label: 'Closed Won', 
    probability: 100,
    color: 'bg-green-100 text-green-800',
    description: 'Deal successfully closed'
  },
  { 
    value: 'CLOSED_LOST', 
    label: 'Closed Lost', 
    probability: 0,
    color: 'bg-red-100 text-red-800',
    description: 'Deal lost to competitor or cancelled'
  }
]

const dealSources = [
  { value: 'INBOUND', label: 'Inbound Lead' },
  { value: 'OUTBOUND', label: 'Outbound Prospecting' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'MARKETING', label: 'Marketing Campaign' },
  { value: 'TRADE_SHOW', label: 'Trade Show' },
  { value: 'COLD_OUTREACH', label: 'Cold Outreach' },
  { value: 'OTHER', label: 'Other' }
]

const priorities = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-800' }
]

export function EditDealForm({ 
  deal,
  onSubmit, 
  onCancel, 
  contacts = [], 
  leads = [], 
  users = [] 
}: EditDealFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema) as any,
    defaultValues: {
      title: deal.title,
      value: deal.value,
      stage: deal.stage as any,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : undefined,
      contactId: deal.contact?.id,
      leadId: deal.lead?.id,
      source: deal.source as any,
      notes: deal.notes,
      tags: deal.tags
    }
  })

  const stage = watch('stage')
  const probability = watch('probability')
  const value = watch('value')

  const selectedStage = dealStages.find(s => s.value === stage)

  const onFormSubmit = async (data: DealFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onCancel() // Close dialog on success
    } catch (error) {
      console.error('Error updating deal:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStageChange = (newStage: string) => {
    setValue('stage', newStage as any)
    const stageData = dealStages.find(s => s.value === newStage)
    if (stageData) {
      setValue('probability', stageData.probability)
    }
  }

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Deal</DialogTitle>
        <DialogDescription>
          Update deal information, stage, and progress.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Deal Title */}
        <div>
          <Label htmlFor="title">Deal Title *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="e.g., Enterprise CRM License for TechCorp"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Value */}
        <div>
          <Label htmlFor="value">Deal Value *</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <Input
              id="value"
              type="number"
              {...register('value', { valueAsNumber: true })}
              placeholder="50000"
              className={`pl-8 ${errors.value ? 'border-red-500' : ''}`}
              min="0"
              step="0.01"
            />
          </div>
          {errors.value && (
            <p className="text-sm text-red-600 mt-1">{errors.value.message}</p>
          )}
        </div>

        {/* Stage and Probability */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stage">Pipeline Stage *</Label>
            <Select onValueChange={handleStageChange} defaultValue={deal.stage}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {dealStages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-medium">{stage.label}</div>
                        <div className="text-xs text-gray-500">{stage.description}</div>
                      </div>
                      <Badge variant="secondary" className={`ml-2 ${stage.color}`}>
                        {stage.probability}%
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="probability">Win Probability (%)</Label>
            <Input
              id="probability"
              type="number"
              {...register('probability', { valueAsNumber: true })}
              placeholder="75"
              min="0"
              max="100"
            />
            {probability !== undefined && (
              <div className="mt-2">
                <Progress value={probability} className="w-full h-2" />
                <p className="text-xs text-gray-500 mt-1">{probability}% chance to close</p>
              </div>
            )}
          </div>
        </div>

        {/* Expected Close Date */}
        <div>
          <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
          <Input
            id="expectedCloseDate"
            type="date"
            {...register('expectedCloseDate')}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Related Records */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactId">Primary Contact</Label>
            <Select onValueChange={(value) => setValue('contactId', value)} defaultValue={deal.contact?.id}>
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
            <Label htmlFor="leadId">Related Lead</Label>
            <Select onValueChange={(value) => setValue('leadId', value)} defaultValue={deal.lead?.id}>
              <SelectTrigger>
                <SelectValue placeholder="Select lead" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    <div>
                      <div className="font-medium">{lead.title}</div>
                      <div className="text-xs text-gray-500">
                        {lead.firstName} {lead.lastName}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Source */}
        <div>
          <Label htmlFor="source">Deal Source</Label>
          <Select onValueChange={(value) => setValue('source', value as any)} defaultValue={deal.source}>
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {dealSources.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  {source.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Internal notes, next steps, important details..."
            rows={3}
          />
        </div>

        {/* Deal Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium flex items-center mb-3">
            <Target className="h-5 w-5 mr-2" />
            Deal Summary
          </h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
              <span className="text-gray-600">Value:</span>
              <span className="font-medium ml-1">
                ${value?.toLocaleString() || '0'}
              </span>
            </div>

            {selectedStage && (
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-gray-600">Stage:</span>
                <Badge variant="secondary" className={`ml-1 ${selectedStage.color}`}>
                  {selectedStage.label}
                </Badge>
              </div>
            )}

            {probability !== undefined && (
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                <span className="text-gray-600">Win Chance:</span>
                <span className="font-medium ml-1">{probability}%</span>
              </div>
            )}

            {value && probability && (
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-purple-600" />
                <span className="text-gray-600">Weighted Value:</span>
                <span className="font-medium ml-1">
                  ${Math.round(value * (probability / 100)).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating Deal...' : 'Update Deal'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}