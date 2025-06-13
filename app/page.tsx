import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Proactively</h1>
          <p className="mt-2 text-gray-600">Medicine Beyond Medications</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium"
            asChild
          >
            <Link href="/login">Sign In</Link>
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 border-orange-300 text-orange-700 hover:bg-orange-50"
            asChild
          >
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>

        {/* Quick Access */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Already have an account?</p>
          <Button variant="link" className="text-orange-600 hover:text-orange-500" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            We use Cookies to enhance your browsing experience and analyse our traffic. By clicking "Accept", you
            consent to this.{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Learn more
            </Link>
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              Decline
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
