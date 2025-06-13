"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, MapPin, CreditCard, Calendar, Clock, Star, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface Appointment {
  id: string
  date: string
  time: string
  status: string
  consultant: {
    name: string
    specialty: string
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAppointments()
    }
  }, [user])

  const fetchAppointments = async () => {
    try {
      console.log("Fetching appointments for user:", user?.id)
      // Get appointments with consultant details
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id, date, time, status,
          consultant:consultants!consultant_id (name, specialty)
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: true })
        .limit(3)

      if (error) {
        console.error("Error fetching appointments:", error)
        throw error
      }

      console.log("Appointments data:", data)
      setAppointments(data || [])
    } catch (error) {
      console.error("Error in fetchAppointments:", error)
    } finally {
      setLoading(false)
    }
  }

  // Check if there's an upcoming appointment in the next 2 days
  const hasUpcomingAppointment = () => {
    if (!appointments.length) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to beginning of day for accurate comparison

    const twoDaysFromNow = new Date(today)
    twoDaysFromNow.setDate(today.getDate() + 2)
    twoDaysFromNow.setHours(23, 59, 59, 999) // Set to end of day for accurate comparison

    console.log("Today:", today.toISOString())
    console.log("Two days from now:", twoDaysFromNow.toISOString())

    return appointments.some((appointment) => {
      const appointmentDate = new Date(appointment.date)
      appointmentDate.setHours(0, 0, 0, 0) // Set to beginning of day for accurate comparison

      console.log("Appointment date:", appointmentDate.toISOString())
      console.log("Is within range:", appointmentDate >= today && appointmentDate <= twoDaysFromNow)

      return appointmentDate >= today && appointmentDate <= twoDaysFromNow
    })
  }

  // Get the next appointment
  const getNextAppointment = () => {
    if (!appointments.length) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to beginning of day for accurate comparison

    const futureAppointments = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date)
      appointmentDate.setHours(0, 0, 0, 0) // Set to beginning of day for accurate comparison
      return appointmentDate >= today
    })

    return futureAppointments.length > 0 ? futureAppointments[0] : null
  }

  const nextAppointment = getNextAppointment()
  const showUpcomingAlert = hasUpcomingAppointment()

  console.log("Next appointment:", nextAppointment)
  console.log("Show upcoming alert:", showUpcomingAlert)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>

              {/* Navigation breadcrumb */}
              <nav className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
                <span>Home</span>
                <span>/</span>
                <span className="text-orange-600">Dashboard</span>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome back, {user?.user_metadata?.first_name || "User"}!</span>
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Appointment Alert */}
      {showUpcomingAlert && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <Alert className="bg-orange-50 border-orange-200">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">Upcoming Appointment</AlertTitle>
            <AlertDescription className="text-orange-700">
              You have an appointment scheduled within the next 2 days. Please be prepared!
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content - Original Proactively Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                  alt="Person doing yoga outdoors"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1506629805607-d405b7a30db4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                  alt="Person doing beach yoga"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                  alt="Couple cooking healthy food"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                  alt="Person swimming"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-purple-600 font-medium">Medicine Beyond Medications.</p>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Book an appointment with{" "}
                <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  Lifestyle Medicine
                </span>{" "}
                doctors
              </h1>
              <p className="text-gray-600 text-lg">
                Find a board-certified doctor in your network to see if you're a candidate for reversing diabetes,
                hypertension, obesity, and more.
              </p>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Specialty, doctor..."
                    className="pl-10 h-12 border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="City, state, or zipcode"
                    className="pl-10 h-12 border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Insurance carrier"
                    className="pl-10 h-12 border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dashboard/consultants">
                  <Button className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-black font-medium h-12 px-8">
                    Search
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Health Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Next Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                {nextAppointment ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      <span className="text-lg font-semibold">
                        {new Date(nextAppointment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {nextAppointment.consultant?.name || "Doctor"} at {nextAppointment.time}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-lg font-semibold text-gray-500">No appointments</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      <Link href="/dashboard/consultants" className="text-orange-500 hover:underline">
                        Book an appointment
                      </Link>
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg font-semibold">8.5/10</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Excellent progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <span className="text-lg font-semibold">3 Plans</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Nutrition, Exercise, Sleep</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Activity</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {appointments.length > 0 ? (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Appointment Scheduled</p>
                      <p className="text-sm text-gray-500">
                        With {appointments[0].consultant?.name || "Doctor"} on{" "}
                        {new Date(appointments[0].date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Recently</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">No Recent Appointments</p>
                      <p className="text-sm text-gray-500">
                        <Link href="/dashboard/consultants" className="text-orange-500 hover:underline">
                          Book your first appointment
                        </Link>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Health Score Updated</p>
                    <p className="text-sm text-gray-500">Your score improved to 8.5/10</p>
                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
