'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { AlertTriangle, Shield, Users, User, Eye, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const formSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'REP', 'READ_ONLY'], {
    message: 'Please select a role',
  }),
})

type FormData = z.infer<typeof formSchema>

interface User {
  id: string
  name?: string
  email: string
  role: string
  isActive: boolean
}

interface ChangeRoleDialogProps {
  user: User
  currentUserRole: string
  onSave: (data: FormData) => Promise<void>
  onClose: () => void
}

const roleConfig = {
  ADMIN: {
    label: 'Administrator',
    icon: Shield,
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Full access to all features and settings',
    permissions: [
      'All system permissions',
      'User management',
      'System settings',
      'Data export and backup',
      'Full reporting access'
    ],
    warnings: [
      'Can manage all users and system settings',
      'Has access to sensitive business data',
      'Can delete users and critical data'
    ]
  },
  MANAGER: {
    label: 'Manager',
    icon: Users,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Team management and reporting access',
    permissions: [
      'Team management',
      'Reports & Analytics',
      'Lead assignment',
      'View all team data',
      'Performance tracking'
    ],
    warnings: [
      'Can view and manage team performance',
      'Has access to team member data',
      'Can reassign leads and deals'
    ]
  },
  REP: {
    label: 'Sales Representative',
    icon: User,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Access to leads, deals, and activities',
    permissions: [
      'Own leads & deals',
      'Activities management',
      'Contact management',
      'Basic reporting',
      'Pipeline tracking'
    ],
    warnings: [
      'Can only manage own assignments',
      'Limited reporting access',
      'Cannot manage other users'
    ]
  },
  READ_ONLY: {
    label: 'Read Only',
    icon: Eye,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'View-only access to data',
    permissions: [
      'View contacts and leads',
      'View basic reports',
      'No editing rights',
      'Limited system access'
    ],
    warnings: [
      'Cannot create or edit any data',
      'Very limited system access',
      'Mainly for viewing and reporting'
    ]
  }
}

export function ChangeRoleDialog({
  user,
  currentUserRole,
  onSave,
  onClose,
}: ChangeRoleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>(user.role)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: user.role as FormData['role'],
    },
  })

  const selectedRoleConfig = roleConfig[selectedRole as keyof typeof roleConfig]
  const currentRoleConfig = roleConfig[user.role as keyof typeof roleConfig]
  
  // Check if current user can assign the selected role
  const canAssignRole = (role: string) => {
    if (currentUserRole === 'ADMIN') return true
    if (currentUserRole === 'MANAGER' && ['REP', 'READ_ONLY'].includes(role)) return true
    return false
  }

  // Check if this is a role upgrade (more permissions)
  const isRoleUpgrade = (newRole: string) => {
    const roleHierarchy = { 'READ_ONLY': 0, 'REP': 1, 'MANAGER': 2, 'ADMIN': 3 }
    return roleHierarchy[newRole as keyof typeof roleHierarchy] > 
           roleHierarchy[user.role as keyof typeof roleHierarchy]
  }

  // Check if this is a role downgrade (fewer permissions)
  const isRoleDowngrade = (newRole: string) => {
    const roleHierarchy = { 'READ_ONLY': 0, 'REP': 1, 'MANAGER': 2, 'ADMIN': 3 }
    return roleHierarchy[newRole as keyof typeof roleHierarchy] < 
           roleHierarchy[user.role as keyof typeof roleHierarchy]
  }

  async function handleSubmit(data: FormData) {
    if (!canAssignRole(data.role)) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(data)
      onClose()
    } catch (error) {
      console.error('Failed to change user role:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Change User Role
        </DialogTitle>
        <DialogDescription>
          Update the role and permissions for {user.name || user.email}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Current Role Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Current Role</h4>
              <Badge className={`${currentRoleConfig?.color} px-3 py-1`}>
                {currentRoleConfig?.label || user.role}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{currentRoleConfig?.description}</p>
          </div>

          <Separator />

          {/* Role Selection */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">New Role</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value)
                    setSelectedRole(value)
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(roleConfig).map(([key, config]) => {
                      const Icon = config.icon
                      const isDisabled = !canAssignRole(key)
                      
                      return (
                        <SelectItem 
                          key={key} 
                          value={key}
                          disabled={isDisabled}
                          className={isDisabled ? 'opacity-50' : ''}
                        >
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-2" />
                            <span>{config.label}</span>
                            {isDisabled && (
                              <span className="ml-2 text-xs text-gray-500">(No permission)</span>
                            )}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Selected Role Details */}
          {selectedRole && selectedRole !== user.role && (
            <div className="space-y-4">
              <div className={`border rounded-lg p-4 ${selectedRoleConfig?.color.replace('bg-', 'border-')}`}>
                <div className="flex items-center mb-3">
                  {selectedRoleConfig && (
                    <selectedRoleConfig.icon className="h-5 w-5 mr-2" />
                  )}
                  <h4 className="font-medium text-lg">{selectedRoleConfig?.label}</h4>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  {selectedRoleConfig?.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Permissions</h5>
                    <ul className="space-y-1">
                      {selectedRoleConfig?.permissions.map((permission, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Important Notes</h5>
                    <ul className="space-y-1">
                      {selectedRoleConfig?.warnings.map((warning, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Role Change Warnings */}
              {isRoleUpgrade(selectedRole) && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    <strong>Role Upgrade:</strong> This user will gain additional permissions and access to more sensitive data. 
                    Make sure this change is authorized and necessary.
                  </AlertDescription>
                </Alert>
              )}

              {isRoleDowngrade(selectedRole) && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <strong>Role Downgrade:</strong> This user will lose some current permissions. 
                    They may no longer be able to access certain features or data they previously could.
                  </AlertDescription>
                </Alert>
              )}

              {selectedRole === 'ADMIN' && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    <strong>Administrator Access:</strong> This role grants full system access, including the ability to 
                    manage other administrators, access all data, and modify system settings. Use with extreme caution.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Permission Check Warning */}
          {selectedRole && !canAssignRole(selectedRole) && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                You don't have permission to assign the "{selectedRoleConfig?.label}" role. 
                {currentUserRole === 'MANAGER' ? ' You can only assign Rep and Read Only roles.' : ' Contact an administrator for assistance.'}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || selectedRole === user.role || !canAssignRole(selectedRole)}
              className="min-w-[100px]"
            >
              {isSubmitting ? 'Changing...' : 'Change Role'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}