'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle } from 'lucide-react'

interface Contact {
  id: string
  firstName: string
  lastName: string
  company?: string
  leads?: number
  deals?: number
  activities?: number
}

interface DeleteContactDialogProps {
  contact: Contact | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (contactId: string) => Promise<void>
}

export function DeleteContactDialog({
  contact,
  open,
  onOpenChange,
  onConfirm
}: DeleteContactDialogProps) {
  const [deleting, setDeleting] = useState(false)

  if (!contact) return null

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await onConfirm(contact.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting contact:', error)
    } finally {
      setDeleting(false)
    }
  }

  const fullName = `${contact.firstName} ${contact.lastName}`
  const hasRelatedRecords = (contact.leads && contact.leads > 0) || 
                           (contact.deals && contact.deals > 0) || 
                           (contact.activities && contact.activities > 0)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Contact
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div>
              Are you sure you want to delete <strong>{fullName}</strong>
              {contact.company && ` from ${contact.company}`}?
            </div>
            
            {hasRelatedRecords && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <div className="font-medium">Warning: This contact has related records</div>
                    <div className="mt-1 space-y-1">
                      {contact.leads && contact.leads > 0 && (
                        <div>• {contact.leads} lead{contact.leads > 1 ? 's' : ''}</div>
                      )}
                      {contact.deals && contact.deals > 0 && (
                        <div>• {contact.deals} deal{contact.deals > 1 ? 's' : ''}</div>
                      )}
                      {contact.activities && contact.activities > 0 && (
                        <div>• {contact.activities} activit{contact.activities > 1 ? 'ies' : 'y'}</div>
                      )}
                    </div>
                    <div className="mt-2 text-xs">
                      These records will remain but will no longer be associated with this contact.
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              This action cannot be undone.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? 'Deleting...' : 'Delete Contact'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}