'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Search, Filter, MoreHorizontal, Users, UserCheck, Shield, Eye, EyeOff, Mail, Calendar } from 'lucide-react'
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
import { AddUserForm } from '@/components/forms/add-user-form'

interface User {
  id: string
  name?: string
  email: string
  role: string
  isActive: boolean
  emailVerified?: string
  image?: string
  createdAt: string
  updatedAt: string
  _count?: {
    ownedContacts: number
    ownedLeads: number
    ownedDeals: number
    activities: number
  }
}

interface UserStats {
  total: number
  active: number
  inactive: number
  admins: number
  managers: number
  reps: number
}

const roleColors = {
  ADMIN: 'bg-red-100 text-red-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  REP: 'bg-green-100 text-green-800',
  READ_ONLY: 'bg-gray-100 text-gray-800',
}


export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    managers: 0,
    reps: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const currentUser = session?.user
  const isAdmin = currentUser?.role === 'ADMIN'
  const isManager = currentUser?.role === 'MANAGER' || isAdmin

  // Mock data for now
  useEffect(() => {
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@crm.com',
          role: 'ADMIN',
          isActive: true,
          emailVerified: '2024-01-01T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-30T10:00:00Z',
          _count: {
            ownedContacts: 5,
            ownedLeads: 3,
            ownedDeals: 2,
            activities: 12
          }
        },
        {
          id: '2',
          name: 'Sales Manager',
          email: 'manager@crm.com',
          role: 'MANAGER',
          isActive: true,
          emailVerified: '2024-01-02T00:00:00Z',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-29T15:30:00Z',
          _count: {
            ownedContacts: 15,
            ownedLeads: 8,
            ownedDeals: 6,
            activities: 25
          }
        },
        {
          id: '3',
          name: 'Sales Rep One',
          email: 'rep1@crm.com',
          role: 'REP',
          isActive: true,
          emailVerified: '2024-01-03T00:00:00Z',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-30T09:15:00Z',
          _count: {
            ownedContacts: 25,
            ownedLeads: 12,
            ownedDeals: 8,
            activities: 35
          }
        },
        {
          id: '4',
          name: 'Sales Rep Two',
          email: 'rep2@crm.com',
          role: 'REP',
          isActive: true,
          emailVerified: '2024-01-04T00:00:00Z',
          createdAt: '2024-01-04T00:00:00Z',
          updatedAt: '2024-01-28T14:20:00Z',
          _count: {
            ownedContacts: 18,
            ownedLeads: 7,
            ownedDeals: 4,
            activities: 22
          }
        },
        {
          id: '5',
          name: 'Read Only User',
          email: 'readonly@crm.com',
          role: 'READ_ONLY',
          isActive: true,
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-25T11:45:00Z',
          _count: {
            ownedContacts: 0,
            ownedLeads: 0,
            ownedDeals: 0,
            activities: 5
          }
        },
        {
          id: '6',
          name: 'Inactive User',
          email: 'inactive@crm.com',
          role: 'REP',
          isActive: false,
          emailVerified: '2024-01-06T00:00:00Z',
          createdAt: '2024-01-06T00:00:00Z',
          updatedAt: '2024-01-20T16:00:00Z',
          _count: {
            ownedContacts: 3,
            ownedLeads: 1,
            ownedDeals: 0,
            activities: 8
          }
        }
      ]

      setUsers(mockUsers)

      // Calculate stats
      const active = mockUsers.filter(user => user.isActive).length
      const inactive = mockUsers.filter(user => !user.isActive).length
      const admins = mockUsers.filter(user => user.role === 'ADMIN').length
      const managers = mockUsers.filter(user => user.role === 'MANAGER').length
      const reps = mockUsers.filter(user => user.role === 'REP').length

      setStats({
        total: mockUsers.length,
        active,
        inactive,
        admins,
        managers,
        reps
      })

      setLoading(false)
    }, 1000)
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    let matchesStatus = true
    if (statusFilter === 'active') {
      matchesStatus = user.isActive
    } else if (statusFilter === 'inactive') {
      matchesStatus = !user.isActive
    }

    return matchesSearch && matchesRole && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const canManageUser = (targetUser: User) => {
    if (!currentUser) return false
    if (currentUser.role === 'ADMIN') return true
    if (currentUser.role === 'MANAGER' && targetUser.role !== 'ADMIN') return true
    return false
  }

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return { ...user, isActive: !user.isActive }
      }
      return user
    }))
  }

  const changeUserRole = (userId: string, newRole: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return { ...user, role: newRole }
      }
      return user
    }))
  }

  const handleCreateUser = async (data: Record<string, any>) => {
    // Simulate API call
    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: data.isActive || true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: {
        ownedContacts: 0,
        ownedLeads: 0,
        ownedDeals: 0,
        activities: 0
      }
    }

    setUsers(prev => [newUser, ...prev])
    
    // Update stats
    setStats(prev => ({
      total: prev.total + 1,
      active: prev.active + (data.isActive ? 1 : 0),
      inactive: prev.inactive + (data.isActive ? 0 : 1),
      admins: prev.admins + (data.role === 'ADMIN' ? 1 : 0),
      managers: prev.managers + (data.role === 'MANAGER' ? 1 : 0),
      reps: prev.reps + (data.role === 'REP' ? 1 : 0)
    }))

    console.log('User created:', newUser)
  }

  if (!isManager) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to access user management.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading users...</div>
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
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage system users, roles, and permissions</p>
          </div>
          
          {isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
              <AddUserForm
                onSubmit={handleCreateUser}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </Dialog>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All system users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">
                Disabled users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
              <p className="text-xs text-muted-foreground">
                System admins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Managers</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.managers}</div>
              <p className="text-xs text-muted-foreground">
                Team managers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Reps</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reps}</div>
              <p className="text-xs text-muted-foreground">
                Sales representatives
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="REP">Sales Rep</SelectItem>
                  <SelectItem value="READ_ONLY">Read Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {user.image ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={user.image}
                                  alt={user.name || user.email}
                                />
                              ) : (
                                <span className="text-sm font-medium text-gray-500">
                                  {(user.name || user.email).substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'No Name'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.emailVerified && (
                              <div className="flex items-center mt-1">
                                <Mail className="h-3 w-3 text-green-500 mr-1" />
                                <span className="text-xs text-green-600">Verified</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${roleColors[user.role as keyof typeof roleColors]}`}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-2 h-2 rounded-full mr-2 ${
                            user.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className={`text-sm ${
                            user.isActive ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Contacts: {user._count?.ownedContacts || 0}</div>
                          <div>Leads: {user._count?.ownedLeads || 0}</div>
                          <div>Deals: {user._count?.ownedDeals || 0}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {canManageUser(user) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Edit User</DropdownMenuItem>
                              
                              {user.role !== 'ADMIN' && isAdmin && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => changeUserRole(user.id, 'MANAGER')}>
                                    Make Manager
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => changeUserRole(user.id, 'REP')}>
                                    Make Sales Rep
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => changeUserRole(user.id, 'READ_ONLY')}>
                                    Make Read Only
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => toggleUserStatus(user.id)}
                                className={user.isActive ? 'text-red-600' : 'text-green-600'}
                              >
                                {user.isActive ? 'Deactivate User' : 'Activate User'}
                              </DropdownMenuItem>
                              
                              {user.id !== currentUser?.id && (
                                <DropdownMenuItem className="text-red-600">
                                  Delete User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Get started by adding your first user.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}