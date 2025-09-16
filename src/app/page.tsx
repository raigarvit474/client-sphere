import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function Home() {
  const user = await getCurrentUser()
  
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            CRM System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive Customer Relationship Management built with Next.js
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/signin">
                Sign In to Continue
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔐 Secure Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Role-based access control with Admin, Manager, Sales Rep, and Read-Only permissions
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📞 Contact Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize and track all your customer interactions and contact information
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Lead Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track leads through your sales funnel with customizable stages and statuses
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💼 Deal Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage opportunities with value tracking and probability assessment
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📅 Activity Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Log calls, meetings, emails, and tasks with priority and completion tracking
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Analytics & Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get insights into your sales performance with comprehensive reporting
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Demo Accounts</CardTitle>
            <CardDescription>
              Try the system with these pre-configured accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-white rounded border">
                <div className="font-medium text-red-700">Admin</div>
                <div className="text-gray-600">admin@crm.com</div>
                <div className="text-gray-500">password123</div>
              </div>
              <div className="p-3 bg-white rounded border">
                <div className="font-medium text-blue-700">Manager</div>
                <div className="text-gray-600">manager@crm.com</div>
                <div className="text-gray-500">password123</div>
              </div>
              <div className="p-3 bg-white rounded border">
                <div className="font-medium text-green-700">Sales Rep</div>
                <div className="text-gray-600">rep1@crm.com</div>
                <div className="text-gray-500">password123</div>
              </div>
              <div className="p-3 bg-white rounded border">
                <div className="font-medium text-gray-700">Rep 2</div>
                <div className="text-gray-600">rep2@crm.com</div>
                <div className="text-gray-500">password123</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
