'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Search, Filter, MoreHorizontal, Handshake, DollarSign, TrendingUp, Calendar, Users } from 'lucide-react'
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
import { AddDealForm } from '@/components/forms/add-deal-form'

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

interface DealStats {
  total: number
  totalValue: number
  averageValue: number
  closedWon: number
  winRate: number
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

const pipelineStages = [
  'PROSPECTING',
  'QUALIFICATION', 
  'NEEDS_ANALYSIS',
  'VALUE_PROPOSITION',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST'
]

export default function DealsPage() {
  const { data: session } = useSession()
  const [deals, setDeals] = useState<Deal[]>([])
  const [stats, setStats] = useState<DealStats>({
    total: 0,
    totalValue: 0,
    averageValue: 0,
    closedWon: 0,
    winRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Mock data for now
  useEffect(() => {
    setTimeout(() => {
      const mockDeals: Deal[] = [
        {
          id: '1',
          title: 'Enterprise CRM Implementation',
          value: 150000,
          stage: 'PROPOSAL',
          probability: 75,
          expectedCloseDate: '2024-02-15',
          source: 'Inbound',
          notes: 'Large enterprise deal with multiple stakeholders',
          tags: ['enterprise', 'crm'],
          contact: {
            id: '1',
            firstName: 'John',
            lastName: 'Smith',
            company: 'TechCorp Inc'
          },
          owner: {
            id: '1',
            name: 'Sales Rep',
            email: 'rep@crm.com'
          },
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-25T15:30:00Z'
        },
        {
          id: '2',
          title: 'Marketing Automation Suite',
          value: 75000,
          stage: 'NEGOTIATION',
          probability: 85,
          expectedCloseDate: '2024-02-05',
          source: 'Referral',
          notes: 'Ready to close, just finalizing terms',
          tags: ['marketing', 'automation'],
          contact: {
            id: '2',
            firstName: 'Sarah',
            lastName: 'Johnson',
            company: 'Marketing Pro'
          },
          owner: {
            id: '2',
            name: 'Sales Manager',
            email: 'manager@crm.com'
          },
          createdAt: '2024-01-05T14:20:00Z',
          updatedAt: '2024-01-28T09:45:00Z'
        },
        {
          id: '3',
          title: 'Cloud Infrastructure Migration',
          value: 200000,
          stage: 'QUALIFICATION',
          probability: 40,
          expectedCloseDate: '2024-03-20',
          source: 'Cold Outreach',
          notes: 'Early stage, needs technical validation',
          tags: ['cloud', 'infrastructure'],
          contact: {
            id: '3',
            firstName: 'Mike',
            lastName: 'Wilson',
            company: 'CloudTech Solutions'
          },
          owner: {
            id: '1',
            name: 'Sales Rep',
            email: 'rep@crm.com'
          },
          createdAt: '2024-01-20T11:15:00Z',
          updatedAt: '2024-01-29T16:00:00Z'
        },
        {
          id: '4',
          title: 'Small Business Package',
          value: 25000,
          stage: 'CLOSED_WON',
          probability: 100,
          expectedCloseDate: '2024-01-30',
          actualCloseDate: '2024-01-28',
          source: 'Website',
          notes: 'Closed successfully, smooth process',
          tags: ['small-business', 'package'],
          contact: {
            id: '4',
            firstName: 'Lisa',
            lastName: 'Davis',
            company: 'Small Biz Co'
          },
          owner: {
            id: '1',
            name: 'Sales Rep',
            email: 'rep@crm.com'
          },
          createdAt: '2024-01-15T13:30:00Z',
          updatedAt: '2024-01-28T17:20:00Z'
        },
        {
          id: '5',
          title: 'Analytics Platform',
          value: 50000,
          stage: 'PROSPECTING',
          probability: 20,
          expectedCloseDate: '2024-04-15',
          source: 'Trade Show',
          notes: 'Early prospect, needs more qualification',
          tags: ['analytics', 'platform'],
          contact: {
            id: '5',
            firstName: 'David',
            lastName: 'Brown',
            company: 'Data Analytics Inc'
          },
          owner: {
            id: '2',
            name: 'Sales Manager',
            email: 'manager@crm.com'
          },
          createdAt: '2024-01-25T08:45:00Z',
          updatedAt: '2024-01-30T10:15:00Z'
        }
      ]

      setDeals(mockDeals)

      // Calculate stats
      const totalValue = mockDeals.reduce((sum, deal) => sum + deal.value, 0)
      const closedWonDeals = mockDeals.filter(deal => deal.stage === 'CLOSED_WON')
      const totalClosedDeals = mockDeals.filter(deal => 
        deal.stage === 'CLOSED_WON' || deal.stage === 'CLOSED_LOST'
      ).length

      setStats({
        total: mockDeals.length,
        totalValue,
        averageValue: totalValue / mockDeals.length,
        closedWon: closedWonDeals.length,
        winRate: totalClosedDeals > 0 ? (closedWonDeals.length / totalClosedDeals) * 100 : 0
      })

      setLoading(false)
    }, 1000)
  }, [])

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = !searchTerm || 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contact?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${deal.contact?.firstName} ${deal.contact?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter

    return matchesSearch && matchesStage
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getDealsByStage = (stage: string) => {
    return filteredDeals.filter(deal => deal.stage === stage)
  }

  const handleCreateDeal = async (data: Record<string, any>) => {
    // Simulate API call
    const newDeal: Deal = {
      id: Date.now().toString(),
      title: data.title,
      value: data.value,
      stage: data.stage || 'PROSPECTING',
      probability: data.probability || 10,
      expectedCloseDate: data.expectedCloseDate || undefined,
      source: data.source || undefined,
      notes: data.notes || undefined,
      tags: [],
      owner: {
        id: session?.user?.id || '1',
        name: session?.user?.name || 'Current User',
        email: session?.user?.email || 'user@crm.com'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setDeals(prev => [newDeal, ...prev])
    
    // Update stats
    setStats(prev => {
      const newTotalValue = prev.totalValue + data.value
      const newTotal = prev.total + 1
      return {
        total: newTotal,
        totalValue: newTotalValue,
        averageValue: newTotalValue / newTotal,
        closedWon: prev.closedWon,
        winRate: prev.winRate
      }
    })

    console.log('Deal created:', newDeal)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading deals...</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
            <p className="text-gray-600">Manage your sales pipeline and track opportunities</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'pipeline' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('pipeline')}
              >
                Pipeline
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Deal
              </Button>
              <AddDealForm
                onSubmit={handleCreateDeal}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Active opportunities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Total potential revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Deal</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.averageValue)}</div>
              <p className="text-xs text-muted-foreground">
                Average deal size
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed Won</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.closedWon}</div>
              <p className="text-xs text-muted-foreground">
                Successfully closed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Success rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search deals by title, company, or contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {pipelineStages.map(stage => (
                    <SelectItem key={stage} value={stage}>
                      {stage.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {viewMode === 'pipeline' ? (
          // Pipeline View
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-x-auto min-h-[600px]">
            {pipelineStages.map(stage => {
              const stageDeals = getDealsByStage(stage)
              const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)
              
              return (
                <div key={stage} className="bg-gray-50 rounded-lg p-4 min-w-[300px]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {stage.replace('_', ' ')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {stageDeals.length} deals • {formatCurrency(stageValue)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {stageDeals.map(deal => (
                      <Card key={deal.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                              {deal.title}
                            </h4>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Deal</DropdownMenuItem>
                                <DropdownMenuItem>Move Stage</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Delete Deal
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="text-lg font-bold text-green-600 mb-1">
                            {formatCurrency(deal.value)}
                          </div>
                          
                          <div className="text-xs text-gray-500 mb-2">
                            {deal.contact?.firstName} {deal.contact?.lastName}
                            {deal.contact?.company && (
                              <span className="block">{deal.contact.company}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-400">
                              {deal.probability}% probability
                            </div>
                            {deal.expectedCloseDate && (
                              <div className="text-xs text-gray-400">
                                {formatDate(deal.expectedCloseDate)}
                              </div>
                            )}
                          </div>
                          
                          {deal.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {deal.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    
                    {stageDeals.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No deals in this stage</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // Table View
          <Card>
            <CardHeader>
              <CardTitle>All Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expected Close
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDeals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                          <div className="text-xs text-gray-500">{deal.probability}% probability</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-600">
                            {formatCurrency(deal.value)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${stageColors[deal.stage as keyof typeof stageColors]}`}>
                            {deal.stage.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {deal.contact?.firstName} {deal.contact?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{deal.contact?.company}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{deal.owner.name}</div>
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
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Deal</DropdownMenuItem>
                              <DropdownMenuItem>Move Stage</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                Delete Deal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredDeals.length === 0 && (
                  <div className="text-center py-12">
                    <Handshake className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No deals found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || stageFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria.' 
                        : 'Get started by creating your first deal.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}