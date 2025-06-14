"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, UserCog, FileText, Settings, Calendar, LogOut, BarChart3, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Doctors", href: "/admin/doctors", icon: UserCog },
  { name: "Appointments", href: "/admin/appointments", icon: Calendar },
  { name: "Documents", href: "/admin/documents", icon: FileText },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="flex flex-col h-full w-64 bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-white">Proactively</span>
            <span className="text-xs text-gray-400">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:text-white hover:bg-gray-800",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Admin badge */}
      <div className="px-4 py-2">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 rounded-lg">
          <Shield className="h-4 w-4 text-orange-400" />
          <span className="text-xs font-medium text-orange-400">Admin Access</span>
        </div>
      </div>

      {/* User section */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
            </p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
