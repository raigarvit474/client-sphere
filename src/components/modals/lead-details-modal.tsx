'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Mail, 
  Phone, 
  Building2, 
  User,
  DollarSign,
  Activity,
  Edit,
  Trash2,
  Plus,
  Target,
  Calendar
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

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
  owner: {
    id: string
    name?: string
    email: string
  }
  contact?: {
    id: string
    firstName: string
    lastName: string
  }
  deal?: {
    id: string
    title: string
    value: number
    stage: string
  }
  activities?: Array<{
    id: string
    title: string
    type: string
    dueDate?: string
    isCompleted: boolean
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
}

interface LeadDetailsModalProps {
  lead: Lead
  isOpen: boolean
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
  onConvert?: () => void
}

const statusColors = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-green-100 text-green-800',
  PROPOSAL: 'bg-purple-100 text-purple-800',
  NEGOTIATION: 'bg-orange-100 text-orange-800',
  CLOSED_WON: 'bg-green-100 text-green-800',
  CLOSED_LOST: 'bg-red-100 text-red-800',
}

export function LeadDetailsModal({
  lead,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onConvert
}: LeadDetailsModalProps) {

  const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{lead.title}</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Lead for {fullName || 'Unknown'} 
                {lead.company && ` at ${lead.company}`}
              </p>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {onConvert && (
                <Button variant="outline" size="sm" onClick={onConvert}>
                  <Plus className="h-4 w-4 mr-1" />
                  Convert to Deal
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" size="sm" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-1 text-red-600" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Lead Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Contact Details</h4>
                  <div className="mt-2 space-y-2">
                    {fullName && (
                      <div className="text-sm">
                        <span className="text-gray-500">Name:</span> {fullName}
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-2 text-gray-400" />
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-1">{lead.email}</span>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-2 text-gray-400" />
                        <span className="text-gray-500">Phone:</span>
                        <span className="ml-1">{lead.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Lead Details</h4>
                  <div className="mt-2 space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-500">Status:</span>
                      <Badge className={`ml-2 ${statusColors[lead.status as keyof typeof statusColors]}`}>
                        {lead.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {lead.source && (
                      <div className="text-sm">
                        <span className="text-gray-500">Source:</span>
                        <span className="ml-1">{lead.source}</span>
                      </div>
                    )}
                    {lead.value && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-3 w-3 mr-2 text-gray-400" />
                        <span className="text-gray-500">Value:</span>
                        <span className="ml-1 font-medium">{formatCurrency(Number(lead.value))}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {(lead.company || lead.position) && (
                <div>
                  <h4 className="font-medium text-gray-900">Company Information</h4>
                  <div className="mt-2 space-y-2">
                    {lead.company && (
                      <div className="flex items-center text-sm">
                        <Building2 className="h-3 w-3 mr-2 text-gray-400" />
                        <span className="text-gray-500">Company:</span>
                        <span className="ml-1">{lead.company}</span>
                      </div>
                    )}
                    {lead.position && (
                      <div className="text-sm">
                        <span className="text-gray-500">Position:</span>
                        <span className="ml-1">{lead.position}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {lead.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900">Tags</h4>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {lead.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {lead.notes && (
                <div>
                  <h4 className="font-medium text-gray-900">Notes</h4>
                  <p className="text-sm text-gray-700 mt-2">{lead.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created: {formatDate(lead.createdAt)}
                </div>
                <div>Owner: {lead.owner.name || lead.owner.email}</div>
              </div>
            </CardContent>
          </Card>

          {/* Related Records */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lead.contact ? (
                  <div>
                    <div className="font-medium">{lead.contact.firstName} {lead.contact.lastName}</div>
                    <div className="text-xs text-gray-500">Associated contact</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No associated contact</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Deal
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lead.deal ? (
                  <div>
                    <div className="font-medium">{lead.deal.title}</div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(Number(lead.deal.value))} • {lead.deal.stage.replace('_', ' ')}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Not converted to deal</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lead.activities?.length || 0}</div>
                <div className="text-xs text-gray-500">Total activities</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          {lead.activities && lead.activities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lead.activities.slice(0, 5).map(activity => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${activity.isCompleted ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <div>
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-gray-500">
                            Type: <Badge variant="outline">{activity.type.replace('_', ' ')}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.dueDate && (
                          <div className="text-sm text-gray-600">Due: {formatDate(activity.dueDate)}</div>
                        )}
                        <div className="text-xs text-gray-500">{formatDate(activity.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}