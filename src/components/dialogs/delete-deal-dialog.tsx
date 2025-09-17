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
  DollarSign,
  Calendar,
  Users,
  Building2,
  Trash2
} from 'lucide-react'

interface Deal {
  id: string
  title: string
  value: number
  stage: string
  probability: number
  expectedCloseDate?: string
  contact?: {
    id: string
    firstName: string
    lastName: string
    company?: string
  }
  owner: {
    id: string
    name?: string
    email: string
  }
}

interface DeleteDealDialogProps {
  deal: Deal
  onDelete: () => Promise<void> | void
  onCancel: () => void
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

export function DeleteDealDialog({ deal, onDelete, onCancel }: DeleteDealDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete()
      onCancel()
    } catch (error) {
      console.error('Error deleting deal:', error)
    } finally {
      setIsDeleting(false)
    }
  }

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
      month: 'short',
      day: 'numeric'
    })
  }

  const isActiveStage = !['CLOSED_WON', 'CLOSED_LOST'].includes(deal.stage)
  const weightedValue = Math.round(deal.value * (deal.probability / 100))

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="flex items-center text-red-600">
          <Trash2 className="h-5 w-5 mr-2" />
          Delete Deal
        </DialogTitle>
        <DialogDescription>
          This action cannot be undone. This will permanently delete the deal and all associated data.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Warning Alert */}
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">
              You are about to permanently delete this deal
            </p>
            <p className="text-xs text-red-700 mt-1">
              This will remove all deal history, activities, and associated data. Consider moving to "Closed Lost" instead if you want to preserve the record.
            </p>
          </div>
        </div>

        <Separator />

        {/* Deal Summary */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Deal Information</h4>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{deal.title}</span>
              <Badge className={`${stageColors[deal.stage as keyof typeof stageColors] || 'bg-gray-100 text-gray-800'}`}>
                {deal.stage.replace('_', ' ')}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-gray-600">Value</p>
                  <p className="font-medium">{formatCurrency(deal.value)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div>
                  <p className="text-gray-600">Probability</p>
                  <p className="font-medium">{deal.probability}%</p>
                </div>
              </div>

              {deal.contact && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <p className="text-gray-600">Contact</p>
                    <p className="font-medium text-xs">
                      {deal.contact.firstName} {deal.contact.lastName}
                    </p>
                  </div>
                </div>
              )}

              {deal.expectedCloseDate && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <p className="text-gray-600">Expected Close</p>
                    <p className="font-medium text-xs">{formatDate(deal.expectedCloseDate)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-gray-600 text-sm">Owner</p>
                  <p className="font-medium text-sm">{deal.owner.name || deal.owner.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Warning for Active Deals */}
        {isActiveStage && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-800">Active Deal Impact</p>
                <p className="text-orange-700 text-xs mt-1">
                  This deal is currently active in your pipeline with a weighted value of{' '}
                  <span className="font-medium">{formatCurrency(weightedValue)}</span>.
                  Deleting it will affect your pipeline metrics and forecasting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alternative Actions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm">
            <p className="font-medium text-blue-800 mb-1">Alternative Actions</p>
            <ul className="text-blue-700 text-xs space-y-1">
              <li>• Move to "Closed Lost" to preserve historical data</li>
              <li>• Archive the deal instead of deleting it</li>
              <li>• Update the deal status if it's no longer relevant</li>
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
          {isDeleting ? 'Deleting...' : 'Delete Deal'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}