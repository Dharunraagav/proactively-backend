export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
          <p className="mt-2 text-gray-600">The page you're looking for doesn't exist or has been moved.</p>
        </div>

        <div className="space-y-4">
          <a
            href="/"
            className="block w-full py-3 px-4 rounded-md text-center font-medium text-white bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  )
}
