'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Search, Filter, MoreHorizontal, Users, UserCheck, Shield, Eye, EyeOff, Mail, Calendar, UserCog, Trash, UserX } from 'lucide-react'
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
import { EditUserForm } from '@/components/forms/edit-user-form'
import { ViewUserDialog } from '@/components/dialogs/view-user-dialog'
import { ChangeRoleDialog } from '@/components/dialogs/change-role-dialog'
import { DeleteUserDialog } from '@/components/dialogs/delete-user-dialog'
import { toast } from '@/components/ui/use-toast'

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
  
  // Dialog states for user actions
  const [viewUser, setViewUser] = useState<User | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [changeRoleUser, setChangeRoleUser] = useState<User | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentUser = session?.user
  const isAdmin = currentUser?.role === 'ADMIN'
  const isManager = currentUser?.role === 'MANAGER' || isAdmin

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('Fetching users...')
      const response = await fetch('/api/users')
      console.log('Users response status:', response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Users API Error:', errorText)
        throw new Error('Failed to fetch users')
      }
      const response_data = await response.json()
      console.log('Received users API response:', response_data)
      
      // The API returns { success: true, data: { users: [...], pagination: {...} } }
      const data = response_data.data || response_data
      console.log('Extracted users data:', data)
      
      setUsers(data.users || [])
      
      // Calculate stats
      const users = data.users || []
      const active = users.filter((user: User) => user.isActive).length
      const inactive = users.filter((user: User) => !user.isActive).length
      const admins = users.filter((user: User) => user.role === 'ADMIN').length
      const managers = users.filter((user: User) => user.role === 'MANAGER').length
      const reps = users.filter((user: User) => user.role === 'REP').length
      
      setStats({
        total: users.length,
        active,
        inactive,
        admins,
        managers,
        reps
      })
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isManager) {
      fetchUsers()
    }
  }, [isManager])

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

  const toggleUserStatus = async (userId: string) => {
    try {
      const userToUpdate = users.find(u => u.id === userId)
      if (!userToUpdate) return
      
      setIsSubmitting(true)
      const newStatus = !userToUpdate.isActive

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          isActive: newStatus
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Update status error:', errorText)
        throw new Error('Failed to update user status')
      }

      // Update users in state
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          return { ...user, isActive: newStatus }
        }
        return user
      }))
      
      toast({
        title: newStatus ? 'User Activated' : 'User Deactivated',
        description: `${userToUpdate.name || userToUpdate.email} has been ${newStatus ? 'activated' : 'deactivated'}.`,
        variant: newStatus ? 'default' : 'destructive',
      })
    } catch (error) {
      console.error('Error updating user status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update user status.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangeRole = async (data: { role: string }) => {
    if (!changeRoleUser) return
    
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/users/${changeRoleUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateRole',
          role: data.role
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Update role error:', errorText)
        throw new Error('Failed to update user role')
      }

      // Update users in state
      setUsers(prev => prev.map(user => {
        if (user.id === changeRoleUser.id) {
          return { ...user, role: data.role }
        }
        return user
      }))
      
      toast({
        title: 'Role Updated',
        description: `${changeRoleUser.name || changeRoleUser.email}'s role has been updated to ${data.role.replace('_', ' ')}.`,
      })
      
      // Refresh stats
      await fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        title: 'Error',
        description: 'Failed to update user role.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
      setChangeRoleUser(null)
    }
  }

  const handleCreateUser = async (data: Record<string, any>) => {
    try {
      setIsSubmitting(true)
      console.log('Creating user with data:', data)
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          isActive: data.isActive !== false // Default to true if not specified
        })
      })
      console.log('Create user response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Create user error:', errorText)
        throw new Error('Failed to create user')
      }

      const newUser = await response.json()
      console.log('User created successfully:', newUser)
      
      // Refresh the users list
      await fetchUsers()
      setIsCreateDialogOpen(false)
      
      toast({
        title: 'User Created',
        description: `${data.name || data.email} has been successfully created.`,
      })
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: 'Error',
        description: 'Failed to create user. Please try again.',
        variant: 'destructive',
      })
      throw error // Let the form handle the error
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleEditUser = async (data: Record<string, any>) => {
    if (!editUser) return
    
    try {
      setIsSubmitting(true)
      console.log('Updating user with data:', data)
      const response = await fetch(`/api/users/${editUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role,
          isActive: data.isActive,
          password: data.password || undefined // Only include if provided
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Update user error:', errorText)
        throw new Error('Failed to update user')
      }
      
      // Refresh the users list
      await fetchUsers()
      setEditUser(null)
      
      toast({
        title: 'User Updated',
        description: `${data.name || data.email}'s profile has been updated.`,
      })
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: 'Error',
        description: 'Failed to update user. Please try again.',
        variant: 'destructive',
      })
      throw error // Let the form handle the error
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteUser = async (data: { transferUserId?: string }) => {
    if (!deleteUser) return
    
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/users/${deleteUser.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transferUserId: data.transferUserId === 'NONE' ? undefined : data.transferUserId
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Delete user error:', errorText)
        throw new Error('Failed to delete user')
      }
      
      // Refresh the users list
      await fetchUsers()
      setDeleteUser(null)
      
      toast({
        title: 'User Deleted',
        description: `${deleteUser.name || deleteUser.email} has been permanently deleted.`,
        variant: 'destructive',
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
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
                isSubmitting={isSubmitting}
              />
            </Dialog>
          )}
          
          {/* View User Dialog */}
          <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
            {viewUser && (
              <ViewUserDialog 
                user={viewUser} 
                onClose={() => setViewUser(null)} 
              />
            )}
          </Dialog>
          
          {/* Edit User Dialog */}
          <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
            {editUser && (
              <EditUserForm
                user={editUser}
                currentUserRole={currentUser?.role || ''}
                currentUserId={currentUser?.id || ''}
                onSubmit={handleEditUser}
                onCancel={() => setEditUser(null)}
                isSubmitting={isSubmitting}
              />
            )}
          </Dialog>
          
          {/* Change Role Dialog */}
          <Dialog open={!!changeRoleUser} onOpenChange={(open) => !open && setChangeRoleUser(null)}>
            {changeRoleUser && (
              <ChangeRoleDialog
                user={changeRoleUser}
                currentUserRole={currentUser?.role || ''}
                onSave={handleChangeRole}
                onClose={() => setChangeRoleUser(null)}
              />
            )}
          </Dialog>
          
          {/* Delete User Dialog */}
          <Dialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
            {deleteUser && (
              <DeleteUserDialog
                user={deleteUser}
                currentUserRole={currentUser?.role || ''}
                availableUsers={users.filter(u => u.id !== deleteUser.id && u.isActive)}
                onDelete={handleDeleteUser}
                onClose={() => setDeleteUser(null)}
              />
            )}
          </Dialog>
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
                              <DropdownMenuItem onClick={() => setViewUser(user)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditUser(user)}>
                                <UserCog className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              
                              {((user.role !== 'ADMIN' && isAdmin) || 
                                (user.role !== 'ADMIN' && user.role !== 'MANAGER' && currentUser?.role === 'MANAGER')) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setChangeRoleUser(user)}>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Change Role
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => toggleUserStatus(user.id)}
                                disabled={isSubmitting}
                                className={user.isActive ? 'text-red-600' : 'text-green-600'}
                              >
                                {user.isActive ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Deactivate User
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Activate User
                                  </>
                                )}
                              </DropdownMenuItem>
                              
                              {user.id !== currentUser?.id && (
                                <DropdownMenuItem 
                                  onClick={() => setDeleteUser(user)}
                                  className="text-red-600"
                                >
                                  <UserX className="h-4 w-4 mr-2" />
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