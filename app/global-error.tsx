"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8 p-8 text-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Something went wrong!</h1>
              <p className="mt-2 text-gray-600">We apologize for the inconvenience.</p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => reset()}
                className="block w-full py-3 px-4 rounded-md text-center font-medium text-white bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              >
                Try again
              </button>
              <a
                href="/"
                className="block w-full py-3 px-4 rounded-md text-center font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Return to Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
