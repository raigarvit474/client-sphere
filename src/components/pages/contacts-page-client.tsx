'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Mail, Phone, Building2, User, MoreHorizontal, Search, Filter } from 'lucide-react'
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
import { Dialog } from '@/components/ui/dialog'
import { AddContactForm } from '@/components/forms/add-contact-form'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  position?: string
  notes?: string
  tags: string[]
  owner: {
    id: string
    name?: string
    email: string
  }
  _count?: {
    leads: number
    deals: number
    activities: number
  }
  createdAt: string
  updatedAt: string
}

interface ContactStats {
  total: number
  withEmail: number
  withPhone: number
  uniqueCompanies: number
}

export default function ContactsPageClient() {
  const { data: session } = useSession()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    withEmail: 0,
    withPhone: 0,
    uniqueCompanies: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Mock data for now
  useEffect(() => {
    setTimeout(() => {
      const mockContacts: Contact[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@techcorp.com',
          phone: '+1-555-0123',
          company: 'TechCorp Inc',
          position: 'CTO',
          notes: 'Key decision maker for enterprise solutions',
          tags: ['enterprise', 'tech'],
          owner: {
            id: '1',
            name: 'Sales Rep',
            email: 'rep@crm.com'
          },
          _count: {
            leads: 2,
            deals: 1,
            activities: 5
          },
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-20T14:45:00Z'
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Wilson',
          email: 'sarah.wilson@marketing.com',
          phone: '+1-555-0124',
          company: 'Marketing Pro',
          position: 'Marketing Director',
          notes: 'Interested in marketing automation tools',
          tags: ['marketing', 'automation'],
          owner: {
            id: '2',
            name: 'Sales Manager',
            email: 'manager@crm.com'
          },
          _count: {
            leads: 1,
            deals: 2,
            activities: 8
          },
          createdAt: '2024-01-10T09:15:00Z',
          updatedAt: '2024-01-18T11:20:00Z'
        },
        {
          id: '3',
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@cloudtech.com',
          company: 'CloudTech Solutions',
          position: 'IT Director',
          notes: 'Looking to migrate to cloud infrastructure',
          tags: ['cloud', 'infrastructure'],
          owner: {
            id: '1',
            name: 'Sales Rep',
            email: 'rep@crm.com'
          },
          _count: {
            leads: 1,
            deals: 1,
            activities: 4
          },
          createdAt: '2024-01-20T16:00:00Z',
          updatedAt: '2024-01-22T16:00:00Z'
        },
        {
          id: '4',
          firstName: 'Lisa',
          lastName: 'Davis',
          email: 'lisa.davis@smallbiz.com',
          phone: '+1-555-0125',
          company: 'Small Biz Co',
          position: 'Owner',
          notes: 'Small business owner, budget conscious',
          tags: ['small-business', 'budget'],
          owner: {
            id: '1',
            name: 'Sales Rep',
            email: 'rep@crm.com'
          },
          _count: {
            leads: 0,
            deals: 1,
            activities: 3
          },
          createdAt: '2024-01-05T13:30:00Z',
          updatedAt: '2024-01-25T17:20:00Z'
        }
      ]

      setContacts(mockContacts)

      // Calculate stats
      const withEmail = mockContacts.filter(contact => contact.email).length
      const withPhone = mockContacts.filter(contact => contact.phone).length
      const uniqueCompanies = new Set(mockContacts.map(contact => contact.company).filter(Boolean)).size

      setStats({
        total: mockContacts.length,
        withEmail,
        withPhone,
        uniqueCompanies
      })

      setLoading(false)
    }, 1000)
  }, [])

  const filteredContacts = contacts.filter(contact =>
    !searchTerm ||
    `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateContact = async (data: any) => {
    // Simulate API call
    const newContact: Contact = {
      id: Date.now().toString(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      company: data.company || undefined,
      position: data.position || undefined,
      notes: data.notes || undefined,
      tags: data.tags || [],
      owner: {
        id: session?.user?.id || '1',
        name: session?.user?.name || 'Current User',
        email: session?.user?.email || 'user@crm.com'
      },
      _count: {
        leads: 0,
        deals: 0,
        activities: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setContacts(prev => [newContact, ...prev])
    
    // Update stats
    setStats(prev => ({
      total: prev.total + 1,
      withEmail: prev.withEmail + (data.email ? 1 : 0),
      withPhone: prev.withPhone + (data.phone ? 1 : 0),
      uniqueCompanies: data.company && !contacts.find(c => c.company === data.company) 
        ? prev.uniqueCompanies + 1 
        : prev.uniqueCompanies
    }))

    console.log('Contact created:', newContact)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading contacts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">Manage your customer and prospect contacts</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
          <AddContactForm
            onSubmit={handleCreateContact}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Active contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withEmail}</div>
            <p className="text-xs text-muted-foreground">
              Have email addresses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Phone</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withPhone}</div>
            <p className="text-xs text-muted-foreground">
              Have phone numbers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueCompanies}</div>
            <p className="text-xs text-muted-foreground">
              Unique companies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search contacts by name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
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
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </div>
                          {contact.position && (
                            <div className="text-sm text-gray-500">{contact.position}</div>
                          )}
                          {contact.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {contact.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.company || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {contact.email && (
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="h-3 w-3 mr-1" />
                            {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-3 w-3 mr-1" />
                            {contact.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.owner.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {contact._count ? (
                          <>
                            <div>Leads: {contact._count.leads}</div>
                            <div>Deals: {contact._count.deals}</div>
                            <div className="text-gray-500">Activities: {contact._count.activities}</div>
                          </>
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contact.createdAt)}
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
                          <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                          <DropdownMenuItem>Create Lead</DropdownMenuItem>
                          <DropdownMenuItem>Create Deal</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Delete Contact
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredContacts.length === 0 && (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search criteria.' 
                    : 'Get started by creating your first contact.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}