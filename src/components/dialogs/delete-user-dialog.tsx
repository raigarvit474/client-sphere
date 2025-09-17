'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { 
  AlertTriangle, 
  UserX, 
  Database, 
  Users,
  FileText,
  User,
  ExternalLink,
  ShieldAlert,
  Trash2
} from 'lucide-react'

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
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'

const formSchema = z.object({
  confirmationText: z.string().min(1, 'Please type DELETE to confirm'),
  transferUserId: z.string().optional(),
  understoodConsequences: z.boolean().refine(val => val === true, {
    message: 'You must acknowledge the consequences'
  }),
}).refine((data) => {
  return data.confirmationText.toUpperCase() === 'DELETE'
}, {
  message: 'Please type "DELETE" exactly to confirm',
  path: ['confirmationText']
})

type FormData = z.infer<typeof formSchema>

interface User {
  id: string
  name?: string
  email: string
  image?: string
  role: string
  isActive: boolean
  createdAt: string
  _count?: {
    ownedContacts: number
    ownedLeads: number
    ownedDeals: number
    activities: number
    createdActivities?: number
  }
}

interface DeleteUserDialogProps {
  user: User
  currentUserRole: string
  availableUsers?: Array<{
    id: string
    name?: string
    email: string
    role: string
  }>
  onDelete: (data: FormData) => Promise<void>
  onClose: () => void
}

export function DeleteUserDialog({
  user,
  currentUserRole,
  availableUsers = [],
  onDelete,
  onClose,
}: DeleteUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirmationText: '',
      transferUserId: undefined,
      understoodConsequences: false,
    },
  })

  // Check if current user can delete this user
  const canDeleteUser = () => {
    if (currentUserRole === 'ADMIN') return true
    if (currentUserRole === 'MANAGER' && ['REP', 'READ_ONLY'].includes(user.role)) return true
    return false
  }

  // Check if user has data that needs to be handled
  const hasOwnedData = () => {
    if (!user._count) return false
    return user._count.ownedContacts > 0 || 
           user._count.ownedLeads > 0 || 
           user._count.ownedDeals > 0 ||
           user._count.activities > 0
  }

  // Get suitable users for data transfer
  const transferableUsers = availableUsers.filter(u => 
    u.id !== user.id && 
    ['ADMIN', 'MANAGER', 'REP'].includes(u.role)
  )

  async function handleSubmit(data: FormData) {
    if (!canDeleteUser()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onDelete(data)
      onClose()
    } catch (error) {
      console.error('Failed to delete user:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canDeleteUser()) {
    return (
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <ShieldAlert className="h-5 w-5 mr-2" />
            Access Denied
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              You don't have permission to delete this user. Contact an administrator for assistance.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center text-red-600">
          <UserX className="h-5 w-5 mr-2" />
          Delete User Account
        </DialogTitle>
        <DialogDescription>
          This action cannot be undone. Please review the details carefully before proceeding.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* User Information */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
              {user.image ? (
                <img
                  className="h-10 w-10 rounded-full"
                  src={user.image}
                  alt={user.name || user.email}
                />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {(user.name || user.email).substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-medium text-red-900">
                {user.name || 'Unnamed User'}
              </h3>
              <p className="text-sm text-red-700">{user.email}</p>
              <Badge className="mt-1 bg-red-100 text-red-800">
                {user.role.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Data Impact Analysis */}
        {hasOwnedData() && user._count && (
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center text-orange-700">
              <Database className="h-5 w-5 mr-2" />
              Data Impact
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 mb-3">
                This user owns data that will be affected by deletion:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-700">{user._count.ownedContacts}</div>
                  <div className="text-sm text-orange-600">Contacts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-700">{user._count.ownedLeads}</div>
                  <div className="text-sm text-orange-600">Leads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-700">{user._count.ownedDeals}</div>
                  <div className="text-sm text-orange-600">Deals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-700">{user._count.activities}</div>
                  <div className="text-sm text-orange-600">Activities</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Data Transfer Option */}
            {hasOwnedData() && transferableUsers.length > 0 && (
              <FormField
                control={form.control}
                name="transferUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Transfer Data To (Optional)
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user to transfer data to" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NONE">Don't transfer (data will be unassigned)</SelectItem>
                        {transferableUsers.map((transferUser) => (
                          <SelectItem key={transferUser.id} value={transferUser.id}>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              <span>{transferUser.name || transferUser.email}</span>
                              <Badge variant="secondary" className="ml-2">
                                {transferUser.role}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      If selected, all contacts, leads, deals, and activities owned by this user 
                      will be transferred to the selected user. Otherwise, they will be left unassigned.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Consequences Acknowledgment */}
            <FormField
              control={form.control}
              name="understoodConsequences"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I understand the consequences of deleting this user
                    </FormLabel>
                    <FormDescription>
                      This includes permanent removal of the user account and potential data impacts.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Confirmation Input */}
            <FormField
              control={form.control}
              name="confirmationText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Type "DELETE" to confirm
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Type DELETE here"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    This action cannot be undone. Please type DELETE to confirm deletion.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Warning Messages */}
            <div className="space-y-3">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <strong>Warning:</strong> This action is permanent and cannot be undone. 
                  The user account and all associated authentication data will be permanently deleted.
                </AlertDescription>
              </Alert>

              {hasOwnedData() && (
                <Alert className="border-orange-200 bg-orange-50">
                  <Database className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    <strong>Data Impact:</strong> This user owns {
                      (user._count?.ownedContacts || 0) + 
                      (user._count?.ownedLeads || 0) + 
                      (user._count?.ownedDeals || 0) + 
                      (user._count?.activities || 0)
                    } records. {form.watch('transferUserId') 
                      ? 'These will be transferred to the selected user.' 
                      : 'These will become unassigned and may affect your team\'s workflow.'
                    }
                  </AlertDescription>
                </Alert>
              )}

              {user.role === 'ADMIN' && (
                <Alert className="border-red-200 bg-red-50">
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    <strong>Administrator Deletion:</strong> You are about to delete an administrator account. 
                    Make sure there are other administrators available to manage the system.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={
                  isSubmitting || 
                  !form.watch('understoodConsequences') ||
                  form.watch('confirmationText').toUpperCase() !== 'DELETE'
                }
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  'Deleting...'
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </div>
    </DialogContent>
  )
}