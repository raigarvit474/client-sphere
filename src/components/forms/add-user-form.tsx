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
import { Shield, User, Users, Eye } from 'lucide-react'

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MANAGER', 'REP', 'READ_ONLY']),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  isActive: z.boolean().default(true),
  sendWelcomeEmail: z.boolean().default(true)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type UserFormData = z.infer<typeof userSchema>

interface AddUserFormProps {
  onSubmit: (data: UserFormData) => Promise<void> | void
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

export function AddUserForm({ onSubmit, onCancel, isSubmitting: externalIsSubmitting }: AddUserFormProps) {
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false)
  const isSubmitting = externalIsSubmitting ?? internalIsSubmitting
  const [selectedRole, setSelectedRole] = useState<string>('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: {
      isActive: true,
      sendWelcomeEmail: true
    }
  })

  const isActive = watch('isActive')
  const sendWelcomeEmail = watch('sendWelcomeEmail')

  const onFormSubmit = async (data: UserFormData) => {
    if (externalIsSubmitting === undefined) {
      setInternalIsSubmitting(true)
    }
    try {
      await onSubmit(data)
      if (externalIsSubmitting === undefined) {
        onCancel() // Close dialog on success only if managing internally
      }
    } catch (error) {
      console.error('Error creating user:', error)
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
        <DialogTitle>Add New User</DialogTitle>
        <DialogDescription>
          Create a new user account with appropriate role and permissions.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
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

        {/* Password */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="password">Password *</Label>
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
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="••••••••"
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select onValueChange={(value) => {
            setValue('role', value as any)
            setSelectedRole(value)
          }}>
            <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
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
          {errors.role && (
            <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
          )}
        </div>

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

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked as boolean)}
            />
            <Label htmlFor="isActive" className="text-sm font-medium">
              Active User
            </Label>
            <p className="text-xs text-gray-500">
              User can log in and access the system
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sendWelcomeEmail"
              checked={sendWelcomeEmail}
              onCheckedChange={(checked) => setValue('sendWelcomeEmail', checked as boolean)}
            />
            <Label htmlFor="sendWelcomeEmail" className="text-sm font-medium">
              Send Welcome Email
            </Label>
            <p className="text-xs text-gray-500">
              Send login credentials to user's email
            </p>
          </div>
        </div>

        {/* Auth Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Authentication Notice</p>
              <p className="text-blue-700 mt-1">
                Users will sign in through the configured authentication providers (OAuth, etc.). 
                The user will need to use the same email address to authenticate.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating User...' : 'Create User'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}