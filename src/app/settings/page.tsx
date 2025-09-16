'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Settings, User, Shield, Database, Mail, Bell, Palette, Globe, Save, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface UserSettings {
  profile: {
    name: string
    email: string
    phone?: string
    department?: string
    timezone: string
    language: string
  }
  notifications: {
    emailNotifications: boolean
    dealUpdates: boolean
    leadAssignments: boolean
    activityReminders: boolean
    weeklyReports: boolean
  }
  preferences: {
    defaultView: string
    itemsPerPage: number
    currency: string
    dateFormat: string
  }
}

interface SystemSettings {
  company: {
    name: string
    address: string
    phone: string
    email: string
    website: string
  }
  crm: {
    leadAutoAssignment: boolean
    dealPipelineStages: string[]
    activityTypes: string[]
    requireApproval: boolean
  }
  security: {
    passwordPolicy: {
      minLength: number
      requireSpecialChars: boolean
      requireNumbers: boolean
    }
    sessionTimeout: number
    twoFactorAuth: boolean
  }
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'system'>('profile')
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const currentUser = session?.user
  const isAdmin = currentUser?.role === 'ADMIN'

  useEffect(() => {
    // Load settings data
    setTimeout(() => {
      const mockUserSettings: UserSettings = {
        profile: {
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          phone: '+1-555-0123',
          department: 'Sales',
          timezone: 'America/New_York',
          language: 'en-US'
        },
        notifications: {
          emailNotifications: true,
          dealUpdates: true,
          leadAssignments: true,
          activityReminders: true,
          weeklyReports: false
        },
        preferences: {
          defaultView: 'dashboard',
          itemsPerPage: 25,
          currency: 'USD',
          dateFormat: 'MM/dd/yyyy'
        }
      }

      const mockSystemSettings: SystemSettings = {
        company: {
          name: 'CRM Company Inc.',
          address: '123 Business Ave, Suite 100, City, State 12345',
          phone: '+1-555-0100',
          email: 'info@crmcompany.com',
          website: 'https://crmcompany.com'
        },
        crm: {
          leadAutoAssignment: true,
          dealPipelineStages: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
          activityTypes: ['Call', 'Email', 'Meeting', 'Task', 'Note'],
          requireApproval: false
        },
        security: {
          passwordPolicy: {
            minLength: 8,
            requireSpecialChars: true,
            requireNumbers: true
          },
          sessionTimeout: 480, // 8 hours in minutes
          twoFactorAuth: false
        }
      }

      setUserSettings(mockUserSettings)
      setSystemSettings(mockSystemSettings)
      setLoading(false)
    }, 1000)
  }, [currentUser])

  const handleSaveSettings = async () => {
    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      // Show success message
      alert('Settings saved successfully!')
    }, 1500)
  }

  const updateUserSetting = (section: keyof UserSettings, key: string, value: any) => {
    setUserSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      }
    })
  }

  const updateSystemSetting = (section: keyof SystemSettings, key: string, value: any) => {
    if (!isAdmin) return
    setSystemSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      }
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading settings...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!userSettings) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Settings not available</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and system preferences</p>
          </div>
          
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Settings Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Profile
          </Button>
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('notifications')}
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
          {isAdmin && (
            <Button
              variant={activeTab === 'system' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('system')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              System
            </Button>
          )}
        </div>

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userSettings.profile.name}
                    onChange={(e) => updateUserSetting('profile', 'name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userSettings.profile.email}
                    onChange={(e) => updateUserSetting('profile', 'email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={userSettings.profile.phone || ''}
                    onChange={(e) => updateUserSetting('profile', 'phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={userSettings.profile.department || ''}
                    onChange={(e) => updateUserSetting('profile', 'department', e.target.value)}
                    placeholder="Enter your department"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Regional Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={userSettings.profile.timezone}
                    onValueChange={(value) => updateUserSetting('profile', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={userSettings.profile.language}
                    onValueChange={(value) => updateUserSetting('profile', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="es-ES">Spanish</SelectItem>
                      <SelectItem value="fr-FR">French</SelectItem>
                      <SelectItem value="de-DE">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Current Role</Label>
                  <div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {currentUser?.role?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Display Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Default View</Label>
                    <Select
                      value={userSettings.preferences.defaultView}
                      onValueChange={(value) => updateUserSetting('preferences', 'defaultView', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="contacts">Contacts</SelectItem>
                        <SelectItem value="leads">Leads</SelectItem>
                        <SelectItem value="deals">Deals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Items Per Page</Label>
                    <Select
                      value={userSettings.preferences.itemsPerPage.toString()}
                      onValueChange={(value) => updateUserSetting('preferences', 'itemsPerPage', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={userSettings.preferences.currency}
                      onValueChange={(value) => updateUserSetting('preferences', 'currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Button
                    variant={userSettings.notifications.emailNotifications ? "default" : "outline"}
                    onClick={() => updateUserSetting('notifications', 'emailNotifications', !userSettings.notifications.emailNotifications)}
                  >
                    {userSettings.notifications.emailNotifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Deal Updates</h4>
                    <p className="text-sm text-gray-500">Notifications when deals are updated</p>
                  </div>
                  <Button
                    variant={userSettings.notifications.dealUpdates ? "default" : "outline"}
                    onClick={() => updateUserSetting('notifications', 'dealUpdates', !userSettings.notifications.dealUpdates)}
                  >
                    {userSettings.notifications.dealUpdates ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Lead Assignments</h4>
                    <p className="text-sm text-gray-500">Notifications when leads are assigned to you</p>
                  </div>
                  <Button
                    variant={userSettings.notifications.leadAssignments ? "default" : "outline"}
                    onClick={() => updateUserSetting('notifications', 'leadAssignments', !userSettings.notifications.leadAssignments)}
                  >
                    {userSettings.notifications.leadAssignments ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Activity Reminders</h4>
                    <p className="text-sm text-gray-500">Reminders for upcoming activities</p>
                  </div>
                  <Button
                    variant={userSettings.notifications.activityReminders ? "default" : "outline"}
                    onClick={() => updateUserSetting('notifications', 'activityReminders', !userSettings.notifications.activityReminders)}
                  >
                    {userSettings.notifications.activityReminders ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Reports</h4>
                    <p className="text-sm text-gray-500">Receive weekly performance summaries</p>
                  </div>
                  <Button
                    variant={userSettings.notifications.weeklyReports ? "default" : "outline"}
                    onClick={() => updateUserSetting('notifications', 'weeklyReports', !userSettings.notifications.weeklyReports)}
                  >
                    {userSettings.notifications.weeklyReports ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Settings (Admin Only) */}
        {activeTab === 'system' && isAdmin && systemSettings && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={systemSettings.company.name}
                      onChange={(e) => updateSystemSetting('company', 'name', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Company Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={systemSettings.company.email}
                      onChange={(e) => updateSystemSetting('company', 'email', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Company Phone</Label>
                    <Input
                      id="companyPhone"
                      value={systemSettings.company.phone}
                      onChange={(e) => updateSystemSetting('company', 'phone', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite">Website</Label>
                    <Input
                      id="companyWebsite"
                      value={systemSettings.company.website}
                      onChange={(e) => updateSystemSetting('company', 'website', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Input
                    id="companyAddress"
                    value={systemSettings.company.address}
                    onChange={(e) => updateSystemSetting('company', 'address', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Require 2FA for all user logins</p>
                  </div>
                  <Button
                    variant={systemSettings.security.twoFactorAuth ? "default" : "outline"}
                    onClick={() => updateSystemSetting('security', 'twoFactorAuth', !systemSettings.security.twoFactorAuth)}
                  >
                    {systemSettings.security.twoFactorAuth ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Password Length</Label>
                    <Select
                      value={systemSettings.security.passwordPolicy.minLength.toString()}
                      onValueChange={(value) => updateSystemSetting('security', 'passwordPolicy', {
                        ...systemSettings.security.passwordPolicy,
                        minLength: parseInt(value)
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 characters</SelectItem>
                        <SelectItem value="8">8 characters</SelectItem>
                        <SelectItem value="10">10 characters</SelectItem>
                        <SelectItem value="12">12 characters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Select
                      value={systemSettings.security.sessionTimeout.toString()}
                      onValueChange={(value) => updateSystemSetting('security', 'sessionTimeout', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CRM Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-assign Leads</h4>
                      <p className="text-sm text-gray-500">Automatically assign new leads to sales reps</p>
                    </div>
                    <Button
                      variant={systemSettings.crm.leadAutoAssignment ? "default" : "outline"}
                      onClick={() => updateSystemSetting('crm', 'leadAutoAssignment', !systemSettings.crm.leadAutoAssignment)}
                    >
                      {systemSettings.crm.leadAutoAssignment ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Require Approval</h4>
                      <p className="text-sm text-gray-500">Require manager approval for large deals</p>
                    </div>
                    <Button
                      variant={systemSettings.crm.requireApproval ? "default" : "outline"}
                      onClick={() => updateSystemSetting('crm', 'requireApproval', !systemSettings.crm.requireApproval)}
                    >
                      {systemSettings.crm.requireApproval ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}