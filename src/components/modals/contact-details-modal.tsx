'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Calendar,
  User,
  TrendingUp,
  DollarSign,
  Activity,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  position?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  notes?: string
  tags: string[]
  owner: {
    id: string
    name?: string
    email: string
  }
  leads?: Array<{
    id: string
    title: string
    status: string
    value?: number
    createdAt: string
  }>
  deals?: Array<{
    id: string
    title: string
    stage: string
    value: number
    createdAt: string
  }>
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

interface ContactDetailsModalProps {
  contactId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (contact: Contact) => void
  onDelete?: (contactId: string) => void
  onCreateLead?: (contact: Contact) => void
  onCreateDeal?: (contact: Contact) => void
}

export function ContactDetailsModal({
  contactId,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onCreateLead,
  onCreateDeal
}: ContactDetailsModalProps) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (contactId && open) {
      fetchContactDetails()
    }
  }, [contactId, open])

  const fetchContactDetails = async () => {
    if (!contactId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/contacts/${contactId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch contact details')
      }
      const data = await response.json()
      setContact(data.data || data)
    } catch (error) {
      console.error('Error fetching contact details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !contact) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading contact details...</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const fullName = `${contact.firstName} ${contact.lastName}`
  const fullAddress = [contact.address, contact.city, contact.state, contact.zipCode, contact.country]
    .filter(Boolean)
    .join(', ')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{fullName}</DialogTitle>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(contact)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {onCreateLead && (
                <Button variant="outline" size="sm" onClick={() => onCreateLead(contact)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Lead
                </Button>
              )}
              {onCreateDeal && (
                <Button variant="outline" size="sm" onClick={() => onCreateDeal(contact)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Deal
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" size="sm" onClick={() => onDelete(contact.id)}>
                  <Trash2 className="h-4 w-4 mr-1 text-red-600" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Personal Details</h4>
                  <div className="mt-2 space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-500">Name:</span> {fullName}
                    </div>
                    {contact.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-2 text-gray-400" />
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-1">{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-2 text-gray-400" />
                        <span className="text-gray-500">Phone:</span>
                        <span className="ml-1">{contact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Company Details</h4>
                  <div className="mt-2 space-y-2">
                    {contact.company && (
                      <div className="flex items-center text-sm">
                        <Building2 className="h-3 w-3 mr-2 text-gray-400" />
                        <span className="text-gray-500">Company:</span>
                        <span className="ml-1">{contact.company}</span>
                      </div>
                    )}
                    {contact.position && (
                      <div className="text-sm">
                        <span className="text-gray-500">Position:</span>
                        <span className="ml-1">{contact.position}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {fullAddress && (
                <div>
                  <h4 className="font-medium text-gray-900">Address</h4>
                  <div className="flex items-start text-sm mt-2">
                    <MapPin className="h-3 w-3 mr-2 mt-0.5 text-gray-400" />
                    <span>{fullAddress}</span>
                  </div>
                </div>
              )}

              {contact.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900">Tags</h4>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {contact.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {contact.notes && (
                <div>
                  <h4 className="font-medium text-gray-900">Notes</h4>
                  <p className="text-sm text-gray-700 mt-2">{contact.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created: {formatDate(contact.createdAt)}
                </div>
                <div>Owner: {contact.owner.name || contact.owner.email}</div>
              </div>
            </CardContent>
          </Card>

          {/* Related Records Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contact.leads?.length || 0}</div>
                <div className="text-xs text-gray-500">Total leads</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Deals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contact.deals?.length || 0}</div>
                <div className="text-xs text-gray-500">
                  Value: {formatCurrency(contact.deals?.reduce((sum, deal) => sum + Number(deal.value), 0) || 0)}
                </div>
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
                <div className="text-2xl font-bold">{contact.activities?.length || 0}</div>
                <div className="text-xs text-gray-500">Recent activities</div>
              </CardContent>
            </Card>
          </div>

          {/* Related Records Details */}
          <div className="space-y-6">
            {/* Leads */}
            {contact.leads && contact.leads.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contact.leads.map(lead => (
                      <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{lead.title}</div>
                          <div className="text-sm text-gray-500">
                            Status: <Badge variant="secondary">{lead.status}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          {lead.value && <div className="font-medium">{formatCurrency(Number(lead.value))}</div>}
                          <div className="text-xs text-gray-500">{formatDate(lead.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Deals */}
            {contact.deals && contact.deals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contact.deals.map(deal => (
                      <div key={deal.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{deal.title}</div>
                          <div className="text-sm text-gray-500">
                            Stage: <Badge variant="secondary">{deal.stage.replace('_', ' ')}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(Number(deal.value))}</div>
                          <div className="text-xs text-gray-500">{formatDate(deal.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activities */}
            {contact.activities && contact.activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contact.activities.slice(0, 5).map(activity => (
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
        </div>
      </DialogContent>
    </Dialog>
  )
}