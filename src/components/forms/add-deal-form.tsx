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
  stage: z.enum(['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  contactId: z.string().optional(),
  leadId: z.string().optional(),
  assignedTo: z.string().optional(),
  source: z.enum(['INBOUND', 'OUTBOUND', 'REFERRAL', 'MARKETING', 'TRADE_SHOW', 'COLD_OUTREACH', 'OTHER']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  notes: z.string().optional(),
  currency: z.string().default('USD')
})

type DealFormData = z.infer<typeof dealSchema>

interface AddDealFormProps {
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
    value: 'PROPOSAL', 
    label: 'Proposal', 
    probability: 50,
    color: 'bg-purple-100 text-purple-800',
    description: 'Proposal sent and under review'
  },
  { 
    value: 'NEGOTIATION', 
    label: 'Negotiation', 
    probability: 75,
    color: 'bg-orange-100 text-orange-800',
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

const currencies = [
  { value: 'USD', label: '$', name: 'US Dollar' },
  { value: 'EUR', label: '€', name: 'Euro' },
  { value: 'GBP', label: '£', name: 'British Pound' },
  { value: 'CAD', label: 'C$', name: 'Canadian Dollar' }
]

export function AddDealForm({ 
  onSubmit, 
  onCancel, 
  contacts = [], 
  leads = [], 
  users = [] 
}: AddDealFormProps) {
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
      stage: 'PROSPECTING',
      priority: 'MEDIUM',
      currency: 'USD',
      probability: 10
    }
  })

  const stage = watch('stage')
  const priority = watch('priority')
  const currency = watch('currency')
  const probability = watch('probability')
  const value = watch('value')

  const selectedStage = dealStages.find(s => s.value === stage)
  const selectedPriority = priorities.find(p => p.value === priority)
  const selectedCurrency = currencies.find(c => c.value === currency)

  const onFormSubmit = async (data: DealFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onCancel() // Close dialog on success
    } catch (error) {
      console.error('Error creating deal:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStageChange = (newStage: string) => {
    setValue('stage', newStage as any)
    const stageData = dealStages.find(s => s.value === newStage)
    if (stageData && !probability) {
      setValue('probability', stageData.probability)
    }
  }

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Deal</DialogTitle>
        <DialogDescription>
          Add a new sales opportunity to your pipeline. Track value, stage, and progress.
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

        {/* Value and Currency */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Label htmlFor="value">Deal Value *</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  {selectedCurrency?.label || '$'}
                </span>
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

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select onValueChange={(value) => setValue('currency', value)} defaultValue="USD">
              <SelectTrigger>
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    <div className="flex items-center">
                      <span className="font-medium">{curr.label}</span>
                      <span className="ml-2 text-sm text-gray-500">{curr.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stage and Probability */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stage">Pipeline Stage *</Label>
            <Select onValueChange={handleStageChange} defaultValue="PROSPECTING">
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

        {/* Expected Close Date and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
            <Input
              id="expectedCloseDate"
              type="date"
              {...register('expectedCloseDate')}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select onValueChange={(value) => setValue('priority', value as any)} defaultValue="MEDIUM">
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <div className="flex items-center">
                      <span>{priority.label}</span>
                      <Badge variant="secondary" className={`ml-2 ${priority.color}`}>
                        {priority.value}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Related Records */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactId">Primary Contact</Label>
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
            <Label htmlFor="leadId">Related Lead</Label>
            <Select onValueChange={(value) => setValue('leadId', value)}>
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

        {/* Assigned To and Source */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Select onValueChange={(value) => setValue('assignedTo', value)}>
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

          <div>
            <Label htmlFor="source">Deal Source</Label>
            <Select onValueChange={(value) => setValue('source', value as any)}>
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
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Deal Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Describe the opportunity, scope of work, key requirements..."
            rows={3}
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Internal notes, next steps, important details..."
            rows={2}
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
                {selectedCurrency?.label}{value?.toLocaleString() || '0'}
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
                  {selectedCurrency?.label}{Math.round(value * (probability / 100)).toLocaleString()}
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
            {isSubmitting ? 'Creating Deal...' : 'Create Deal'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}