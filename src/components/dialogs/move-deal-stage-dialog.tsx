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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  TrendingUp,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Target
} from 'lucide-react'

interface Deal {
  id: string
  title: string
  value: number
  stage: string
  probability: number
}

interface MoveDealStageDialogProps {
  deal: Deal
  onMove: (newStage: string, newProbability: number) => Promise<void> | void
  onCancel: () => void
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

export function MoveDealStageDialog({ deal, onMove, onCancel }: MoveDealStageDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedStage, setSelectedStage] = useState(deal.stage)
  const [customProbability, setCustomProbability] = useState<number>(deal.probability)

  const currentStage = dealStages.find(s => s.value === deal.stage)
  const newStage = dealStages.find(s => s.value === selectedStage)

  const handleStageChange = (stage: string) => {
    setSelectedStage(stage)
    const stageData = dealStages.find(s => s.value === stage)
    if (stageData) {
      setCustomProbability(stageData.probability)
    }
  }

  const handleMove = async () => {
    if (selectedStage === deal.stage) {
      onCancel()
      return
    }

    setIsSubmitting(true)
    try {
      await onMove(selectedStage, customProbability)
      onCancel()
    } catch (error) {
      console.error('Error moving deal stage:', error)
    } finally {
      setIsSubmitting(false)
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

  const currentWeightedValue = Math.round(deal.value * (deal.probability / 100))
  const newWeightedValue = Math.round(deal.value * (customProbability / 100))

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Move Deal Stage
        </DialogTitle>
        <DialogDescription>
          Update the pipeline stage for "{deal.title}"
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Current Stage */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Current Stage</Label>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {currentStage && (
                  <Badge className={`mr-3 ${currentStage.color}`}>
                    {currentStage.label}
                  </Badge>
                )}
                <span className="text-sm text-gray-600">{deal.probability}% probability</span>
              </div>
              <div className="text-sm text-gray-600">
                Weighted: {formatCurrency(currentWeightedValue)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <ArrowRight className="h-6 w-6 text-gray-400" />
        </div>

        {/* New Stage Selection */}
        <div>
          <Label htmlFor="newStage">Move to Stage</Label>
          <Select onValueChange={handleStageChange} defaultValue={deal.stage}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select new stage" />
            </SelectTrigger>
            <SelectContent>
              {dealStages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1">
                      <div className="font-medium">{stage.label}</div>
                      <div className="text-xs text-gray-500">{stage.description}</div>
                    </div>
                    <Badge variant="secondary" className={`ml-3 ${stage.color}`}>
                      {stage.probability}%
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Probability */}
        <div>
          <Label htmlFor="probability">Win Probability (%)</Label>
          <Input
            id="probability"
            type="number"
            value={customProbability}
            onChange={(e) => setCustomProbability(Number(e.target.value) || 0)}
            className="mt-2"
            min="0"
            max="100"
          />
          <div className="mt-2">
            <Progress value={customProbability} className="w-full h-2" />
            <p className="text-xs text-gray-500 mt-1">{customProbability}% chance to close</p>
          </div>
        </div>

        <Separator />

        {/* Impact Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium flex items-center mb-3">
            <Target className="h-4 w-4 mr-2" />
            Impact Summary
          </h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Current Weighted Value</p>
              <p className="font-semibold text-gray-800">{formatCurrency(currentWeightedValue)}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">New Weighted Value</p>
              <p className="font-semibold text-gray-800">{formatCurrency(newWeightedValue)}</p>
            </div>
          </div>

          {newWeightedValue !== currentWeightedValue && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-center">
                {newWeightedValue > currentWeightedValue ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                )}
                <span className="text-sm">
                  {newWeightedValue > currentWeightedValue ? 'Increase' : 'Decrease'} of{' '}
                  <span className="font-medium">
                    {formatCurrency(Math.abs(newWeightedValue - currentWeightedValue))}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stage Change Validation */}
        {selectedStage !== deal.stage && (
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Stage Change Confirmation</p>
              <p className="text-xs text-yellow-700 mt-1">
                {currentStage?.label} → {newStage?.label}
                {newStage?.value === 'CLOSED_LOST' && (
                  <span className="block font-medium mt-1">
                    This deal will be marked as lost and removed from the active pipeline.
                  </span>
                )}
                {newStage?.value === 'CLOSED_WON' && (
                  <span className="block font-medium mt-1">
                    This deal will be marked as won and contribute to revenue metrics.
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleMove} 
          disabled={isSubmitting || selectedStage === deal.stage}
        >
          {isSubmitting ? 'Moving...' : 'Move Stage'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}