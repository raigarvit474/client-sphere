'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Shield,
  User,
  Users,
  Eye,
  Mail,
  Calendar,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  Phone,
  MapPin,
  Building2,
  FileText
} from 'lucide-react'

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

interface ViewUserDialogProps {
  user: User
  onClose: () => void
}

const roleIcons = {
  ADMIN: Shield,
  MANAGER: Users,
  REP: User,
  READ_ONLY: Eye
}

const roleColors = {
  ADMIN: 'bg-red-100 text-red-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  REP: 'bg-green-100 text-green-800',
  READ_ONLY: 'bg-gray-100 text-gray-800'
}

const roleDescriptions = {
  ADMIN: 'Full access to all features and settings',
  MANAGER: 'Team management and reporting access',
  REP: 'Access to leads, deals, and activities',
  READ_ONLY: 'View-only access to data'
}

const rolePermissions = {
  ADMIN: ['All permissions', 'User management', 'System settings', 'Data export'],
  MANAGER: ['Team management', 'Reports & Analytics', 'Lead assignment', 'View all data'],
  REP: ['Own leads & deals', 'Activities', 'Contact management', 'Basic reporting'],
  READ_ONLY: ['View contacts', 'View reports', 'No editing rights', 'Limited access']
}

export function ViewUserDialog({ user, onClose }: ViewUserDialogProps) {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const RoleIcon = roleIcons[user.role as keyof typeof roleIcons]
  const roleColor = roleColors[user.role as keyof typeof roleColors]
  const roleDescription = roleDescriptions[user.role as keyof typeof roleDescriptions]
  const permissions = rolePermissions[user.role as keyof typeof rolePermissions]

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center text-xl font-semibold">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
            {user.image ? (
              <img
                className="h-8 w-8 rounded-full"
                src={user.image}
                alt={user.name || user.email}
              />
            ) : (
              <span className="text-sm font-medium text-gray-500">
                {(user.name || user.email).substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          {user.name || 'User Profile'}
        </DialogTitle>
        <DialogDescription>
          User account details and system access information
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Status and Role Overview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {RoleIcon && <RoleIcon className="h-6 w-6 text-gray-600" />}
            <Badge className={`${roleColor} px-3 py-1`}>
              {user.role.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center">
            {user.isActive ? (
              <Badge className="bg-green-100 text-green-800 px-3 py-1">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800 px-3 py-1">
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* User Information */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <User className="h-5 w-5 mr-2" />
            User Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-700">Full Name</span>
              </div>
              <p className="text-gray-600">{user.name || 'Not provided'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-700">Email Address</span>
              </div>
              <p className="text-gray-600">{user.email}</p>
              {user.emailVerified && (
                <div className="flex items-center mt-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">Verified</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-700">Member Since</span>
              </div>
              <p className="text-gray-600">{formatDate(user.createdAt)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-700">Last Updated</span>
              </div>
              <p className="text-gray-600">{formatDateTime(user.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Role & Permissions */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Role & Permissions
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              {RoleIcon && <RoleIcon className="h-5 w-5 mr-2" />}
              <span className="font-medium text-lg">{user.role.replace('_', ' ')}</span>
              <Badge variant="secondary" className={`ml-2 ${roleColor}`}>
                {user.role}
              </Badge>
            </div>
            <p className="text-gray-700 mb-3">{roleDescription}</p>
            
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Permissions included:</p>
              <div className="grid grid-cols-2 gap-2">
                {permissions.map((permission, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700">
                    <CheckCircle2 className="h-3 w-3 text-green-500 mr-2" />
                    {permission}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        {user._count && (
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Activity Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{user._count.ownedContacts}</div>
                <div className="text-sm text-blue-700">Contacts</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{user._count.ownedLeads}</div>
                <div className="text-sm text-green-700">Leads</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{user._count.ownedDeals}</div>
                <div className="text-sm text-purple-700">Deals</div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{user._count.activities}</div>
                <div className="text-sm text-orange-700">Activities</div>
              </div>
            </div>
          </div>
        )}

        {/* Account Status Details */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Account Status
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-medium text-gray-700">Status</span>
                </div>
                <p className={`text-sm ${user.isActive ? 'text-green-700' : 'text-red-700'}`}>
                  {user.isActive ? 'Active - Can log in and access the system' : 'Inactive - Login disabled'}
                </p>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <Mail className="h-3 w-3 mr-2 text-gray-500" />
                  <span className="font-medium text-gray-700">Email Verification</span>
                </div>
                <p className={`text-sm ${user.emailVerified ? 'text-green-700' : 'text-gray-700'}`}>
                  {user.emailVerified ? 'Email verified' : 'Email not verified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4">
          <h4 className="font-medium flex items-center mb-3">
            <FileText className="h-4 w-4 mr-2" />
            System Information
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">User ID</p>
              <p className="font-mono text-xs text-gray-800">{user.id}</p>
            </div>
            <div>
              <p className="text-gray-600">Role</p>
              <p className="font-medium text-gray-800">{user.role}</p>
            </div>
            <div>
              <p className="text-gray-600">Account Created</p>
              <p className="font-medium text-gray-800">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Modified</p>
              <p className="font-medium text-gray-800">{formatDate(user.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  )
}