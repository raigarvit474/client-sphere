import { requireAuth } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Mail, Phone, Building2, User } from 'lucide-react'
import Link from 'next/link'

// This would typically come from an API call
async function getContacts() {
  // For demo purposes, return mock data
  return [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      company: 'Tech Corp',
      position: 'CTO',
      owner: { name: 'Sales Rep 1' },
      _count: { leads: 2, deals: 1, activities: 5 }
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@startup.io',
      phone: '+1-555-0124',
      company: 'Startup Inc',
      position: 'CEO',
      owner: { name: 'Sales Rep 1' },
      _count: { leads: 1, deals: 0, activities: 3 }
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@manufacturing.com',
      phone: '+1-555-0125',
      company: 'Manufacturing Ltd',
      position: 'Operations Manager',
      owner: { name: 'Sales Rep 2' },
      _count: { leads: 1, deals: 0, activities: 2 }
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@healthcare.org',
      phone: '+1-555-0126',
      company: 'Healthcare Systems',
      position: 'IT Director',
      owner: { name: 'Sales Rep 2' },
      _count: { leads: 0, deals: 1, activities: 4 }
    }
  ]
}

export default async function ContactsPage() {
  const user = await requireAuth()
  const contacts = await getContacts()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600">
              Manage your customer and prospect contacts
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Contacts
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.length}</div>
              <p className="text-xs text-muted-foreground">
                Active contacts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                With Email
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contacts.filter(c => c.email).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Have email addresses
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                With Phone
              </CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contacts.filter(c => c.phone).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Have phone numbers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Companies
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(contacts.map(c => c.company).filter(Boolean)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique companies
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Contacts</CardTitle>
            <CardDescription>
              A list of all contacts in your CRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </div>
                      {contact.position && (
                        <div className="text-sm text-gray-500">
                          {contact.position}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {contact.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="mr-1 h-3 w-3" />
                            {contact.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.company && (
                        <div className="flex items-center">
                          <Building2 className="mr-1 h-3 w-3" />
                          {contact.company}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{contact.owner.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {contact._count.leads > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {contact._count.leads} leads
                          </Badge>
                        )}
                        {contact._count.deals > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {contact._count.deals} deals
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {contact._count.activities} activities
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/contacts/${contact.id}`}>
                            View
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/contacts/${contact.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}