"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, Calendar, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

interface Consultant {
  id: string
  name: string
  specialty: string
  rating: number
  reviews: number
  location: string
  image_url: string | null
  next_available: string
  price: string
  badges: string[]
}

export default function ConsultantsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")

  // Booking state
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [bookingNotes, setBookingNotes] = useState("")
  const [bookingStatus, setBookingStatus] = useState<{ success?: boolean; message: string } | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    fetchConsultants()
  }, [])

  const fetchConsultants = async () => {
    try {
      const { data, error } = await supabase.from("consultants").select("*").order("rating", { ascending: false })

      if (error) throw error
      setConsultants(data || [])
    } catch (error) {
      console.error("Error fetching consultants:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConsultants = consultants.filter((consultant) => {
    const matchesSearch =
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation =
      locationFilter === "" || consultant.location.toLowerCase().includes(locationFilter.toLowerCase())
    return matchesSearch && matchesLocation
  })

  const handleBookNow = (consultant: Consultant) => {
    setSelectedConsultant(consultant)
    setBookingOpen(true)
    setBookingStatus(null)

    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setBookingDate(format(tomorrow, "yyyy-MM-dd"))

    // Set default time
    setBookingTime("10:00")
  }

  const handleBookingSubmit = async () => {
    if (!user || !selectedConsultant) return

    setBookingLoading(true)
    setBookingStatus(null)

    try {
      console.log("Creating appointment with data:", {
        user_id: user.id,
        consultant_id: selectedConsultant.id,
        date: bookingDate,
        time: bookingTime,
        notes: bookingNotes,
      })

      // Create appointment in database
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          consultant_id: selectedConsultant.id,
          date: bookingDate,
          time: bookingTime,
          status: "scheduled",
          notes: bookingNotes,
          created_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      console.log("Appointment created:", data)

      setBookingStatus({
        success: true,
        message: `Appointment successfully booked with ${selectedConsultant.name} on ${new Date(bookingDate).toLocaleDateString()} at ${bookingTime}`,
      })

      // Reset form after successful booking
      setTimeout(() => {
        setBookingOpen(false)
        setSelectedConsultant(null)
        setBookingDate("")
        setBookingTime("")
        setBookingNotes("")
        setBookingStatus(null)

        // Refresh the dashboard to show the new appointment
        router.refresh()

        // Redirect to dashboard to see the appointment alert
        router.push("/dashboard")
      }, 3000)
    } catch (error: any) {
      console.error("Error booking appointment:", error)
      setBookingStatus({
        success: false,
        message: `Error booking appointment: ${error.message || "Please try again"}`,
      })
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Consultants</h1>
        <p className="text-gray-600">Connect with board-certified lifestyle medicine doctors.</p>
      </div>

      {/* Search Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Specialty, doctor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="City, state, or zipcode"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10 h-12 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>
            <Button className="h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Consultants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredConsultants.map((consultant) => (
          <Card key={consultant.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <Image
                  src={consultant.image_url || "/placeholder.svg?height=80&width=80"}
                  alt={consultant.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{consultant.name}</h3>
                  <p className="text-orange-600 font-medium">{consultant.specialty}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium ml-1">{consultant.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({consultant.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {consultant.location}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {consultant.badges.map((badge) => (
                  <Badge key={badge} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  Next: {consultant.next_available}
                </div>
                <span className="font-semibold text-lg text-gray-900">{consultant.price}</span>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  View Profile
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                  onClick={() => handleBookNow(consultant)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredConsultants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No consultants found matching your criteria.</p>
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book an Appointment</DialogTitle>
            {/* Fix: Use div instead of p to avoid nesting p elements */}
            <DialogDescription>
              {selectedConsultant && (
                <div className="flex items-center space-x-3 mt-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-medium">{selectedConsultant.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-medium">{selectedConsultant.name}</div>
                    <div className="text-sm text-gray-500">{selectedConsultant.specialty}</div>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {bookingStatus && (
            <Alert variant={bookingStatus.success ? "default" : "destructive"} className="mb-4">
              <AlertDescription>{bookingStatus.message}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="mt-1"
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Select value={bookingTime} onValueChange={setBookingTime}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any specific concerns or questions for the doctor?"
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBookingSubmit}
              disabled={!bookingDate || !bookingTime || bookingLoading}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
            >
              {bookingLoading ? "Booking..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
