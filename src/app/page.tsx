'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BarChart3, Users, Target, Handshake, Calendar, Shield, Zap, Star, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-blue-600 rounded-2xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Next-Gen <span className="text-blue-600">CRM</span> System
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your sales process, manage customer relationships, and grow your business with our comprehensive CRM solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="h-14 px-8 text-lg">
                <Link href="/auth/signin" className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg">
                <Link href="#features">
                  Learn More
                </Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-600">Companies Trust Us</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-600">99.9%</div>
                <div className="text-sm text-gray-600">Uptime SLA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-orange-600">50M+</div>
                <div className="text-sm text-gray-600">Records Managed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Scale Your Sales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help your team close more deals and build stronger customer relationships.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Contact Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Centralize all customer information, track interactions, and manage relationships with powerful contact management tools.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Lead Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Track prospects through your sales funnel with customizable stages, automated workflows, and conversion tracking.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Handshake className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Deal Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Manage opportunities with value tracking, probability assessment, and pipeline visualization for maximum revenue.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Activity Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Log calls, meetings, emails, and tasks with priority levels, due dates, and completion tracking.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get actionable insights with comprehensive reporting, performance metrics, and sales analytics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Security & Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Role-based access control with Admin, Manager, Sales Rep, and Read-Only permissions for data security.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Try It Out - Demo Accounts
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Experience the full power of our CRM with these pre-configured accounts. No setup required!
          </p>
          
          <Card className="bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Demo Credentials
              </CardTitle>
              <CardDescription className="text-base">
                Use any of these accounts to explore the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div className="font-semibold text-red-700 mb-1">Admin</div>
                  <div className="text-sm text-gray-700 mb-1">admin@crm.com</div>
                  <div className="text-xs text-gray-500">password123</div>
                  <div className="text-xs text-red-600 mt-2 font-medium">Full Access</div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div className="font-semibold text-blue-700 mb-1">Manager</div>
                  <div className="text-sm text-gray-700 mb-1">manager@crm.com</div>
                  <div className="text-xs text-gray-500">password123</div>
                  <div className="text-xs text-blue-600 mt-2 font-medium">Team Management</div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div className="font-semibold text-green-700 mb-1">Sales Rep</div>
                  <div className="text-sm text-gray-700 mb-1">rep1@crm.com</div>
                  <div className="text-xs text-gray-500">password123</div>
                  <div className="text-xs text-green-600 mt-2 font-medium">Sales & Leads</div>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                    <Handshake className="h-4 w-4 text-white" />
                  </div>
                  <div className="font-semibold text-purple-700 mb-1">Rep 2</div>
                  <div className="text-sm text-gray-700 mb-1">rep2@crm.com</div>
                  <div className="text-xs text-gray-500">password123</div>
                  <div className="text-xs text-purple-600 mt-2 font-medium">Deals & Activities</div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t">
                <Button asChild size="lg" className="h-12 px-8">
                  <Link href="/auth/signin" className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Start Your Demo Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">CRM System</span>
              </div>
              <p className="text-gray-400 mb-4">
                The most comprehensive CRM solution for modern businesses. Built with Next.js, designed for scale.
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-400">Production Ready</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Contact Management</li>
                <li>Lead Pipeline</li>
                <li>Deal Tracking</li>
                <li>Activity Management</li>
                <li>Analytics & Reports</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Technology</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Next.js 15</li>
                <li>TypeScript</li>
                <li>PostgreSQL</li>
                <li>NextAuth.js</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 CRM System. Built with ❤️ using modern web technologies.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
