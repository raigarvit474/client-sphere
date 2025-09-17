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
import { Progress } from '@/components/ui/progress'
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  Building2,
  Target,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  FileText,
  Tag
} from 'lucide-react'

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
    email?: string
    phone?: string
  }
  lead?: {
    id: string
    title: string
    firstName: string
    lastName: string
  }
  owner: {
    id: string
    name?: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface ViewDealDialogProps {
  deal: Deal
  onClose: () => void
}

const stageColors = {
  PROSPECTING: 'bg-gray-100 text-gray-800',
  QUALIFICATION: 'bg-blue-100 text-blue-800',
  NEEDS_ANALYSIS: 'bg-yellow-100 text-yellow-800',
  VALUE_PROPOSITION: 'bg-orange-100 text-orange-800',
  PROPOSAL: 'bg-purple-100 text-purple-800',
  NEGOTIATION: 'bg-indigo-100 text-indigo-800',
  CLOSED_WON: 'bg-green-100 text-green-800',
  CLOSED_LOST: 'bg-red-100 text-red-800',
}

const sourceLabels = {
  INBOUND: 'Inbound Lead',
  OUTBOUND: 'Outbound Prospecting',
  REFERRAL: 'Referral',
  MARKETING: 'Marketing Campaign',
  TRADE_SHOW: 'Trade Show',
  COLD_OUTREACH: 'Cold Outreach',
  OTHER: 'Other'
}

export function ViewDealDialog({ deal, onClose }: ViewDealDialogProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  const weightedValue = Math.round(deal.value * (deal.probability / 100))

  return (
    <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold">{deal.title}</DialogTitle>
        <DialogDescription>
          Deal details and information
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Deal Value</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(deal.value)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Win Probability</p>
                <p className="text-2xl font-bold text-blue-700">{deal.probability}%</p>
                <Progress value={deal.probability} className="w-full h-2 mt-1" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Weighted Value</p>
                <p className="text-2xl font-bold text-purple-700">{formatCurrency(weightedValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stage */}
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium">Current Stage</h3>
          <Badge className={`text-sm px-3 py-1 ${stageColors[deal.stage as keyof typeof stageColors] || 'bg-gray-100 text-gray-800'}`}>
            {deal.stage.replace('_', ' ')}
          </Badge>
        </div>

        <Separator />

        {/* Contact Information */}
        {deal.contact && (
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Primary Contact
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">
                      {deal.contact.firstName} {deal.contact.lastName}
                    </span>
                  </div>
                  {deal.contact.company && (
                    <div className="flex items-center mb-2">
                      <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{deal.contact.company}</span>
                    </div>
                  )}
                </div>
                <div>
                  {deal.contact.email && (
                    <div className="flex items-center mb-2">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{deal.contact.email}</span>
                    </div>
                  )}
                  {deal.contact.phone && (
                    <div className="flex items-center mb-2">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{deal.contact.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deal Information */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Deal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {deal.expectedCloseDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expected Close Date</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{formatDate(deal.expectedCloseDate)}</span>
                  </div>
                </div>
              )}

              {deal.actualCloseDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Actual Close Date</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{formatDate(deal.actualCloseDate)}</span>
                  </div>
                </div>
              )}

              {deal.source && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Source</p>
                  <span>{sourceLabels[deal.source as keyof typeof sourceLabels] || deal.source}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Deal Owner</p>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{deal.owner.name || deal.owner.email}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Created</p>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{formatDateTime(deal.createdAt)}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{formatDateTime(deal.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {deal.tags.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {deal.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {deal.notes && (
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Notes
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{deal.notes}</p>
            </div>
          </div>
        )}

        {/* Related Lead */}
        {deal.lead && (
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Related Lead
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium">{deal.lead.title}</div>
              <div className="text-sm text-gray-600">
                {deal.lead.firstName} {deal.lead.lastName}
              </div>
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  )
}