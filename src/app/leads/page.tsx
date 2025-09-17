'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Search, Filter, MoreHorizontal, Target, DollarSign, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog } from '@/components/ui/dialog'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AddLeadForm } from '@/components/forms/add-lead-form'
import { EditLeadForm } from '@/components/forms/edit-lead-form'
import { ConvertLeadToDealForm } from '@/components/forms/convert-lead-to-deal-form'
import { LeadDetailsModal } from '@/components/modals/lead-details-modal'
import { DeleteLeadDialog } from '@/components/modals/delete-lead-dialog'

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
  createdAt: string
  updatedAt: string
}

interface LeadStats {
  total: number
  new: number
  qualified: number
  contacted: number
  totalValue: number
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

export default function LeadsPage() {
  const { data: session } = useSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    new: 0,
    qualified: 0,
    contacted: 0,
    totalValue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isConvertToDealDialogOpen, setIsConvertToDealDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      setLoading(true)
      console.log('Fetching leads...')
      const response = await fetch('/api/leads')
      console.log('Leads response status:', response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Leads API Error:', errorText)
        throw new Error('Failed to fetch leads')
      }
      const response_data = await response.json()
      console.log('Received leads API response:', response_data)
      
      // The API returns { success: true, data: { leads: [...], pagination: {...} } }
      const data = response_data.data || response_data
      console.log('Extracted leads data:', data)
      console.log('Raw leads from API:', data.leads)
      
      setLeads(data.leads || [])
      
      // Calculate stats
      const leads = data.leads || []
      console.log('Leads for stats calculation:', leads.map((l: any) => ({ id: l.id, title: l.title, value: l.value, type: typeof l.value })))
      
      const newLeads = leads.filter((lead: Lead) => lead.status === 'NEW').length
      const qualified = leads.filter((lead: Lead) => lead.status === 'QUALIFIED').length
      const contacted = leads.filter((lead: Lead) => lead.status === 'CONTACTED').length
      
      // Convert Decimal values to numbers for calculation
      const totalValue = leads.reduce((sum: number, lead: any) => {
        const value = typeof lead.value === 'string' ? parseFloat(lead.value) : (lead.value || 0)
        return sum + value
      }, 0)
      
      console.log('Leads stats calculated:', {
        totalLeads: leads.length,
        newLeads,
        qualified,
        contacted,
        totalValue
      })
      
      setStats({
        total: leads.length,
        new: newLeads,
        qualified,
        contacted,
        totalValue
      })
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleCreateLead = async (data: Record<string, any>) => {
    try {
      console.log('Creating lead with data:', data)
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || undefined,
          phone: data.phone || undefined,
          company: data.company || undefined,
          position: data.position || undefined,
          source: data.source || undefined,
          status: data.status || 'NEW',
          // Remove invalid fields that don't exist in schema
          // score: data.score || undefined,
          estimatedValue: data.estimatedValue || undefined,
          // expectedCloseDate: data.expectedCloseDate || undefined,
          notes: data.notes || undefined,
          tags: data.tags || []
        })
      })
      console.log('Create lead response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Create lead error:', errorText)
        throw new Error('Failed to create lead')
      }

      const newLead = await response.json()
      console.log('Lead created successfully:', newLead)
      
      // Refresh the leads list
      console.log('Refreshing leads list...')
      await fetchLeads()
    } catch (error) {
      console.error('Error creating lead:', error)
      throw error // Let the form handle the error
    }
  }

  const handleEditLead = async (data: any) => {
    if (!selectedLead) return
    try {
      console.log('Updating lead with data:', data)
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || undefined,
          phone: data.phone || undefined,
          company: data.company || undefined,
          position: data.position || undefined,
          source: data.source || undefined,
          status: data.status || 'NEW',
          estimatedValue: data.estimatedValue || undefined,
          notes: data.notes || undefined,
          tags: data.tags || []
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Update lead error:', errorText)
        throw new Error('Failed to update lead')
      }

      console.log('Lead updated successfully')
      await fetchLeads()
      setIsEditDialogOpen(false)
      setSelectedLead(null)
    } catch (error) {
      console.error('Error updating lead:', error)
      throw error
    }
  }

  const handleDeleteLead = async (leadId: string) => {
    try {
      console.log('Deleting lead:', leadId)
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Delete lead error:', errorText)
        throw new Error('Failed to delete lead')
      }

      console.log('Lead deleted successfully')
      await fetchLeads()
      setIsDeleteDialogOpen(false)
      setSelectedLead(null)
      setSelectedLeadId(null)
    } catch (error) {
      console.error('Error deleting lead:', error)
      throw error
    }
  }

  const handleConvertToDeal = async (data: any) => {
    try {
      console.log('Converting lead to deal with data:', data)
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          value: data.value,
          stage: data.stage || 'PROSPECTING',
          probability: data.probability || 0,
          expectedCloseDate: data.expectedCloseDate || undefined,
          source: data.source || undefined,
          notes: data.notes || undefined,
          tags: data.tags || [],
          leadId: data.leadId,
          contactId: data.contactId
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Convert to deal error:', errorText)
        throw new Error('Failed to convert lead to deal')
      }

      console.log('Lead converted to deal successfully')
      await fetchLeads()
      setIsConvertToDealDialogOpen(false)
      setSelectedLead(null)
    } catch (error) {
      console.error('Error converting lead to deal:', error)
      throw error
    }
  }

  const openDetailsModal = (lead: Lead) => {
    setSelectedLead(lead)
    setIsDetailsModalOpen(true)
  }

  const openEditDialog = (lead: Lead) => {
    setSelectedLead(lead)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (lead: Lead) => {
    setSelectedLead(lead)
    setSelectedLeadId(lead.id)
    setIsDeleteDialogOpen(true)
  }

  const openConvertToDealDialog = (lead: Lead) => {
    setSelectedLead(lead)
    setIsConvertToDealDialogOpen(true)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading leads...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-600">Manage and track your sales prospects</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </Button>
            <AddLeadForm
              onSubmit={handleCreateLead}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Active prospects in pipeline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.new}</div>
              <p className="text-xs text-muted-foreground">
                Leads awaiting contact
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.qualified}</div>
              <p className="text-xs text-muted-foreground">
                Ready for next steps
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Potential revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search leads by name, company, or title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="CONTACTED">Contacted</SelectItem>
                  <SelectItem value="QUALIFIED">Qualified</SelectItem>
                  <SelectItem value="PROPOSAL">Proposal</SelectItem>
                  <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                  <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
                  <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leads Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {lead.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lead.firstName} {lead.lastName}
                            </div>
                            <div className="text-xs text-gray-400">
                              {lead.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.company}</div>
                        <div className="text-xs text-gray-500">{lead.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${statusColors[lead.status as keyof typeof statusColors]}`}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.value ? formatCurrency(lead.value) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.owner.name}</div>
                        <div className="text-xs text-gray-500">{lead.owner.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openDetailsModal(lead)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(lead)}>
                              Edit Lead
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openConvertToDealDialog(lead)}>
                              Convert to Deal
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => openDeleteDialog(lead)}
                            >
                              Delete Lead
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredLeads.length === 0 && (
                <div className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Get started by creating your first lead.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Details Modal */}
      {isDetailsModalOpen && selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedLead(null)
          }}
          onEdit={() => {
            setIsDetailsModalOpen(false)
            openEditDialog(selectedLead)
          }}
          onConvert={() => {
            setIsDetailsModalOpen(false)
            openConvertToDealDialog(selectedLead)
          }}
          onDelete={() => {
            setIsDetailsModalOpen(false)
            openDeleteDialog(selectedLead)
          }}
        />
      )}

      {/* Edit Lead Dialog */}
      {isEditDialogOpen && selectedLead && (
        <EditLeadForm
          lead={selectedLead}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedLead(null)
          }}
          onSave={handleEditLead}
        />
      )}

      {/* Convert Lead to Deal Dialog */}
      {isConvertToDealDialogOpen && selectedLead && (
        <ConvertLeadToDealForm
          lead={selectedLead}
          isOpen={isConvertToDealDialogOpen}
          onClose={() => {
            setIsConvertToDealDialogOpen(false)
            setSelectedLead(null)
          }}
          onConvert={handleConvertToDeal}
        />
      )}

      {/* Delete Lead Dialog */}
      {isDeleteDialogOpen && selectedLeadId && (
        <DeleteLeadDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSelectedLead(null)
            setSelectedLeadId(null)
          }}
          onConfirm={() => handleDeleteLead(selectedLeadId)}
          leadTitle={selectedLead?.company || selectedLead?.title || 'this lead'}
        />
      )}
    </DashboardLayout>
  )
}
