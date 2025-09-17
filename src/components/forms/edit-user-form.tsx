'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Shield, User, Users, Eye, AlertCircle } from 'lucide-react'

const editUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MANAGER', 'REP', 'READ_ONLY']).optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  isActive: z.boolean().optional(),
}).refine((data) => {
  if (data.password || data.confirmPassword) {
    if (!data.password || !data.confirmPassword) {
      return false
    }
    if (data.password !== data.confirmPassword) {
      return false
    }
    if (data.password.length < 6) {
      return false
    }
  }
  return true
}, {
  message: "Password must be at least 6 characters and passwords must match",
  path: ["confirmPassword"],
})

type EditUserFormData = z.infer<typeof editUserSchema>

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
    createdActivities?: number
  }
}

interface EditUserFormProps {
  user: User
  currentUserRole: string
  currentUserId: string
  onSubmit: (data: EditUserFormData) => Promise<void> | void
  onCancel: () => void
  isSubmitting?: boolean
}

const roles = [
  {
    value: 'ADMIN',
    label: 'Admin',
    description: 'Full access to all features and settings',
    icon: Shield,
    color: 'bg-red-100 text-red-800',
    permissions: ['All permissions', 'User management', 'System settings']
  },
  {
    value: 'MANAGER',
    label: 'Manager',
    description: 'Team management and reporting access',
    icon: Users,
    color: 'bg-blue-100 text-blue-800',
    permissions: ['Team management', 'Reports & Analytics', 'Lead assignment']
  },
  {
    value: 'REP',
    label: 'Sales Rep',
    description: 'Access to leads, deals, and activities',
    icon: User,
    color: 'bg-green-100 text-green-800',
    permissions: ['Own leads & deals', 'Activities', 'Contact management']
  },
  {
    value: 'READ_ONLY',
    label: 'Read Only',
    description: 'View-only access to data',
    icon: Eye,
    color: 'bg-gray-100 text-gray-800',
    permissions: ['View contacts', 'View reports', 'No editing rights']
  }
]

export function EditUserForm({ user, currentUserRole, currentUserId, onSubmit, onCancel, isSubmitting: externalIsSubmitting }: EditUserFormProps) {
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false)
  const isSubmitting = externalIsSubmitting ?? internalIsSubmitting
  const [selectedRole, setSelectedRole] = useState<string>(user.role)

  const canEditRole = currentUserRole === 'ADMIN' && currentUserId !== user.id
  const canEditStatus = currentUserRole === 'ADMIN'
  const isEditingSelf = currentUserId === user.id

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema) as any,
    defaultValues: {
      name: user.name || '',
      email: user.email,
      role: user.role as any,
      isActive: user.isActive
    }
  })

  const isActive = watch('isActive')
  const password = watch('password')

  const onFormSubmit = async (data: EditUserFormData) => {
    if (externalIsSubmitting === undefined) {
      setInternalIsSubmitting(true)
    }
    try {
      // Remove empty password fields
      if (!data.password) {
        delete data.password
        delete data.confirmPassword
      }
      await onSubmit(data)
      if (externalIsSubmitting === undefined) {
        onCancel() // Close dialog on success only if managing internally
      }
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      if (externalIsSubmitting === undefined) {
        setInternalIsSubmitting(false)
      }
    }
  }

  const selectedRoleData = roles.find(role => role.value === selectedRole)

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit User</DialogTitle>
        <DialogDescription>
          Update user account information and permissions.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* User Info Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
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
            <div>
              <div className="font-medium">{user.name || 'No Name'}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
              <div className="text-xs text-gray-400">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="John Doe"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john.doe@company.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Password (Optional) */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Label>Change Password</Label>
            <span className="text-xs text-gray-500">(leave blank to keep current password)</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="••••••••"
                disabled={!password}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Role Selection */}
        {canEditRole && (
          <div>
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={(value) => {
              setValue('role', value as any)
              setSelectedRole(value)
            }} defaultValue={user.role}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => {
                  const Icon = role.icon
                  return (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-gray-500">{role.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Role Information */}
        {selectedRoleData && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <selectedRoleData.icon className="h-5 w-5 mr-2" />
              <span className="font-medium">{selectedRoleData.label}</span>
              <Badge variant="secondary" className={`ml-2 ${selectedRoleData.color}`}>
                {selectedRoleData.value}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{selectedRoleData.description}</p>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Permissions included:</p>
              <div className="flex flex-wrap gap-1">
                {selectedRoleData.permissions.map((permission, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        {canEditStatus && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', checked as boolean)}
                disabled={isEditingSelf}
              />
              <Label htmlFor="isActive" className="text-sm font-medium">
                Active User
              </Label>
              <p className="text-xs text-gray-500">
                User can log in and access the system
              </p>
            </div>

            {isEditingSelf && (
              <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  You cannot deactivate your own account.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Data Summary */}
        {user._count && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">User Activity Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-blue-700">Contacts: {user._count.ownedContacts}</div>
                <div className="text-blue-700">Leads: {user._count.ownedLeads}</div>
              </div>
              <div>
                <div className="text-blue-700">Deals: {user._count.ownedDeals}</div>
                <div className="text-blue-700">Activities: {user._count.activities}</div>
              </div>
            </div>
          </div>
        )}

        {/* Permission Notice */}
        {!canEditRole && !canEditStatus && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900">Limited Edit Permissions</p>
                <p className="text-amber-700 mt-1">
                  {isEditingSelf 
                    ? "You can only edit your own basic information." 
                    : "You can only edit basic user information. Contact an administrator for role or status changes."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating User...' : 'Update User'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}