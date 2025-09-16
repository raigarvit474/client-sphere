import { requireAuth } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import ContactsPageClient from '@/components/pages/contacts-page-client'

export default async function ContactsPage() {
  const user = await requireAuth()

  return (
    <DashboardLayout>
      <ContactsPageClient />
    </DashboardLayout>
  )
}
