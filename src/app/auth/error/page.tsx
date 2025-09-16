'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The verification link is invalid or has expired.',
  Default: 'An unexpected error occurred during authentication.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  const errorMessage = errorMessages[error || 'Default'] || errorMessages.Default

  const handleReturnToSignIn = () => {
    router.push('/auth/signin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mt-4">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-gray-600">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleReturnToSignIn}
              className="w-full"
            >
              Return to Sign In
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                If the problem persists, please contact support.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}